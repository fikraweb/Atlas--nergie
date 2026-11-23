CREATE TABLE IF NOT EXISTS quote_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  service TEXT NOT NULL,
  description TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_media (
  id TEXT PRIMARY KEY,
  data BLOB NOT NULL
);
