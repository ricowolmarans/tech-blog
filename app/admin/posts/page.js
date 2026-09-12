"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PostsDashboard() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const canEdit = ["editor", "admin"].includes(session?.user?.role);

  useEffect(() => {
    load();
  }, [filter]);

  async function load() {
    setLoading(true);
    const url = filter === "all" ? "/api/posts" : `/api/posts?status=${filter}`;
    const res = await fetch(url);
    setPosts(await res.json());
    setLoading(false);
  }

  async function remove(id) {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Posts</h1>
        {canEdit && (
          <Link
            href="/admin/posts/new"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
          >
            New Post
          </Link>
        )}
      </div>

      <div className="mb-4 flex gap-2 text-sm">
        {["all", "draft", "published", "private"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded px-3 py-1 ${
              filter === f ? "bg-neutral-800" : "hover:bg-neutral-900"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-neutral-500">No posts yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-left text-neutral-400">
              <th className="py-2">Title</th>
              <th className="py-2">Status</th>
              <th className="py-2">Updated</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-neutral-900">
                <td className="py-2">{p.title}</td>
                <td className="py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      p.status === "published"
                        ? "bg-green-900 text-green-300"
                        : p.status === "private"
                        ? "bg-purple-900 text-purple-300"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="py-2 text-neutral-500">
                  {new Date(p.updated_at).toLocaleString()}
                </td>
                <td className="py-2 text-right">
                  {canEdit && (
                    <>
                      <Link
                        href={`/admin/posts/${p.id}`}
                        className="mr-3 text-blue-400 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => remove(p.id)}
                        className="text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
