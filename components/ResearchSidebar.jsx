"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function ResearchSidebar({ postId }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  async function runResearch(e) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, postId }),
      });
      if (!res.ok) throw new Error("Research request failed");
      const data = await res.json();
      setResults((prev) => [data, ...prev]);
      setTopic("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (collapsed) {
    return (
      <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900 px-4 py-2 lg:h-full lg:w-10 lg:flex-col lg:justify-start lg:border-l lg:border-t-0 lg:py-4">
        <button
          onClick={() => setCollapsed(false)}
          className="text-xs font-semibold uppercase tracking-wide text-neutral-400 hover:text-neutral-100 lg:[writing-mode:vertical-rl]"
        >
          Research {results.length > 0 ? `(${results.length})` : ""}
        </button>
      </div>
    );
  }

  return (
    <aside className="flex h-72 w-full flex-col border-t border-neutral-800 bg-neutral-900 p-4 lg:h-full lg:w-80 lg:border-l lg:border-t-0">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
          Research
        </h2>
        <button
          onClick={() => setCollapsed(true)}
          className="text-xs text-neutral-500 hover:text-neutral-200"
          title="Collapse"
        >
          ✕
        </button>
      </div>
      <form onSubmit={runResearch} className="mb-4 flex gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic to research…"
          className="flex-1 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-neutral-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "…" : "Go"}
        </button>
      </form>

      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

      <div className="flex-1 space-y-4 overflow-y-auto">
        {results.map((r) => (
          <div
            key={r.id}
            className="rounded border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-200"
          >
            <p className="mb-1 font-medium text-neutral-100">{r.topic}</p>
            <div className="text-xs text-neutral-300">
              <ReactMarkdown
                components={{
                  ul: (props) => <ul className="ml-4 list-disc space-y-1" {...props} />,
                  li: (props) => <li className="text-xs text-neutral-300" {...props} />,
                  p: (props) => <p className="mb-1 text-xs text-neutral-300" {...props} />,
                  strong: (props) => <strong className="text-neutral-100" {...props} />,
                }}
              >
                {r.summary}
              </ReactMarkdown>
            </div>
            {r.sources && r.sources.length > 0 && (
              <ul className="mt-2 space-y-1 border-t border-neutral-800 pt-2">
                {r.sources.map((s, i) => (
                  <li key={i}>
                    
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-400 hover:underline"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
