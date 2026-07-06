"use client";

import { useEffect } from "react";
import { useConfiguratorStore } from "@/features/configurator/store";
import { decodeConfig } from "@/features/configurator/share";
import { ConfiguratorPreview } from "@/components/configurator/ConfiguratorPreview";
import { ViewToggle } from "@/components/configurator/ViewToggle";
import { PriceSummaryBar } from "@/components/configurator/PriceSummaryBar";
import { StepPanel } from "@/components/configurator/StepPanel";
import { Section } from "@/components/ui/Section";
import type { GarmentStyle } from "@/types/product";

interface ConfiguratorClientProps {
  garmentStyle: GarmentStyle;
  shareParam?: string;
}

export function ConfiguratorClient({
  garmentStyle,
  shareParam,
}: ConfiguratorClientProps) {
  const reset = useConfiguratorStore((s) => s.reset);
  const loadConfig = useConfiguratorStore((s) => s.loadConfig);

  useEffect(() => {
    if (shareParam) {
      const decoded = decodeConfig(shareParam);
      if (decoded) {
        loadConfig(decoded);
        return;
      }
    }
    if (useConfiguratorStore.getState().garmentStyle !== garmentStyle) {
      reset(garmentStyle);
    }
  }, [garmentStyle, shareParam, reset, loadConfig]);

  return (
    <Section className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <ViewToggle />
        <ConfiguratorPreview />
        <PriceSummaryBar />
      </div>
      <StepPanel />
    </Section>
  );
}
