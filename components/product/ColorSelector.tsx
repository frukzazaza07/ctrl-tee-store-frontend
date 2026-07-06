import { useTranslations } from "next-intl";
import { garmentColors, type GarmentColorId } from "@/lib/theme";
import { COLOR_LABEL_KEY } from "@/lib/labels";
import { cn } from "@/lib/utils";

interface ColorSelectorProps {
  colorIds: readonly GarmentColorId[];
  value: GarmentColorId;
  onChange: (color: GarmentColorId) => void;
}

export function ColorSelector({ colorIds, value, onChange }: ColorSelectorProps) {
  const t = useTranslations("configurator");
  const options = garmentColors.filter((c) => colorIds.includes(c.id));

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          aria-pressed={value === c.id}
          aria-label={t(COLOR_LABEL_KEY[c.id])}
          title={t(COLOR_LABEL_KEY[c.id])}
          className={cn(
            "h-11 w-11 rounded-full border-2 transition-transform",
            value === c.id ? "scale-110 border-accent" : "border-border hover:scale-105",
          )}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  );
}
