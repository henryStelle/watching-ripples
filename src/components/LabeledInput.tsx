interface LabeledInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  label: string;
  onChange: (v: string) => void;
  hint?: string;
  /** Use "prominent" for the main form input, "subtle" for advanced option inputs */
  variant?: "prominent" | "subtle";
}

export function LabeledInput({
  label,
  onChange,
  hint,
  id,
  type = "number",
  variant = "subtle",
  className,
  ...props
}: LabeledInputProps) {
  const inputClass =
    variant === "prominent"
      ? "w-full p-3 text-lg border-2 border-gray-300 rounded-md focus:outline-none focus:border-primary transition-colors"
      : "w-full p-2 border border-gray-300 rounded";

  const labelClass =
    variant === "prominent"
      ? "block font-bold mb-2 text-gray-700"
      : "block text-gray-700 font-semibold mb-1";

  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        {...props}
      />
      {hint && <small className="text-gray-600 block mt-1">{hint}</small>}
    </div>
  );
}
