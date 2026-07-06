"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { StepStyle } from "@/components/configurator/steps/StepStyle";
import { StepFit } from "@/components/configurator/steps/StepFit";
import { StepColor } from "@/components/configurator/steps/StepColor";
import { StepGraphic } from "@/components/configurator/steps/StepGraphic";
import { StepText } from "@/components/configurator/steps/StepText";
import { StepSummary } from "@/components/configurator/steps/StepSummary";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "style", labelKey: "stepStyle", Component: StepStyle },
  { id: "fit", labelKey: "stepFit", Component: StepFit },
  { id: "color", labelKey: "stepColor", Component: StepColor },
  { id: "graphic", labelKey: "stepGraphic", Component: StepGraphic },
  { id: "text", labelKey: "stepText", Component: StepText },
  { id: "summary", labelKey: "stepSummary", Component: StepSummary },
] as const;

export function StepPanel() {
  const t = useTranslations("configurator");
  const [index, setIndex] = useState(0);
  const Current = STEPS[index].Component;

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex flex-wrap gap-2" aria-label={t("stepSummary")}>
        {STEPS.map((step, i) => (
          <button
            key={step.id}
            type="button"
            aria-current={i === index ? "step" : undefined}
            onClick={() => setIndex(i)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              i === index
                ? "border-fg bg-fg text-bg"
                : "border-border text-fg-muted hover:text-fg",
            )}
          >
            <span className="mr-1.5 text-xs opacity-60">{i + 1}</span>
            {t(step.labelKey)}
          </button>
        ))}
      </nav>

      <div>
        <Current />
      </div>

      <div className="flex justify-between border-t border-border pt-6">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className={buttonVariants({ variant: "ghost" })}
        >
          {t("prev")}
        </button>
        {index < STEPS.length - 1 && (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(STEPS.length - 1, i + 1))}
            className={buttonVariants({ variant: "secondary" })}
          >
            {t("next")}
          </button>
        )}
      </div>
    </div>
  );
}
