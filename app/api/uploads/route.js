import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { canEditPosts } from "@/lib/permissions";
import { nanoid } from "nanoid";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !canEditPosts(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  await mkdir(UPLOAD_DIR, { recursive: true });

  const id = nanoid();
  const ext = path.extname(file.name);
  const filename = `${id}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, bytes);

  await db.execute({
    sql: `INSERT INTO uploads (id, filename, original_name, mime_type, size_bytes, uploaded_by)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, filename, file.name, file.type, bytes.length, session.user.id],
  });

  return NextResponse.json({ id, url: `/uploads/${filename}` });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const result = await db.execute("SELECT * FROM uploads ORDER BY created_at DESC");
  return NextResponse.json(result.rows);
}
