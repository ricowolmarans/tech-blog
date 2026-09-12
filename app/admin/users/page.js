"use client";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", role: "editor" });
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  async function createUser(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create user");
      return;
    }
    setForm({ email: "", password: "", role: "editor" });
    load();
  }

  async function changeRole(id, role) {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    load();
  }

  async function removeUser(id) {
    if (!confirm("Delete this user?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else alert((await res.json()).error);
  }

  return (
    <div className="p-6 text-neutral-100">
      <h1 className="mb-6 text-xl font-semibold">Users</h1>

      <form onSubmit={createUser} className="mb-6 flex flex-wrap items-end gap-2 rounded border border-neutral-800 p-4">
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Email</label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm"
          >
            <option value="viewer">viewer</option>
            <option value="editor">editor</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <button className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium hover:bg-blue-500">
          Add user
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>

      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-left text-neutral-400">
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Created</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-neutral-900">
                <td className="py-2">{u.email}</td>
                <td className="py-2">
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs"
                  >
                    <option value="viewer">viewer</option>
                    <option value="editor">editor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="py-2 text-neutral-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => removeUser(u.id)}
                    className="text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
