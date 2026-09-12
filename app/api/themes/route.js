import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { canManageThemes } from "@/lib/permissions";
import { nanoid } from "nanoid";

export async function GET() {
  const result = await db.execute("SELECT * FROM themes ORDER BY created_at DESC");
  return NextResponse.json(result.rows);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageThemes(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { name, tokens, is_default } = await req.json();
  if (!name || !tokens) {
    return NextResponse.json({ error: "name and tokens required" }, { status: 400 });
  }

  const id = nanoid();

  if (is_default) {
    await db.execute("UPDATE themes SET is_default = 0");
  }

  await db.execute({
    sql: `INSERT INTO themes (id, name, tokens, is_default) VALUES (?, ?, ?, ?)`,
    args: [id, name, JSON.stringify(tokens), is_default ? 1 : 0],
  });

  return NextResponse.json({ id });
}
