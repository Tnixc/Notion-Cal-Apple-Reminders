import { route, originalFetch } from "@/content/router";
import type { CalendarQueryResult } from "@/types/notion-calendar";
import type { AppleReminder } from "@/types/apple-reminders";
import { INJECTED_CALENDAR_ID, STATUS_IDS, PRIORITY_ID } from "@/constants";
import { fetchReminders } from "@/content/reminders";

interface GetEventsQuery {
  provider: string;
  accountId: string;
  calendarId?: string;
  [key: string]: unknown;
}

interface GetEventsBody {
  queries: GetEventsQuery[];
}

function hasNotionQuery(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const b = body as GetEventsBody;
  return Array.isArray(b.queries) && b.queries.some((q) => q.provider === "notion");
}

function toNotionEvent(reminder: AppleReminder, accountId: string) {
  const now = new Date().toISOString();
  const dueDate = reminder.dueDate ? new Date(reminder.dueDate) : new Date();
  const isoDate = dueDate.toISOString();
  const tzOffset = dueDate.getTimezoneOffset();
  const sign = tzOffset <= 0 ? "+" : "-";
  const absH = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, "0");
  const absM = String(Math.abs(tzOffset) % 60).padStart(2, "0");
  const localISO = new Date(dueDate.getTime() - tzOffset * 60000)
    .toISOString()
    .replace("Z", `${sign}${absH}:${absM}`);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    provider: "notion" as const,
    kind: "calendar#event" as const,
    organizer: { self: true },
    sequence: 1,
    id: `apple-rmdr-${reminder.externalId}`,
    accountId,
    calendarId: INJECTED_CALENDAR_ID,
    summary: reminder.title,
    start: { dateTime: localISO, timeZone: tz },
    end: { dateTime: localISO, timeZone: tz },
    created: now,
    updated: now,
    notionUrl: "",
    notionTitleHasRichText: false,
    notionPage: {
      properties: {
        Date: {
          id: "I%5Bbb",
          type: "date",
          date: { start: isoDate, end: null, time_zone: null },
        },
        Status: {
          id: "Mx%60b",
          type: "status",
          status: {
            id: reminder.isCompleted ? STATUS_IDS.complete : STATUS_IDS.incomplete,
            name: reminder.isCompleted ? "Complete" : "Incomplete",
            color: "default",
          },
        },
        Priority: {
          id: "tbMz",
          type: "select",
          select: {
            id: PRIORITY_ID,
            name: String(reminder.priority),
            color: "green",
          },
        },
        Name: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: { content: reminder.title, link: null },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: "default",
              },
              plain_text: reminder.title,
              href: null,
            },
          ],
        },
      },
    },
  };
}

route("/v2/getEvents", async (url, request) => {
  if (!hasNotionQuery(request.body)) return null;

  const body = request.body as GetEventsBody;

  const response = await originalFetch(url.href, {
    method: request.method,
    headers: request.headers,
    body: JSON.stringify(request.body),
  });

  const data: CalendarQueryResult[] = await response.json();

  const injectedQuery = body.queries.find((q) => q.calendarId === INJECTED_CALENDAR_ID);
  if (injectedQuery) {
    const reminders = await fetchReminders();
    console.log(`[notion-cal] Fetched ${reminders.length} reminders`);

    data.push({
      accountId: injectedQuery.accountId,
      calendarId: INJECTED_CALENDAR_ID,
      events: reminders.map((r) => toNotionEvent(r, injectedQuery.accountId)),
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
