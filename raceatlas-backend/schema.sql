-- RaceAtlas subscription storage (Cloudflare D1)
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  event_id TEXT NOT NULL,
  date_alert INTEGER NOT NULL DEFAULT 1,
  registration_alert INTEGER NOT NULL DEFAULT 1,
  race_reminders INTEGER NOT NULL DEFAULT 1,
  verified INTEGER NOT NULL DEFAULT 0,
  verify_nonce TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  verified_at TEXT,
  UNIQUE(email,event_id)
);
CREATE TABLE IF NOT EXISTS event_snapshots (
  event_id TEXT PRIMARY KEY,
  event_date TEXT,
  registration_open_at TEXT,
  date_evidence TEXT,
  checked_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS deliveries (
  subscription_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  target TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  PRIMARY KEY(subscription_id,kind,target)
);
CREATE INDEX IF NOT EXISTS subscriptions_event_verified_idx ON subscriptions(event_id,verified);

-- Aggregate outbound link clicks. Only event ID, link kind, date and count are stored.
-- No visitor identifiers, IP addresses, emails, or URLs are written to this table.
CREATE TABLE IF NOT EXISTS outbound_click_daily (
  event_id TEXT NOT NULL,
  link_kind TEXT NOT NULL CHECK(link_kind IN ('registration','organizer','source')),
  day TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(event_id,link_kind,day)
);
CREATE INDEX IF NOT EXISTS outbound_click_day_idx ON outbound_click_daily(day);
