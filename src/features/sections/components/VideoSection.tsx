interface VideoSectionProps {
  mediaUrl: string | null;
}

export default function VideoSection({ mediaUrl }: VideoSectionProps) {
  if (!mediaUrl) return null;

  return (
    <video
      src={mediaUrl}
      controls
      playsInline
      className="w-full"
    />
  );
}
