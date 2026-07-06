import type { ConfiguratorView, GarmentFit } from "@/types/configurator";
import type { GarmentStyle } from "@/types/product";

interface GarmentMockupProps {
  style: GarmentStyle;
  view: ConfiguratorView;
  fit: GarmentFit;
  colorHex: string;
}

const FIT_SCALE: Record<GarmentFit, number> = {
  slim: 0.92,
  regular: 1,
  oversized: 1.14,
};

const SHORT_SLEEVE_BODY =
  "M140,70 L120,110 L60,140 L85,205 L135,178 L135,460 L265,460 L265,178 L315,205 L340,140 L280,110 L260,70 Z";

const LONG_SLEEVE_BODY =
  "M140,70 L120,110 L55,140 L60,340 L110,335 L135,200 L135,460 L265,460 L265,200 L290,335 L340,340 L345,140 L280,110 L260,70 Z";

const CREW_NECK = "M165,70 Q200,105 235,70 Z";
const V_NECK = "M170,70 L200,140 L230,70 Z";

function necklinePath(style: GarmentStyle, view: ConfiguratorView): string {
  if (style === "vneck" && view === "front") return V_NECK;
  return CREW_NECK;
}

export function GarmentMockup({ style, view, fit, colorHex }: GarmentMockupProps) {
  const bodyPath = style === "long-sleeve" ? LONG_SLEEVE_BODY : SHORT_SLEEVE_BODY;
  const neckPath = necklinePath(style, view);
  const scaleX = FIT_SCALE[fit];

  return (
    <svg viewBox="0 0 400 500" className="h-full w-full" aria-hidden="true">
      <g transform={`translate(200,265) scale(${scaleX},1) translate(-200,-265)`}>
        <path
          d={bodyPath}
          fill={colorHex}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {view === "back" && (
          <line
            x1="200"
            y1="80"
            x2="200"
            y2="440"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth={1}
          />
        )}
        <path d={neckPath} fill="var(--color-preview-bg)" stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
      </g>
    </svg>
  );
}
