'use client';

import { useActionState } from 'react';
import { createCaseStudy, updateCaseStudy } from '@/src/features/case-studies/actions';
import type { CaseStudy, ActionResult } from '@/src/features/case-studies/types';
import CoverImageInput from './CoverImageInput';

interface CaseStudyFormProps {
  caseStudy?: CaseStudy;
}

const initialState = { success: true, data: null } as unknown as ActionResult<CaseStudy>;

export default function CaseStudyForm({ caseStudy }: CaseStudyFormProps) {
  const action = caseStudy
    ? updateCaseStudy.bind(null, caseStudy.id)
    : createCaseStudy;

  const [state, formAction, pending] = useActionState(action, initialState);

  const fieldError = (key: string) =>
    !state.success ? state.errors[key]?.[0] : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Title */}
      <Field
        id="title"
        name="title"
        label="Title"
        required
        defaultValue={caseStudy?.title}
        error={fieldError('title')}
        placeholder="e.g. Redesigning the Checkout Experience"
      />

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-xs font-medium tracking-widest uppercase text-neutral-400">
          Description <span className="text-neutral-600">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={caseStudy?.description}
          placeholder="A brief overview of the project, goals, and outcome…"
          className={`w-full bg-neutral-950 border px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-700 outline-none resize-none transition-colors focus:border-neutral-500 ${
            fieldError('description') ? 'border-red-700' : 'border-neutral-800'
          }`}
        />
        {fieldError('description') && (
          <p className="text-xs text-red-400">{fieldError('description')}</p>
        )}
      </div>

      {/* Cover image — upload or URL (including Google Drive / OneDrive) */}
      <CoverImageInput
        defaultValue={caseStudy?.cover_image_url}
        error={fieldError('cover_image_url')}
      />

      {/* Form-level error */}
      {!state.success && state.errors._form && (
        <div className="border border-red-800 bg-red-950/30 px-4 py-3">
          {state.errors._form.map((e, i) => (
            <p key={i} className="text-sm text-red-400">{e}</p>
          ))}
        </div>
      )}

      {/* Success message */}
      {state.success && state.data && (
        <div className="border border-emerald-800 bg-emerald-950/30 px-4 py-3">
          <p className="text-sm text-emerald-400">Changes saved.</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 w-full bg-white text-black py-2.5 text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'Saving…' : caseStudy ? 'Save Changes' : 'Create Case Study'}
      </button>
    </form>
  );
}

function Field({
  id, name, label, required, defaultValue, error, placeholder, hint,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium tracking-widest uppercase text-neutral-400">
        {label} {required && <span className="text-neutral-600">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`w-full bg-neutral-950 border px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-700 outline-none transition-colors focus:border-neutral-500 ${
          error ? 'border-red-700' : 'border-neutral-800'
        }`}
      />
      {hint && !error && <p className="text-xs text-neutral-600">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
