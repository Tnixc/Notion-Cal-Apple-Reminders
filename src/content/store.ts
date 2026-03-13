import type { NotionCalendar } from "@/types/calendar-list";

const notionCalendars = new Map<string, NotionCalendar>();

export function setNotionCalendar(calendarId: string, calendar: NotionCalendar) {
  notionCalendars.set(calendarId, calendar);
}

export function getNotionCalendar(calendarId: string): NotionCalendar | undefined {
  return notionCalendars.get(calendarId);
}

export function getAllNotionCalendars(): NotionCalendar[] {
  return [...notionCalendars.values()];
}
