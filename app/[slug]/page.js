import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export const dynamic = "force-dynamic";

async function getPost(slug) {
  const result = await db.execute({
    sql: `SELECT p.*, u.filename AS cover_filename FROM posts p
          LEFT JOIN uploads u ON p.cover_upload_id = u.id
          WHERE p.slug = ? AND p.status IN ('published', 'private')`,
    args: [slug],
  });
  return result.rows[0] || null;
}

async function getTheme(themeId) {
  if (themeId) {
    const r = await db.execute({ sql: "SELECT * FROM themes WHERE id = ?", args: [themeId] });
    if (r.rows[0]) return r.rows[0];
  }
  const d = await db.execute("SELECT * FROM themes WHERE is_default = 1 LIMIT 1");
  return d.rows[0] || null;
}

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const theme = await getTheme(post.theme_id);
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

  const bodyMarkup =
    post.content_format === "html" ? (
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    ) : (
      <MarkdownRenderer content={post.content} />
    );

  if (theme?.custom_html_wrapper && post.content_format === "html") {
    const html = theme.custom_html_wrapper
      .replace(/{{\s*title\s*}}/g, post.title)
      .replace(/{{\s*content\s*}}/g, post.content);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

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

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-8 sm:py-12">
        <Link
          href="/"
          style={{ color: tokens.colors?.accent }}
          className="mb-6 inline-block text-sm hover:underline sm:mb-8"
        >
          ← Back
        </Link>

        {post.status === "private" && (
          <p
            style={{ color: tokens.colors?.accent2 || tokens.colors?.accent }}
            className="mb-3 text-xs font-medium uppercase tracking-wide"
          >
            Private post
          </p>
        )}

        <h1
          style={{ fontFamily: tokens.fonts?.heading }}
          className="text-2xl font-bold leading-tight sm:text-4xl"
        >
          {post.title}
        </h1>
        <p style={{ color: tokens.colors?.muted }} className="mb-6 mt-2 text-sm sm:mb-8">
          {post.published_at
            ? new Date(post.published_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Draft"}
        </p>

        {post.cover_filename && (
          <img
            src={`/uploads/${post.cover_filename}`}
            alt=""
            className="mb-6 w-full rounded-lg sm:mb-8"
          />
        )}

        <article className="prose prose-invert max-w-none text-[15px] leading-relaxed sm:text-base">
          {bodyMarkup}
        </article>
      </div>
    </div>
  );
}
