import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { canEditPosts } from "@/lib/permissions";
import { nanoid } from "nanoid";

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-");
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const result = await db.execute({
    sql: status
      ? "SELECT * FROM posts WHERE status = ? ORDER BY updated_at DESC"
      : "SELECT * FROM posts ORDER BY updated_at DESC",
    args: status ? [status] : [],
  });

  return NextResponse.json(result.rows);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !canEditPosts(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { title, content, content_format, excerpt, status, theme_id } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ error: "title and content required" }, { status: 400 });
  }

  const id = nanoid();
  const slug = `${slugify(title)}-${id.slice(0, 6)}`;

  await db.execute({
    sql: `INSERT INTO posts (id, title, slug, content, content_format, excerpt, status, author_id, theme_id, published_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      title,
      slug,
      content,
      content_format === "html" ? "html" : "markdown",
      excerpt || null,
      status || "draft",
      session.user.id,
      theme_id || null,
      status === "published" ? new Date().toISOString() : null,
    ],
  });

  return NextResponse.json({ id, slug });
}
