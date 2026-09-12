"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ThemesListPage() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/themes");
    setThemes(await res.json());
    setLoading(false);
  }

  async function createNew() {
    const res = await fetch("/api/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New Theme",
        tokens: {
          colors: { background: "#0a0a0a", text: "#f5f5f5", accent: "#3b82f6", muted: "#737373" },
          fonts: { body: "Inter, sans-serif", heading: "Inter, sans-serif" },
          radius: "8px",
        },
      }),
    });
    const data = await res.json();
    window.location.href = `/admin/themes/${data.id}`;
  }

  async function remove(id) {
    if (!confirm("Delete this theme?")) return;
    await fetch(`/api/themes/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6 text-neutral-100">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Themes</h1>
        <button
          onClick={createNew}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
        >
          New Theme
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {themes.map((t) => {
            const tokens = JSON.parse(t.tokens);
            return (
              <Link
                key={t.id}
                href={`/admin/themes/${t.id}`}
                className="rounded border border-neutral-800 p-4 hover:border-neutral-600"
                style={{ background: tokens.colors?.background, color: tokens.colors?.text }}
              >
                <p className="font-medium">{t.name}</p>
                {t.is_default ? (
                  <span className="text-xs text-green-400">Default</span>
                ) : null}
                <div className="mt-3 flex gap-1">
                  {Object.values(tokens.colors || {}).map((c, i) => (
                    <span
                      key={i}
                      className="h-5 w-5 rounded-full border border-white/20"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
