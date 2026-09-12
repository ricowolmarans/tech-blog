import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { canManageUsers } from "@/lib/permissions";

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageUsers(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { role } = await req.json();
  await db.execute({
    sql: "UPDATE users SET role = ? WHERE id = ?",
    args: [role, params.id],
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageUsers(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (params.id === session.user.id) {
    return NextResponse.json({ error: "cannot delete yourself" }, { status: 400 });
  }
  await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [params.id] });
  return NextResponse.json({ ok: true });
}
