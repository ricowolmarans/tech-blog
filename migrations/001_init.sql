-- Users & roles (must come first — referenced by almost everything)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Themes (referenced by posts)
CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tokens TEXT NOT NULL,
  custom_css TEXT,
  custom_html_wrapper TEXT,
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Uploads (referenced by posts)
CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Posts (depends on users, themes, uploads)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  content_format TEXT NOT NULL DEFAULT 'markdown',
  excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  author_id TEXT NOT NULL REFERENCES users(id),
  theme_id TEXT REFERENCES themes(id),
  cover_upload_id TEXT REFERENCES uploads(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT
);

-- Research sidebar history (depends on posts + users)
CREATE TABLE IF NOT EXISTS research_notes (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES posts(id),
  topic TEXT NOT NULL,
  tavily_raw TEXT,
  groq_summary TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_research_post ON research_notes(post_id);
