import Image from 'next/image';

interface ImageSectionProps {
  mediaUrl: string | null;
  alt?: string;
}

export default function ImageSection({
  mediaUrl,
  alt = '',
}: ImageSectionProps) {
  if (!mediaUrl) return null;

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
      <Image
        src={mediaUrl}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 80vw"
        className="object-cover"
      />
    </div>
  );
}
