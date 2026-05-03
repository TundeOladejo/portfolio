import Image from 'next/image';

interface ImageSectionProps {
  mediaUrl: string | null;
  alt?: string;
}

export default function ImageSection({ mediaUrl, alt = '' }: ImageSectionProps) {
  if (!mediaUrl) return null;

  return (
    // Full-bleed — no horizontal padding, edge to edge
    <div className="relative w-full aspect-video sm:aspect-[16/8]">
      <Image
        src={mediaUrl}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
