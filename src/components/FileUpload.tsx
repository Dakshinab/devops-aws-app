"use client";

import { useState } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 5;

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setUploadedUrl("");
    const selected = event.target.files?.[0] ?? null;
    if (!selected) return;
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Only JPG, PNG, WebP and GIF images are allowed.");
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }
    setFile(selected);
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Upload failed. Please try again.");
        return;
      }
      if (data.success) {
        setUploadedUrl(data.url);
        setFile(null);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-stone-500">
        Upload image
      </h3>
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-full file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        {error !== "" ? (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={!file || uploading}
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {uploading ? "Uploading..." : "Upload to S3"}
        </button>
      </form>
      {uploadedUrl !== "" ? (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm">
          <p className="font-medium text-green-700">Uploaded successfully!</p>
          <a href={uploadedUrl} target="_blank" rel="noreferrer" className="mt-1 block break-all text-green-600 underline">{uploadedUrl}</a>
        </div>
      ) : null}
    </div>
  );
}