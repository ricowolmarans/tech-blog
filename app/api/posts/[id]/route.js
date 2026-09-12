import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { canEditPosts } from "@/lib/permissions";

export async function GET(req, { params }) {
  const result = await db.execute({
    sql: "SELECT * FROM posts WHERE id = ? OR slug = ?",
    args: [params.id, params.id],
  });
  const post = result.rows[0];
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !canEditPosts(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const fields = [];
  const args = [];

  for (const key of ["title", "content", "content_format", "excerpt", "status", "theme_id", "cover_upload_id"]) {
    if (body[key] !== undefined) {
      fields.push(`${key} = ?`);
      args.push(body[key]);
    }
  }
  if (body.status === "published") {
    fields.push("published_at = ?");
    args.push(new Date().toISOString());
  }
  fields.push("updated_at = ?");
  args.push(new Date().toISOString());
  args.push(params.id);

  await db.execute({
    sql: `UPDATE posts SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !canEditPosts(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await db.execute({ sql: "DELETE FROM posts WHERE id = ?", args: [params.id] });
  return NextResponse.json({ ok: true });
}
