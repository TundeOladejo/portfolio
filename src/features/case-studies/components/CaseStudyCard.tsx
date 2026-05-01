import Image from 'next/image';
import Link from 'next/link';
import type { CaseStudy } from '@/src/features/case-studies/types';

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
}

export default function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  return (
    <Link
      href={`/${caseStudy.slug}`}
      className="group block overflow-hidden bg-neutral-900 transition-colors duration-300 hover:bg-neutral-800"
    >
      {/* Cover image */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-800">
        <Image
          src={caseStudy.cover_image_url}
          alt={caseStudy.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 className="mb-2 text-lg font-semibold leading-snug text-neutral-100 transition-colors duration-200 group-hover:text-white">
          {caseStudy.title}
        </h2>
        <p className="line-clamp-3 text-sm leading-relaxed text-neutral-400">
          {caseStudy.description}
        </p>
      </div>
    </Link>
  );
}
