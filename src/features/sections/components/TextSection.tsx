interface TextSectionProps {
  content: string | null;
}

/**
 * Renders rich text HTML content stored by the Lexical editor.
 * Uses dangerouslySetInnerHTML — content is admin-authored, not user-submitted.
 */
export default function TextSection({ content }: TextSectionProps) {
  if (!content) return null;

  // Detect if content is plain text (legacy) or HTML
  const isHtml = content.trimStart().startsWith('<');

  if (!isHtml) {
    return (
      <div className="px-5 sm:px-10">
        <p className="text-lg sm:text-xl font-light leading-relaxed text-neutral-300 max-w-6xl whitespace-pre-wrap">
          {content}
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 sm:px-10">
      <div
        className="prose-case-study max-w-6xl"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
