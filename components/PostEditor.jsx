"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import ResearchSidebar from "@/components/ResearchSidebar";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function PostEditor({ post }) {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [format, setFormat] = useState(post?.content_format || "markdown");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [themeId, setThemeId] = useState(post?.theme_id || "");
  const [coverUploadId, setCoverUploadId] = useState(post?.cover_upload_id || "");
  const [themes, setThemes] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/themes").then((r) => r.json()).then(setThemes);
    fetch("/api/uploads").then((r) => r.json()).then(setUploads);
  }, []);

  const coverUrl = (() => {
    const u = uploads.find((u) => u.id === coverUploadId);
    return u ? `/uploads/${u.filename}` : null;
  })();

  async function uploadCover(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: formData });
    const data = await res.json();
    setCoverUploadId(data.id);
    fetch("/api/uploads").then((r) => r.json()).then(setUploads);
    setShowCoverPicker(false);
  }

  async function save(status) {
    setSaving(true);
    const body = {
      title,
      content,
      content_format: format,
      excerpt,
      status,
      theme_id: themeId || null,
      cover_upload_id: coverUploadId || null,
    };
    const res = post?.id
      ? await fetch(`/api/posts/${post.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
    setSaving(false);
    if (res.ok) router.push("/admin/posts");
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100">
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-lg font-semibold"
          />
          <div className="flex overflow-hidden rounded border border-neutral-700 text-xs">
            <button
              onClick={() => setFormat("markdown")}
              className={`px-3 py-2 ${format === "markdown" ? "bg-blue-600" : "bg-neutral-900"}`}
            >
              Markdown
            </button>
            <button
              onClick={() => setFormat("html")}
              className={`px-3 py-2 ${format === "html" ? "bg-blue-600" : "bg-neutral-900"}`}
            >
              Raw HTML
            </button>
          </div>
        </div>

        <div className="mb-3 flex items-center gap-3">
          <input
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short excerpt (optional)"
            className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          />
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            className="rounded border border-neutral-700 bg-neutral-900 px-2 py-2 text-sm"
            title="Theme for this post (blank = site default)"
          >
            <option value="">Default theme</option>
            {themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.is_default ? " (default)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded border border-neutral-800 p-2">
          {coverUrl ? (
            <>
              <img src={coverUrl} alt="Cover" className="h-14 w-14 rounded object-cover" />
              <span className="text-xs text-neutral-400">Cover image set</span>
              <button
                onClick={() => setCoverUploadId("")}
                className="ml-auto text-xs text-red-400 hover:underline"
              >
                Remove
              </button>
              <button
                onClick={() => setShowCoverPicker(true)}
                className="text-xs text-blue-400 hover:underline"
              >
                Change
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-neutral-500">No cover image</span>
              <button
                onClick={() => setShowCoverPicker(true)}
                className="ml-auto text-xs text-blue-400 hover:underline"
              >
                Set cover image
              </button>
            </>
          )}
        </div>

        {showCoverPicker && (
          <div className="mb-4 rounded border border-neutral-800 bg-neutral-900 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-neutral-400">Choose from uploads or upload new</p>
              <label className="cursor-pointer text-xs text-blue-400 hover:underline">
                Upload new
                <input type="file" accept="image/*" onChange={uploadCover} className="hidden" />
              </label>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {uploads
                .filter((u) => u.mime_type?.startsWith("image/"))
                .map((u) => (
                  <img
                    key={u.id}
                    src={`/uploads/${u.filename}`}
                    alt={u.original_name}
                    onClick={() => {
                      setCoverUploadId(u.id);
                      setShowCoverPicker(false);
                    }}
                    className="h-16 w-full cursor-pointer rounded object-cover ring-2 ring-transparent hover:ring-blue-500"
                  />
                ))}
            </div>
            <button
              onClick={() => setShowCoverPicker(false)}
              className="mt-2 text-xs text-neutral-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex-1" data-color-mode="dark">
          {format === "markdown" ? (
            <MDEditor value={content} onChange={setContent} height="100%" preview="live" />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
              className="h-full w-full resize-none rounded border border-neutral-700 bg-neutral-900 p-3 font-mono text-sm text-neutral-100"
              placeholder="<h1>Full raw HTML for this post…</h1>"
            />
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => save("draft")}
            disabled={saving}
            className="rounded border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
          >
            Save Draft
          </button>
          <button
            onClick={() => save("private")}
            disabled={saving}
            className="rounded border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-800"
          >
            Save Private
          </button>
          <button
            onClick={() => save("published")}
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
          >
            Publish
          </button>
        </div>
      </div>
      <ResearchSidebar postId={post?.id || null} />
    </div>
  );
}

