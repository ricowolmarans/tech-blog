import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
  const tokens = theme
    ? JSON.parse(theme.tokens)
    : {
        colors: {
          background: "#0a0a0a",
          text: "#f5f5f5",
          accent: "#2563eb",
          accent2: "#dc2626",
          muted: "#a3a3a3",
        },
        fonts: { body: "system-ui, sans-serif", heading: "system-ui, sans-serif" },
      };
  const posts = await getPublishedPosts();

  return (
    <div
      style={{
        background: tokens.colors?.background,
        color: tokens.colors?.text,
        fontFamily: tokens.fonts?.body,
        minHeight: "100vh",
      }}
    >
      {theme?.custom_css && <style dangerouslySetInnerHTML={{ __html: theme.custom_css }} />}

      <header
        className="border-b px-4 py-6 sm:px-8 sm:py-10"
        style={{ borderColor: tokens.colors?.accent2 || "rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto max-w-2xl">
          <h1
            style={{ fontFamily: tokens.fonts?.heading }}
            className="text-2xl font-bold tracking-tight sm:text-4xl"
          >
            Tech Reports
          </h1>
          <p style={{ color: tokens.colors?.muted }} className="mt-1 text-xs sm:text-sm">
            Notes on the stuff I'm building and breaking.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8 sm:py-12">
        {posts.length === 0 ? (
          <p style={{ color: tokens.colors?.muted }} className="text-sm">
            Nothing published yet.
          </p>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/${p.slug}`}
                className="group block overflow-hidden rounded-xl transition active:scale-[0.99]"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {p.cover_filename && (
                  <img
                    src={`/uploads/${p.cover_filename}`}
                    alt=""
                    className="h-40 w-full object-cover sm:h-48"
                    loading="lazy"
                  />
                )}
                <div
                  className="border-t-2 p-4 sm:p-5"
                  style={{ borderColor: tokens.colors?.accent2 || "#dc2626" }}
                >
                  <h2
                    style={{ fontFamily: tokens.fonts?.heading, color: tokens.colors?.accent }}
                    className="text-lg font-semibold leading-snug group-hover:underline sm:text-xl"
                  >
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p style={{ color: tokens.colors?.muted }} className="mt-1.5 text-sm leading-relaxed">
                      {p.excerpt}
                    </p>
                  )}
                  <p style={{ color: tokens.colors?.muted }} className="mt-3 text-xs">
                    {p.published_at
                      ? new Date(p.published_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
