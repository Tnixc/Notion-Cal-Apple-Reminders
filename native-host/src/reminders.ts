import { execSync } from "child_process";

const REMINDERS = "/opt/homebrew/bin/reminders";

export interface AppleReminder {
  externalId: string;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
  list: string;
  priority: number;
  notes?: string;
}

export function getRemindersWithinDays(days: number): AppleReminder[] {
  let raw: string;
  try {
    raw = execSync(`${REMINDERS} show-all --include-completed -f json`, {
      timeout: 10000,
    }).toString();
  } catch {
    return [];
  }

  const all: AppleReminder[] = JSON.parse(raw);
  const now = Date.now();
  const cutoff = now + days * 24 * 60 * 60 * 1000;
  return all.filter((r) => {
    if (!r.dueDate) return false;
    const due = new Date(r.dueDate).getTime();
    if (r.isCompleted) return due >= now && due <= cutoff;
    return due <= cutoff;
  });
}
