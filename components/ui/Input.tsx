import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, name, ...props },
  ref,
) {
  const inputId = id ?? name;
  return (
    <label className="block" htmlFor={inputId}>
      <span className="text-sm text-fg-muted">{label}</span>
      <input
        ref={ref}
        id={inputId}
        name={name}
        aria-invalid={Boolean(error)}
        className={cn(
          "mt-2 w-full rounded-lg border bg-bg px-3 py-2 text-fg focus:outline-none",
          error ? "border-accent" : "border-border focus:border-accent",
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-accent">{error}</span> : null}
    </label>
  );
});
