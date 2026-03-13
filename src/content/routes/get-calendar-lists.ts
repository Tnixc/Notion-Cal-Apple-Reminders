import { route, originalFetch } from "@/content/router";
import type { CalendarListResult, NotionCalendar } from "@/types/calendar-list";
import { setNotionCalendar } from "@/content/store";
import { INJECTED_CALENDAR_ID } from "@/constants";

interface CalendarListQuery {
  provider: string;
  [key: string]: unknown;
}

interface CalendarListBody {
  queries: CalendarListQuery[];
}

function hasNotionQuery(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const b = body as CalendarListBody;
  return Array.isArray(b.queries) && b.queries.some((q) => q.provider === "notion");
}

function isNotionAccount(result: CalendarListResult): boolean {
  return result.calendars.length > 0 && result.calendars.every((c) => c.provider === "notion");
}

function makeInjectedCalendar(accountId: string): NotionCalendar {
  return {
    provider: "notion",
    kind: "calendar#timeCollectionView",
    id: INJECTED_CALENDAR_ID,
    accountId,
    accessRole: "writer",
    defaultReminders: [],
    etag: "",
    selected: true,
    summary: "Apple Reminders (Injected)",
    subtitle: "Table",
    notionViewType: "table",
    notionUrl: "",
    notionParentId: "",
    notionCollection: {
      id: "injected-collection",
      properties: {
        Date: {
          id: "I%5Bbb",
          name: "Date",
          description: null,
          type: "date",
          date: {},
        },
        Status: {
          id: "Mx%60b",
          name: "Status",
          description: null,
          type: "status",
          status: {
            options: [
              {
                id: "b529b488-f478-4118-8fc4-4084491a9731",
                name: "Incomplete",
                color: "default",
                description: null,
              },
              {
                id: "f90b1d98-fb26-4d70-8f8e-446a7a79652c",
                name: "Complete",
                color: "green",
                description: null,
              },
            ],
            groups: [
              {
                id: "99446d2e-9079-4d32-92f6-c61c1137ced1",
                name: "To-do",
                color: "gray",
                option_ids: ["b529b488-f478-4118-8fc4-4084491a9731"],
              },
              {
                id: "ee3f9055-9ec3-4eee-a757-a76812c55a49",
                name: "In progress",
                color: "blue",
                option_ids: [],
              },
              {
                id: "5260fb78-fb3d-4b17-9c04-c9efc208238b",
                name: "Complete",
                color: "green",
                option_ids: ["f90b1d98-fb26-4d70-8f8e-446a7a79652c"],
              },
            ],
          },
        },
        Priority: {
          id: "tbMz",
          name: "Priority",
          description: null,
          type: "select",
          select: {
            options: [
              {
                id: "9f9f21b9-9f4a-472d-9884-aebfd82a0c30",
                name: "0",
                color: "green",
                description: null,
              },
            ],
          },
        },
        Name: {
          id: "title",
          name: "Name",
          description: null,
          type: "title",
          title: {},
        },
      },
      propertyFormat: [
        { property: "title", visible: true },
        { property: "I%5Bbb", visible: true },
        { property: "tbMz", visible: true },
        { property: "Mx%60b", visible: true },
      ],
      propertyVisibilityFormat: [
        { property: "I%5Bbb", visibility: "show" },
        { property: "tbMz", visibility: "show" },
        { property: "Mx%60b", visibility: "show" },
      ],
      timePropertyId: "I%5Bbb",
      availableViews: [
        {
          id: INJECTED_CALENDAR_ID,
          collectionId: "injected-collection",
          name: "Table",
          type: "table",
        },
      ],
    },
  };
}

route("/v2/getCalendarLists", async (url, request) => {
  if (!hasNotionQuery(request.body)) return null;

  const response = await originalFetch(url.href, {
    method: request.method,
    headers: request.headers,
    body: JSON.stringify(request.body),
  });

  const data: CalendarListResult[] = await response.clone().json();

  for (const result of data) {
    if (!isNotionAccount(result)) continue;

    for (const calendar of result.calendars) {
      const notionCal = calendar as NotionCalendar;
      setNotionCalendar(notionCal.id, notionCal);
      console.log(
        `[notion-cal] Captured notion calendar: "${notionCal.summary}" (${notionCal.id})`,
      );
    }

    const injected = makeInjectedCalendar(result.accountId);
    result.calendars.push(injected);
    console.log(`[notion-cal] Injected calendar: "${injected.summary}" (${injected.id})`);
  }

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
});
