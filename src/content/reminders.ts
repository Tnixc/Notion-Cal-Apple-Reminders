import type { AppleReminder } from "@/types/apple-reminders";

export interface RemindersResult {
  reminders: AppleReminder[];
  listColors: Record<string, string>;
}

export function fetchReminders(): Promise<RemindersResult> {
  return new Promise((resolve) => {
    const handler = ((event: CustomEvent) => {
      window.removeEventListener(
        "notion-cal-reminders-response",
        handler as EventListener,
      );
      const data = event.detail;
      if (data?.success && Array.isArray(data.reminders)) {
        resolve({
          reminders: data.reminders,
          listColors: data.listColors ?? {},
        });
      } else {
        console.error("[notion-cal] Failed to fetch reminders:", data?.error);
        resolve({ reminders: [], listColors: {} });
      }
    }) as EventListener;

    window.addEventListener("notion-cal-reminders-response", handler);
    window.dispatchEvent(
      new CustomEvent("notion-cal-get-reminders", { detail: {} }),
    );
  });
}
