# tech-blog

Private, self-hosted tech blog. Next.js + Turso + Groq (research) + Tavily (search).
Posts are written by hand — AI is only used for the research sidebar, not for drafting content.

## Setup

1. Create a Turso database:
   ```
   turso db create tech-blog
   turso db show tech-blog --url
   turso db tokens create tech-blog
   ```

2. Copy `.env.example` to `.env.local` and fill in:
   - `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
   - `GROQ_API_KEY` (console.groq.com)
   - `TAVILY_API_KEY` (tavily.com)
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your internal domain/IP

3. Install deps and run migrations:
   ```
   npm install
   npm run migrate
   ```

4. Create your first admin user:
   ```
   node scripts/seed-admin.js you@example.com yourpassword
   ```

5. Local dev:
   ```
   npm run dev
   ```

## Deploy on the Dell box

```
docker compose up -d --build
```

Then point Nginx at it — see `nginx.example.conf`. Not indexed, no public DNS,
bind the container to 127.0.0.1 only (already set in docker-compose.yml).

## Roles

- **admin** — everything, including managing users
- **editor** — write/publish posts, manage themes, upload files, use research
- **viewer** — read-only in the admin panel

## What's built

- [x] DB schema (posts, themes, uploads, users, research_notes)
- [x] Auth (NextAuth, credentials, role-based: admin/editor/viewer)
- [x] Middleware gating all `/admin/*` routes by session + role
- [x] Posts CRUD API + dashboard (filter by status, edit, delete)
- [x] Post editor: markdown mode (live preview) AND raw HTML mode toggle per post
- [x] Uploads API + gallery UI (thumbnail grid, copy URL, file manager)
- [x] Themes: visual token picker (colors/fonts/radius) with live preview,
      PLUS raw CSS override and raw HTML page-wrapper override per theme
- [x] User management UI (admin-only: create users, change roles, delete)
- [x] Research sidebar (Tavily search -> Groq summary -> saved notes)
- [x] Public blog frontend: post list (`/blog`) + single post (`/blog/[slug]`),
      rendering whichever theme is assigned (or the default), honoring
      markdown vs raw-HTML posts and full custom HTML wrapper themes
- [x] Docker + Nginx deploy config

## Notes on theme flexibility

Themes work at two levels:
1. **Visual tokens** (colors, fonts, radius) — quick, safe, live-previewed.
2. **Raw CSS** — dropped in as a `<style>` tag, overrides tokens for anything the picker can't reach.
3. **Raw HTML wrapper** — replace the entire page shell. Use `{{content}}` and `{{title}}`
   placeholders. Only applies to posts saved in **HTML mode** (markdown posts always
   render through the normal token-styled layout, since a full wrapper override doesn't
   make sense with markdown content).

Posts themselves can also be written in **raw HTML mode** (toggle in the editor) instead
of markdown, if you want full control over a specific post's markup.

## Still to build / open ends

- Password reset flow (currently: admin recreates the user)
- Pagination on the public blog list and uploads gallery
