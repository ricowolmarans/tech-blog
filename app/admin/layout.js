import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || "viewer";

  const links = [
    { href: "/admin/posts", label: "Posts", min: "viewer" },
    { href: "/admin/themes", label: "Themes", min: "editor" },
    { href: "/admin/uploads", label: "Uploads", min: "editor" },
    { href: "/admin/users", label: "Users", min: "admin" },
  ];
  const rank = { viewer: 0, editor: 1, admin: 2 };

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <nav className="flex w-52 flex-col border-r border-neutral-800 p-4">
        <p className="mb-6 text-sm font-semibold text-neutral-400">
          {session?.user?.email} <span className="text-neutral-600">({role})</span>
        </p>
        <div className="flex flex-col gap-1">
          {links
            .filter((l) => rank[role] >= rank[l.min])
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded px-2 py-1.5 text-sm hover:bg-neutral-900"
              >
                {l.label}
              </Link>
            ))}
        </div>
        <div className="mt-auto">
          <SignOutButton />
        </div>
      </nav>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
