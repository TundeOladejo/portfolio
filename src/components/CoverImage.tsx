'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CoverImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}

/**
 * Renders a cover image with two strategies:
 *
 * 1. next/image — used for configured hosts (Supabase, Unsplash, etc.)
 *    Provides automatic WebP conversion, resizing, and lazy loading.
 *
 * 2. Plain <img> with lazy loading + decoding="async" — used as fallback
 *    for unconfigured hosts (Google Drive, OneDrive, arbitrary URLs).
 *    Still performant: browser handles lazy loading natively.
 *
 * Falls back to a neutral placeholder if the image fails to load.
 */
export default function CoverImage({ src, alt, className = '', sizes }: CoverImageProps) {
  const [useNative, setUseNative] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`absolute inset-0 bg-neutral-800 flex items-center justify-center ${className}`}>
        <span className="text-neutral-600 text-xs tracking-widest uppercase">No image</span>
      </div>
    );
  }

  // Use plain img for Google Drive, OneDrive, and other unconfigured hosts
  if (useNative) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? '(max-width: 768px) 100vw, 50vw'}
      className={`object-cover ${className}`}
      onError={() => {
        // next/image failed — try native img (handles unconfigured hosts)
        setUseNative(true);
      }}
    />
  );
}
