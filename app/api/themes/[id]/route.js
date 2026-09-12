import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { canManageThemes } from "@/lib/permissions";

export async function GET(req, { params }) {
  const result = await db.execute({
    sql: "SELECT * FROM themes WHERE id = ?",
    args: [params.id],
  });
  const theme = result.rows[0];
  if (!theme) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(theme);
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageThemes(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const fields = [];
  const args = [];

  for (const key of ["name", "tokens", "custom_css", "custom_html_wrapper"]) {
    if (body[key] !== undefined) {
      fields.push(`${key} = ?`);
      args.push(key === "tokens" ? JSON.stringify(body[key]) : body[key]);
    }
  }

  if (body.is_default) {
    await db.execute("UPDATE themes SET is_default = 0");
    fields.push("is_default = 1");
  }

  args.push(params.id);

  await db.execute({
    sql: `UPDATE themes SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageThemes(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await db.execute({ sql: "DELETE FROM themes WHERE id = ?", args: [params.id] });
  return NextResponse.json({ ok: true });
}
