import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { canManageUsers } from "@/lib/permissions";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !canManageUsers(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const result = await db.execute(
    "SELECT id, email, role, created_at FROM users ORDER BY created_at DESC"
  );
  return NextResponse.json(result.rows);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageUsers(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { email, password, role } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  const id = nanoid();

  try {
    await db.execute({
      sql: "INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)",
      args: [id, email, hash, role || "viewer"],
    });
  } catch (err) {
    return NextResponse.json({ error: "email already exists" }, { status: 409 });
  }

  return NextResponse.json({ id });
}
