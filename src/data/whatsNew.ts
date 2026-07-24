export interface WhatsNewEntry {
  /** Stable identifier; also used to determine "unread" state, so entries must never reuse an old id. */
  id: string;
  date: string;
  title: string;
  body: string;
}

// Newest entry first — index 0 drives the "unread" badge.
export const WHATS_NEW_ENTRIES: WhatsNewEntry[] = [
  {
    id: '2026-07-mobile-app',
    date: '2026-07-22',
    title: 'Wordles with Friends is coming to mobile',
    body: "We're building a native mobile app. Drop your email and we'll let you know the moment it's ready.",
  },
];

export const LATEST_WHATS_NEW_ID: string = WHATS_NEW_ENTRIES[0].id;
