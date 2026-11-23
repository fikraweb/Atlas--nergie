CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  payload TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_events (
  day TEXT NOT NULL,
  kind TEXT NOT NULL,
  language TEXT NOT NULL,
  service TEXT NOT NULL DEFAULT '',
  total INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, kind, language, service)
);
