import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";

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
        colors: { background: "#0a0a0a", text: "#f5f5f5", accent: "#3b82f6", muted: "#737373" },
        fonts: { body: "system-ui, sans-serif", heading: "system-ui, sans-serif" },
      };

  const bodyMarkup =
    post.content_format === "html" ? (
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    ) : (
      <MarkdownRenderer content={post.content} />
    );

  // Full custom HTML wrapper mode: theme owns the entire page shell
  if (theme?.custom_html_wrapper) {
    const html = theme.custom_html_wrapper
      .replace(/{{\s*title\s*}}/g, post.title)
      .replace(/{{\s*content\s*}}/g, post.content_format === "html" ? post.content : "");
    // If wrapper is used with markdown content, still render markdown normally below the raw wrapper isn't practical —
    // wrapper mode is intended for HTML-format posts. For markdown posts, fall through to standard rendering.
    if (post.content_format === "html") {
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    }
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
      <div className="mx-auto max-w-2xl px-6 py-16">
        {post.status === "private" && (
          <p style={{ color: tokens.colors?.accent }} className="mb-4 text-xs uppercase tracking-wide">
            Private post
          </p>
        )}
        <h1 style={{ fontFamily: tokens.fonts?.heading }} className="mb-2 text-3xl font-bold">
          {post.title}
        </h1>
        <p style={{ color: tokens.colors?.muted }} className="mb-8 text-sm">
          {post.published_at ? new Date(post.published_at).toLocaleDateString() : "Draft"}
        </p>
        {post.cover_filename && (
          <img
            src={`/uploads/${post.cover_filename}`}
            alt=""
            className="mb-8 w-full rounded"
          />
        )}
        {bodyMarkup}
      </div>
    </div>
  );
}
