import type { AppleReminder } from "@/types/apple-reminders";

export function fetchReminders(): Promise<AppleReminder[]> {
  return new Promise((resolve) => {
    const handler = ((event: CustomEvent) => {
      window.removeEventListener(
        "notion-cal-reminders-response",
        handler as EventListener,
      );
      const data = event.detail;
      if (data?.success && Array.isArray(data.reminders)) {
        resolve(data.reminders);
      } else {
        console.error("[notion-cal] Failed to fetch reminders:", data?.error);
        resolve([]);
      }
    }) as EventListener;

    window.addEventListener("notion-cal-reminders-response", handler);
    window.dispatchEvent(
      new CustomEvent("notion-cal-get-reminders", {
        detail: {},
      }),
    );
  });
}
