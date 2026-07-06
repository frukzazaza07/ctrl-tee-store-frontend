"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/Button";
import { useConfiguratorStore, configFromState } from "@/features/configurator/store";
import { buildShareUrl } from "@/features/configurator/share";
import { cn } from "@/lib/utils";

export function ShareLinkButton() {
  const t = useTranslations("configurator");
  const state = useConfiguratorStore();
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const url = buildShareUrl(configFromState(state));
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
    >
      {copied ? t("shareCopied") : t("shareButton")}
    </button>
  );
}
