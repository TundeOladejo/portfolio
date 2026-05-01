'use client';

import { useRef, useState } from 'react';
import { getCoverImageSignature } from '@/src/features/media/cloudinaryActions';

interface CoverImageInputProps {
  defaultValue?: string;
  error?: string;
}

type Tab = 'url' | 'upload';

function normalizeImageUrl(url: string): string {
  if (!url) return url;
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  if (driveMatch) return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  const driveOpenMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (driveOpenMatch) return `https://drive.google.com/uc?export=view&id=${driveOpenMatch[1]}`;
  return url;
}

export default function CoverImageInput({ defaultValue, error }: CoverImageInputProps) {
  const [tab, setTab] = useState<Tab>('url');
  const [urlValue, setUrlValue] = useState(defaultValue ?? '');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const finalUrl = tab === 'upload' ? (uploadedUrl ?? '') : normalizeImageUrl(urlValue);
  const previewUrl = finalUrl || null;

  async function handleFile(file: File) {
    setUploadError(null);
    setUploading(true);
    setUploadProgress(10);

    // Validate client-side
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED.includes(file.type)) {
      setUploadError('Unsupported file type. Use JPEG, PNG, WebP, or GIF.');
      setUploading(false);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File exceeds the 50 MB limit.');
      setUploading(false);
      return;
    }

    // Get Cloudinary signature from server
    const sigResult = await getCoverImageSignature();
    if (!sigResult.success) {
      setUploadError(sigResult.errors._form?.[0] ?? 'Upload failed.');
      setUploading(false);
      return;
    }

    const { signature, timestamp, apiKey, folder, uploadUrl } = sigResult.data;
    setUploadProgress(30);

    // Upload directly to Cloudinary
    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', apiKey);
    fd.append('timestamp', String(timestamp));
    fd.append('signature', signature);
    fd.append('folder', folder);

    try {
      const res = await fetch(uploadUrl, { method: 'POST', body: fd });
      setUploadProgress(90);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? `Upload failed (${res.status})`);
      }

      const data = await res.json();
      setUploadedUrl(data.secure_url as string);
      setPreviewFailed(false);
      setUploadProgress(100);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Label + tab switcher */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium tracking-widest uppercase text-neutral-400">
          Cover Image <span className="text-neutral-600">*</span>
        </label>
        <div className="flex border border-neutral-800 text-xs">
          {(['url', 'upload'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-1 transition-colors capitalize ${
                tab === t ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Hidden input carries the final URL into the form */}
      <input type="hidden" name="cover_image_url" value={finalUrl} />

      {/* ── URL tab ─────────────────────────────────────────────── */}
      {tab === 'url' && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={urlValue}
            onChange={(e) => { setUrlValue(e.target.value); setPreviewFailed(false); }}
            placeholder="https://res.cloudinary.com/... or Google Drive / OneDrive link"
            className={`w-full bg-neutral-950 border px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-700 outline-none transition-colors focus:border-neutral-500 ${
              error ? 'border-red-700' : 'border-neutral-800'
            }`}
          />
          <p className="text-xs text-neutral-600">
            Paste a Cloudinary URL, any direct image URL, or a Google Drive / OneDrive share link.
          </p>
        </div>
      )}

      {/* ── Upload tab ──────────────────────────────────────────── */}
      {tab === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${
            dragging ? 'border-neutral-500 bg-neutral-800' : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
          } ${uploading ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            className="sr-only"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-full max-w-xs bg-neutral-800 h-1 overflow-hidden">
                <div className="h-full bg-white transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-xs text-neutral-400">Uploading to Cloudinary… {uploadProgress}%</p>
            </div>
          ) : uploadedUrl ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-emerald-400 text-sm">✓ Uploaded to Cloudinary</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setUploadedUrl(null); }}
                className="text-xs text-neutral-500 hover:text-neutral-300 underline"
              >
                Replace
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl text-neutral-600">⬜</span>
              <p className="text-sm text-neutral-400">Drop image here or click to browse</p>
              <p className="text-xs text-neutral-600">JPEG, PNG, WebP, GIF — max 50 MB</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
      {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}

      {/* Live preview */}
      {previewUrl && !previewFailed && (
        <div className="border border-neutral-800 overflow-hidden">
          <p className="px-3 py-2 text-xs tracking-widest uppercase text-neutral-600 border-b border-neutral-800 bg-neutral-900">Preview</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Cover preview"
            loading="lazy"
            decoding="async"
            className="w-full aspect-video object-cover bg-neutral-900"
            onError={() => setPreviewFailed(true)}
          />
        </div>
      )}
      {previewUrl && previewFailed && (
        <div className="border border-amber-900/50 bg-amber-950/20 px-4 py-3">
          <p className="text-xs text-amber-400">
            ⚠ Preview unavailable — the URL may not be a direct image link.
            {urlValue.includes('drive.google.com') && ' Make sure the Google Drive file is shared publicly.'}
          </p>
        </div>
      )}
    </div>
  );
}
