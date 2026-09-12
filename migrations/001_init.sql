-- Users & roles
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer', -- admin | editor | viewer
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,           -- markdown, written by hand (no AI)
  content_format TEXT NOT NULL DEFAULT 'markdown', -- markdown | html
  excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | published | private
  author_id TEXT NOT NULL REFERENCES users(id),
  theme_id TEXT REFERENCES themes(id),
  cover_upload_id TEXT REFERENCES uploads(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT
);

-- Themes (token-based: colors/fonts/spacing, stored as JSON)
CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tokens TEXT NOT NULL,            -- JSON blob: {colors:{}, fonts:{}, ...}
  custom_css TEXT,                 -- optional raw CSS override
  custom_html_wrapper TEXT,        -- optional raw HTML shell for the whole blog (uses {{content}} placeholder)
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Uploads (images/files, metadata only — files live on disk on the Dell box)
CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Research sidebar history (Tavily + Groq results, saved per post/topic)
CREATE TABLE IF NOT EXISTS research_notes (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES posts(id),
  topic TEXT NOT NULL,
  tavily_raw TEXT,                 -- JSON of search results
  groq_summary TEXT,               -- AI summary text
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_research_post ON research_notes(post_id);
