export interface AppleReminder {
  externalId: string;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
  list: string;
  notes?: string;
}
