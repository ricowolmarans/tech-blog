"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="w-full rounded border border-neutral-800 px-2 py-1.5 text-left text-sm text-neutral-400 hover:bg-neutral-900"
    >
      Sign out
    </button>
  );
}
