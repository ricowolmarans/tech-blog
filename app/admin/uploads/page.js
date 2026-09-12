"use client";
import { useEffect, useRef, useState } from "react";

export default function UploadsPage() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(null);
  const fileInput = useRef(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/uploads");
    setUploads(await res.json());
    setLoading(false);
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      await fetch("/api/uploads", { method: "POST", body: formData });
    }
    setUploading(false);
    fileInput.current.value = "";
    load();
  }

  function copyUrl(url) {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  }

  function isImage(mime) {
    return mime?.startsWith("image/");
  }

  return (
    <div className="p-6 text-neutral-100">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Uploads</h1>
        <label className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500">
          {uploading ? "Uploading…" : "Upload files"}
          <input
            ref={fileInput}
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : uploads.length === 0 ? (
        <p className="text-neutral-500">No files uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {uploads.map((u) => {
            const url = `/uploads/${u.filename}`;
            return (
              <div
                key={u.id}
                className="overflow-hidden rounded border border-neutral-800"
              >
                <div className="flex h-32 items-center justify-center bg-neutral-900">
                  {isImage(u.mime_type) ? (
                    <img src={url} alt={u.original_name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-neutral-500">{u.mime_type}</span>
                  )}
                </div>
                <div className="p-2">
                  <p className="truncate text-xs text-neutral-300">{u.original_name}</p>
                  <p className="text-xs text-neutral-600">
                    {(u.size_bytes / 1024).toFixed(0)} KB
                  </p>
                  <button
                    onClick={() => copyUrl(url)}
                    className="mt-1 text-xs text-blue-400 hover:underline"
                  >
                    {copied === url ? "Copied!" : "Copy URL"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
