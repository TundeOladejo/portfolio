interface TextSectionProps {
  content: string | null;
}

export default function TextSection({ content }: TextSectionProps) {
  if (!content) return null;

  return (
    <div className="whitespace-pre-wrap text-base leading-relaxed text-neutral-300">
      {content}
    </div>
  );
}
