interface VideoSectionProps {
  mediaUrl: string | null;
}

export default function VideoSection({ mediaUrl }: VideoSectionProps) {
  if (!mediaUrl) return null;

  return (
    // Full-bleed — no horizontal padding
    <div className="w-full bg-neutral-950">
      <video
        src={mediaUrl}
        controls
        playsInline
        className="w-full aspect-video object-cover"
      />
    </div>
  );
}
