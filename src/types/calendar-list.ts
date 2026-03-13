export interface CalendarListResult {
  accountId: string;
  calendars: Calendar[];
  syncToken?: string;
}

export type Calendar = NotionCalendar | ExternalCalendar;

export interface NotionCalendar {
  provider: "notion";
  kind: "calendar#timeCollectionView";
  id: string;
  accountId: string;
  accessRole: string;
  defaultReminders: unknown[];
  etag: string;
  selected: boolean;
  summary: string;
  subtitle: string;
  notionViewType: string;
  notionUrl: string;
  notionParentId: string;
  foregroundColor?: string;
  backgroundColor?: string;
  notionCollection: NotionCollection;
}

export interface NotionCollection {
  id: string;
  properties: CollectionProperties;
  propertyFormat: PropertyFormat[];
  propertyVisibilityFormat: PropertyVisibilityFormat[];
  timePropertyId: string;
  availableViews: AvailableView[];
}

export interface CollectionProperties {
  Date: {
    id: string;
    name: string;
    description: string | null;
    type: "date";
    date: Record<string, never>;
  };
  Status: {
    id: string;
    name: string;
    description: string | null;
    type: "status";
    status: {
      options: StatusOption[];
      groups: StatusGroup[];
    };
  };
  Priority: {
    id: string;
    name: string;
    description: string | null;
    type: "select";
    select: {
      options: SelectOption[];
    };
  };
  Name: {
    id: string;
    name: string;
    description: string | null;
    type: "title";
    title: Record<string, never>;
  };
}

export interface StatusOption {
  id: string;
  name: string;
  color: string;
  description: string | null;
}

export interface StatusGroup {
  id: string;
  name: string;
  color: string;
  option_ids: string[];
}

export interface SelectOption {
  id: string;
  name: string;
  color: string;
  description: string | null;
}

export interface PropertyFormat {
  property: string;
  visible: boolean;
}

export interface PropertyVisibilityFormat {
  property: string;
  visibility: string;
}

export interface AvailableView {
  id: string;
  collectionId: string;
  name: string;
  type: string;
}

export interface ExternalCalendar {
  provider: "icloud" | "google";
  kind: string;
  id: string;
  accountId: string;
  accessRole: string;
  etag: string;
  defaultReminders: unknown[];
  summary: string;
  backgroundColor?: string;
  foregroundColor?: string;
  selfAttendee?: { email: string; displayName?: string };
  selected?: boolean;
  timeZone?: string;
  colorId?: string;
  primary?: boolean;
  hidden?: boolean;
  notificationSettings?: unknown;
  conferenceProperties?: unknown;
  syncToken?: string;
}
