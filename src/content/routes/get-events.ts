import { route, originalFetch } from "@/content/router";
import type { CalendarQueryResult } from "@/types/notion-calendar";
import { INJECTED_CALENDAR_ID } from "@/constants";

interface GetEventsQuery {
  provider: string;
  calendarId?: string;
  [key: string]: unknown;
}

interface GetEventsBody {
  queries: GetEventsQuery[];
}

function hasNotionQuery(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const b = body as GetEventsBody;
  return (
    Array.isArray(b.queries) && b.queries.some((q) => q.provider === "notion")
  );
}

function splitQueries(body: GetEventsBody): {
  injected: GetEventsQuery[];
  real: GetEventsQuery[];
} {
  const injected: GetEventsQuery[] = [];
  const real: GetEventsQuery[] = [];
  for (const q of body.queries) {
    if (q.calendarId === INJECTED_CALENDAR_ID) {
      injected.push(q);
    } else {
      real.push(q);
    }
  }
  return { injected, real };
}

route("/v2/getEvents", async (url, request) => {
  if (!hasNotionQuery(request.body)) return null;

  const body = request.body as GetEventsBody;
  const { injected, real } = splitQueries(body);

  // Forward non-injected queries to Notion
  let realResults: CalendarQueryResult[] = [];
  if (real.length > 0) {
    const response = await originalFetch(url.href, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify({ queries: real }),
    });
    realResults = await response.json();
  }

  // Handle injected calendar queries
  for (const query of injected) {
    console.log(
      `[notion-cal] Serving injected calendar events for ${INJECTED_CALENDAR_ID}`,
    );
    realResults.push({
      accountId: query.accountId,
      calendarId: INJECTED_CALENDAR_ID,
      events: [
        {
          provider: "notion",
          kind: "calendar#event",
          organizer: { self: true },
          sequence: 1,
          id: "injected-mock-event-0001",
          accountId: query.accountId,
          calendarId: INJECTED_CALENDAR_ID,
          summary: "Mock Apple Reminder",
          start: {
            dateTime: "2026-03-14T10:00:00-04:00",
            timeZone: "America/Toronto",
          },
          end: {
            dateTime: "2026-03-14T10:00:00-04:00",
            timeZone: "America/Toronto",
          },
          created: "2026-03-13T00:00:00.000Z",
          updated: "2026-03-13T00:00:00.000Z",
          notionUrl: "",
          notionTitleHasRichText: false,
          notionPage: {
            properties: {
              Date: {
                id: "I%5Bbb",
                type: "date",
                date: {
                  start: "2026-03-14T14:00:00.000+00:00",
                  end: null,
                  time_zone: null,
                },
              },
              Status: {
                id: "Mx%60b",
                type: "status",
                status: {
                  id: "b529b488-f478-4118-8fc4-4084491a9731",
                  name: "Incomplete",
                  color: "default",
                },
              },
              Priority: {
                id: "tbMz",
                type: "select",
                select: {
                  id: "9f9f21b9-9f4a-472d-9884-aebfd82a0c30",
                  name: "0",
                  color: "green",
                },
              },
              Name: {
                id: "title",
                type: "title",
                title: [
                  {
                    type: "text",
                    text: { content: "Mock Apple Reminder", link: null },
                    annotations: {
                      bold: false,
                      italic: false,
                      strikethrough: false,
                      underline: false,
                      code: false,
                      color: "default",
                    },
                    plain_text: "Mock Apple Reminder",
                    href: null,
                  },
                ],
              },
            },
          },
        },
      ],
    });
  }

  return new Response(JSON.stringify(realResults), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
