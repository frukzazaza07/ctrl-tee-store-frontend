import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: readonly string[];
  value: string;
  onChange: (size: string) => void;
}

export function SizeSelector({ sizes, value, onChange }: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          onClick={() => onChange(size)}
          aria-pressed={value === size}
          className={cn(
            "flex h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors",
            value === size
              ? "border-accent bg-accent/10 text-fg"
              : "border-border text-fg-muted hover:border-fg/40 hover:text-fg",
          )}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
