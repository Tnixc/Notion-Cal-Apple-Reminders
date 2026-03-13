export interface NotionEvent {
  provider: string;
  kind: string;
  organizer: { self: boolean };
  sequence: number;
  id: string;
  accountId: string;
  calendarId: string;
  summary: string;
  start: EventDateTime;
  end: EventDateTime;
  created: string;
  updated: string;
  notionUrl: string;
  notionTitleHasRichText: boolean;
  notionPage: NotionPage;
}

export interface EventDateTime {
  dateTime: string;
  timeZone: string;
}

export interface NotionPage {
  properties: {
    Date: {
      id: string;
      type: "date";
      date: { start: string; end: string | null; time_zone: string | null };
    };
    Status: {
      id: string;
      type: "status";
      status: { id: string; name: string; color: string };
    };
    Name: {
      id: string;
      type: "title";
      title: NotionRichText[];
    };
  };
}

export interface NotionRichText {
  type: string;
  text: { content: string; link: string | null };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href: string | null;
}

export interface CalendarQueryResult {
  accountId: string;
  calendarId: string;
  events: NotionEvent[];
}
