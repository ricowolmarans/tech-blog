"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const TOKEN_FIELDS = [
  { group: "colors", key: "background", label: "Background", type: "color" },
  { group: "colors", key: "text", label: "Text", type: "color" },
  { group: "colors", key: "accent", label: "Accent", type: "color" },
  { group: "colors", key: "muted", label: "Muted text", type: "color" },
  { group: "fonts", key: "body", label: "Body font", type: "text" },
  { group: "fonts", key: "heading", label: "Heading font", type: "text" },
  { group: "radius", key: null, label: "Border radius", type: "text" },
];

export default function ThemeEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [theme, setTheme] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [customCss, setCustomCss] = useState("");
  const [customHtml, setCustomHtml] = useState("");
  const [mode, setMode] = useState("visual"); // visual | code
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    const res = await fetch(`/api/themes/${id}`);
    const data = await res.json();
    setTheme(data);
    setTokens(JSON.parse(data.tokens));
    setCustomCss(data.custom_css || "");
    setCustomHtml(data.custom_html_wrapper || "");
  }

  function setToken(group, key, value) {
    setTokens((prev) => {
      const next = { ...prev };
      if (key) {
        next[group] = { ...next[group], [key]: value };
      } else {
        next[group] = value;
      }
      return next;
    });
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/themes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: theme.name,
        tokens,
        custom_css: customCss,
        custom_html_wrapper: customHtml,
      }),
    });
    setSaving(false);
  }

  async function makeDefault() {
    await fetch(`/api/themes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_default: true }),
    });
    load();
  }

  if (!theme || !tokens) return <div className="p-6 text-neutral-500">Loading…</div>;

  return (
    <div className="flex h-screen text-neutral-100">
      <div className="w-80 overflow-y-auto border-r border-neutral-800 p-5">
        <input
          value={theme.name}
          onChange={(e) => setTheme({ ...theme, name: e.target.value })}
          className="mb-4 w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-lg font-semibold"
        />

        <div className="mb-4 flex overflow-hidden rounded border border-neutral-700 text-xs">
          <button
            onClick={() => setMode("visual")}
            className={`flex-1 py-2 ${mode === "visual" ? "bg-blue-600" : "bg-neutral-900"}`}
          >
            Visual tokens
          </button>
          <button
            onClick={() => setMode("code")}
            className={`flex-1 py-2 ${mode === "code" ? "bg-blue-600" : "bg-neutral-900"}`}
          >
            Raw CSS/HTML
          </button>
        </div>

        {mode === "visual" ? (
          <div className="space-y-3">
            {TOKEN_FIELDS.map((f) => (
              <div key={f.label}>
                <label className="mb-1 block text-xs text-neutral-400">{f.label}</label>
                {f.type === "color" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={tokens[f.group]?.[f.key] || "#000000"}
                      onChange={(e) => setToken(f.group, f.key, e.target.value)}
                      className="h-8 w-8 rounded border border-neutral-700 bg-transparent"
                    />
                    <input
                      value={tokens[f.group]?.[f.key] || ""}
                      onChange={(e) => setToken(f.group, f.key, e.target.value)}
                      className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs"
                    />
                  </div>
                ) : (
                  <input
                    value={f.key ? tokens[f.group]?.[f.key] || "" : tokens[f.group] || ""}
                    onChange={(e) => setToken(f.group, f.key, e.target.value)}
                    className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-400">
                Custom CSS (applied blog-wide, overrides tokens)
              </label>
              <textarea
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                rows={10}
                spellCheck={false}
                className="w-full rounded border border-neutral-700 bg-neutral-900 p-2 font-mono text-xs"
                placeholder="body { ... }"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-400">
                Custom HTML wrapper (use {"{{content}}"} for post content, {"{{title}}"} for site title)
              </label>
              <textarea
                value={customHtml}
                onChange={(e) => setCustomHtml(e.target.value)}
                rows={10}
                spellCheck={false}
                className="w-full rounded border border-neutral-700 bg-neutral-900 p-2 font-mono text-xs"
                placeholder="<html>...{{content}}...</html>"
              />
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="rounded bg-blue-600 py-2 text-sm font-medium hover:bg-blue-500"
          >
            {saving ? "Saving…" : "Save Theme"}
          </button>
          {!theme.is_default && (
            <button
              onClick={makeDefault}
              className="rounded border border-neutral-700 py-2 text-sm hover:bg-neutral-900"
            >
              Set as Default
            </button>
          )}
          <button
            onClick={() => router.push("/admin/themes")}
            className="text-xs text-neutral-500 hover:underline"
          >
            Back to themes
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div className="flex-1 overflow-y-auto p-8">
        <div
          className="mx-auto max-w-2xl rounded-lg p-8"
          style={{
            background: tokens.colors?.background,
            color: tokens.colors?.text,
            fontFamily: tokens.fonts?.body,
            borderRadius: tokens.radius,
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: customCss }} />
          <h1
            style={{ fontFamily: tokens.fonts?.heading, color: tokens.colors?.text }}
            className="mb-2 text-3xl font-bold"
          >
            Sample Post Title
          </h1>
          <p style={{ color: tokens.colors?.muted }} className="mb-6 text-sm">
            Published on the blog · a preview of this theme
          </p>
          <p className="mb-4 leading-relaxed">
            This is how body text will look with the current tokens. Quick brown foxes,
            lazy dogs, and every other pangram you can think of.
          </p>
          <a href="#" style={{ color: tokens.colors?.accent }} className="underline">
            An example link in the accent color
          </a>
          <pre
            className="mt-4 overflow-x-auto p-3 text-xs"
            style={{ background: "rgba(128,128,128,0.15)", borderRadius: tokens.radius }}
          >
            {`function example() {\n  return "code block styling";\n}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
