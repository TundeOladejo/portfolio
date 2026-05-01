'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCloudinarySignature, saveCloudinaryMediaUrl } from '@/src/features/media/cloudinaryActions';
import { validateMimeType, validateFileSize } from '@/src/features/media/validation';

interface MediaUploaderProps {
  sectionId: string;
  sectionType: 'image' | 'video';
  currentUrl: string | null;
}

const ACCEPT: Record<'image' | 'video', string> = {
  image: 'image/jpeg,image/png,image/webp,image/gif',
  video: 'video/mp4,video/webm',
};

const ACCEPT_LABEL: Record<'image' | 'video', string> = {
  image: 'JPEG, PNG, WebP, GIF — max 50 MB',
  video: 'MP4, WebM — max 50 MB',
};

type Status = 'idle' | 'uploading' | 'success' | 'error';

export default function MediaUploader({ sectionId, sectionType, currentUrl }: MediaUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const [dragging, setDragging] = useState(false);

  async function upload(file: File) {
    setError(null);

    // Client-side validation
    if (!validateMimeType(file.type, sectionType)) {
      setError(`Unsupported file type. Accepted: ${ACCEPT_LABEL[sectionType]}`);
      return;
    }
    if (!validateFileSize(file.size)) {
      setError('File exceeds the 50 MB limit.');
      return;
    }

    setStatus('uploading');
    setProgress(10);

    // Step 1: Get Cloudinary upload signature from server
    const sigResult = await getCloudinarySignature(sectionId, file.type, file.size);
    if (!sigResult.success) {
      setError(
        sigResult.errors.mimeType?.[0] ??
        sigResult.errors.fileSize?.[0] ??
        sigResult.errors._form?.[0] ??
        'Upload failed.'
      );
      setStatus('error');
      return;
    }

    const { signature, timestamp, apiKey, folder, uploadUrl } = sigResult.data;
    setProgress(20);

    // Step 2: Upload directly to Cloudinary from the browser
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
    formData.append('folder', folder);

    let cloudinaryUrl: string;
    try {
      const res = await fetch(uploadUrl, { method: 'POST', body: formData });
      setProgress(80);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? `Upload failed (${res.status})`);
      }

      const data = await res.json();
      // Use secure_url — HTTPS Cloudinary CDN URL
      cloudinaryUrl = data.secure_url as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
      setStatus('error');
      return;
    }

    setProgress(90);

    // Step 3: Persist the Cloudinary URL to the section record
    const saveResult = await saveCloudinaryMediaUrl(sectionId, cloudinaryUrl);
    if (!saveResult.success) {
      setError(saveResult.errors._form?.[0] ?? 'Failed to save media URL.');
      setStatus('error');
      return;
    }

    setProgress(100);
    setPreviewUrl(cloudinaryUrl);
    setStatus('success');
    if (inputRef.current) inputRef.current.value = '';
    router.refresh();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Current media preview */}
      {previewUrl && (
        <div className="relative border border-neutral-800 overflow-hidden bg-neutral-900">
          {sectionType === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Section media" className="w-full max-h-56 object-contain" />
          ) : (
            <video src={previewUrl} controls className="w-full max-h-56" />
          )}
          <button
            type="button"
            onClick={() => setPreviewUrl(null)}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/60 text-white text-xs hover:bg-black transition-colors"
            aria-label="Remove preview"
          >
            ×
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => status !== 'uploading' && inputRef.current?.click()}
        className={`border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${
          dragging ? 'border-neutral-500 bg-neutral-800' : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
        } ${status === 'uploading' ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT[sectionType]}
          onChange={handleFileChange}
          className="sr-only"
        />

        {status === 'uploading' ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-full max-w-xs bg-neutral-800 h-1 overflow-hidden">
              <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-neutral-400">Uploading to Cloudinary… {progress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl text-neutral-600">{sectionType === 'image' ? '⬜' : '▶'}</div>
            <p className="text-sm text-neutral-400">
              {previewUrl ? 'Replace file' : 'Drop file here or click to browse'}
            </p>
            <p className="text-xs text-neutral-600">{ACCEPT_LABEL[sectionType]}</p>
          </div>
        )}
      </div>

      {status === 'success' && (
        <p className="text-xs text-emerald-400 flex items-center gap-1.5">✓ Uploaded to Cloudinary</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-400 flex items-center gap-1.5">✕ {error}</p>
      )}
    </div>
  );
}
