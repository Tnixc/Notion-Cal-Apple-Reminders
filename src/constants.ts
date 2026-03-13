export const REMINDERS_CONFIG = {
  daysAhead: 7,
  includeCompleted: true,
} as const;

export const NATIVE_HOST_NAME = "com.notion_cal.apple_reminders";

export const STATUS_IDS = {
  incomplete: "b529b488-f478-4118-8fc4-4084491a9731",
  complete: "f90b1d98-fb26-4d70-8f8e-446a7a79652c",
} as const;

export const PRIORITY_ID = "9f9f21b9-9f4a-472d-9884-aebfd82a0c30";

/** Deterministic calendar ID from a reminder list name. */
export function calendarIdForList(listName: string): string {
  let hash = 0;
  for (const ch of listName) {
    hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `APPLRMDR-${hex.slice(0, 4)}-${hex.slice(4, 8)}-0000-000000000000`;
}
