"use client";

import { useConfiguratorStore } from "@/features/configurator/store";
import { garmentColors } from "@/lib/theme";
import { ColorSelector } from "@/components/product/ColorSelector";

const ALL_COLOR_IDS = garmentColors.map((c) => c.id);

export function StepColor() {
  const color = useConfiguratorStore((s) => s.color);
  const setColor = useConfiguratorStore((s) => s.setColor);

  return <ColorSelector colorIds={ALL_COLOR_IDS} value={color} onChange={setColor} />;
}
