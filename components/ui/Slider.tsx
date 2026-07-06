interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
}: SliderProps) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm text-fg-muted">
        <span>{label}</span>
        <span className="tabular-nums text-fg">
          {formatValue ? formatValue(value) : value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent"
      />
    </label>
  );
}
