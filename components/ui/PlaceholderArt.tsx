import { hueFromSeed } from "@/lib/hash";
import { cn } from "@/lib/utils";

export type PlaceholderShape = "tshirt" | "hoodie" | "cap";

const shapePaths: Record<PlaceholderShape, string> = {
  tshirt:
    "M120,80 L160,40 L240,40 L280,80 L340,110 L310,180 L270,150 L270,440 L130,440 L130,150 L90,180 L60,110 Z",
  hoodie:
    "M120,100 L150,50 Q200,20 250,50 L280,100 L340,130 L310,200 L270,170 L270,440 L130,440 L130,170 L90,200 L60,130 Z M160,150 L240,150 L240,190 L160,190 Z",
  cap: "M100,220 Q200,100 300,220 L300,240 L100,240 Z M60,240 Q200,262 340,240 L340,255 Q200,280 60,255 Z",
};

interface PlaceholderArtProps {
  seed: string;
  shape?: PlaceholderShape;
  className?: string;
}

export function PlaceholderArt({
  seed,
  shape = "tshirt",
  className,
}: PlaceholderArtProps) {
  const hue = hueFromSeed(seed);
  const gradientId = `pa-${seed}`;

  return (
    <svg
      viewBox="0 0 400 480"
      className={cn("h-full w-full", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 45% 16%)`} />
          <stop offset="100%" stopColor={`hsl(${(hue + 50) % 360} 55% 9%)`} />
        </linearGradient>
      </defs>
      <rect width="400" height="480" fill={`url(#${gradientId})`} />
      <path
        d={shapePaths[shape]}
        fill="none"
        stroke={`hsl(${hue} 60% 70%)`}
        strokeOpacity={0.35}
        strokeWidth={2}
      />
    </svg>
  );
}
