import { db } from "@/lib/db";
import Link from "next/link";

async function getDefaultTheme() {
  const result = await db.execute("SELECT * FROM themes WHERE is_default = 1 LIMIT 1");
  return result.rows[0] || null;
}

async function getPublishedPosts() {
  const result = await db.execute(
    `SELECT p.id, p.title, p.slug, p.excerpt, p.published_at, u.filename AS cover_filename
     FROM posts p LEFT JOIN uploads u ON p.cover_upload_id = u.id
     WHERE p.status = 'published' ORDER BY p.published_at DESC`
  );
  return result.rows;
}

export default async function BlogIndex() {
  const theme = await getDefaultTheme();
  const tokens = theme ? JSON.parse(theme.tokens) : {
    colors: { background: "#0a0a0a", text: "#f5f5f5", accent: "#3b82f6", muted: "#737373" },
    fonts: { body: "system-ui, sans-serif", heading: "system-ui, sans-serif" },
  };
  const posts = await getPublishedPosts();

  return (
    <div
      style={{ background: tokens.colors?.background, color: tokens.colors?.text, fontFamily: tokens.fonts?.body, minHeight: "100vh" }}
    >
      {theme?.custom_css && <style dangerouslySetInnerHTML={{ __html: theme.custom_css }} />}
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 style={{ fontFamily: tokens.fonts?.heading }} className="mb-10 text-4xl font-bold">
          Tech Reports
        </h1>
        {posts.length === 0 ? (
          <p style={{ color: tokens.colors?.muted }}>Nothing published yet.</p>
        ) : (
          <div className="space-y-8">
            {posts.map((p) => (
              <Link key={p.id} href={`/${p.slug}`} className="block group">
                {p.cover_filename && (
                  <img
                    src={`/uploads/${p.cover_filename}`}
                    alt=""
                    className="mb-2 h-40 w-full rounded object-cover"
                  />
                )}
                <h2
                  style={{ fontFamily: tokens.fonts?.heading }}
                  className="text-xl font-semibold group-hover:underline"
                >
                  {p.title}
                </h2>
                {p.excerpt && (
                  <p style={{ color: tokens.colors?.muted }} className="mt-1 text-sm">
                    {p.excerpt}
                  </p>
                )}
                <p style={{ color: tokens.colors?.muted }} className="mt-1 text-xs">
                  {p.published_at ? new Date(p.published_at).toLocaleDateString() : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
