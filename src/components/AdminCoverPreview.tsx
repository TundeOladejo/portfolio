'use client';

interface AdminCoverPreviewProps {
  src: string;
}

export default function AdminCoverPreview({ src }: AdminCoverPreviewProps) {
  return (
    <div className="border border-neutral-800">
      <div className="px-5 py-3 border-b border-neutral-800">
        <h3 className="text-xs font-medium tracking-widest uppercase text-neutral-500">
          Cover Preview
        </h3>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Cover"
        loading="lazy"
        decoding="async"
        className="w-full aspect-video object-cover bg-neutral-900"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}
