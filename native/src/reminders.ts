import { execSync } from "child_process";

const REMINDERS = "/opt/homebrew/bin/reminders";

export interface AppleReminder {
  externalId: string;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
  list: string;
  notes?: string;
}

export function getReminders(): AppleReminder[] {
  let raw: string;
  try {
    raw = execSync(`${REMINDERS} show-all --include-completed -f json`, {
      timeout: 10000,
    }).toString();
  } catch {
    return [];
  }

  const all: AppleReminder[] = JSON.parse(raw);
  return all;
}
