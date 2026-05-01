interface FormInputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  errors?: string[];
}

export default function FormInput({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  defaultValue,
  required,
  errors,
}: FormInputProps) {
  const hasErrors = errors && errors.length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium tracking-wide text-neutral-300 uppercase"
      >
        {label}
        {required && <span className="ml-1 text-neutral-500">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className={[
          'w-full rounded-none border-b bg-transparent px-0 py-2.5',
          'text-neutral-100 placeholder-neutral-600',
          'outline-none transition-colors duration-200',
          'focus:border-neutral-300',
          hasErrors
            ? 'border-red-500 focus:border-red-400'
            : 'border-neutral-700',
        ].join(' ')}
      />
      {hasErrors && (
        <ul className="flex flex-col gap-0.5">
          {errors!.map((error, i) => (
            <li key={i} className="text-xs text-red-400">
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
