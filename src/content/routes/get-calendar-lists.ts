import { route, originalFetch } from "@/content/router";
import type { CalendarListResult, NotionCalendar } from "@/types/calendar-list";
import { calendarIdForList, STATUS_IDS } from "@/constants";
import { fetchReminders } from "@/content/reminders";

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

function makeInjectedCalendar(accountId: string, listName: string): NotionCalendar {
  const calId = calendarIdForList(listName);
  const collectionId = `injected-collection-${listName.toLowerCase().replace(/\s+/g, "-")}`;

  return {
    provider: "notion",
    kind: "calendar#timeCollectionView",
    id: calId,
    accountId,
    accessRole: "writer",
    defaultReminders: [],
    etag: "",
    selected: true,
    summary: `${listName} (Apple Reminders)`,
    subtitle: "Table",
    notionViewType: "table",
    notionUrl: "",
    notionParentId: "",
    backgroundColor: "#9fc6e7",
    foregroundColor: "#000000",
    notionCollection: {
      id: collectionId,
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
                id: STATUS_IDS.incomplete,
                name: "Incomplete",
                color: "default",
                description: null,
              },
              {
                id: STATUS_IDS.complete,
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
                option_ids: [STATUS_IDS.incomplete],
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
                option_ids: [STATUS_IDS.complete],
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
          id: calId,
          collectionId,
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

  // Fetch reminders to discover which lists exist
  const reminders = await fetchReminders();
  const listNames = [...new Set(reminders.map((r) => r.list))];
  console.log(`[notion-cal] Discovered reminder lists: ${listNames.join(", ")}`);

  for (const result of data) {
    if (!isNotionAccount(result)) continue;

    for (const listName of listNames) {
      const injected = makeInjectedCalendar(result.accountId, listName);
      result.calendars.push(injected);
      console.log(`[notion-cal] Injected calendar: "${injected.summary}" (${injected.id})`);
    }
  }

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
});
