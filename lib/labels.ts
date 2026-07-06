import type { GarmentColorId } from "@/lib/theme";
import type { GarmentStyle } from "@/types/product";
import type { GarmentFit } from "@/types/configurator";

export const COLOR_LABEL_KEY: Record<
  GarmentColorId,
  "colorBlack" | "colorWhite" | "colorRed" | "colorStone" | "colorNavy" | "colorOlive"
> = {
  black: "colorBlack",
  white: "colorWhite",
  red: "colorRed",
  stone: "colorStone",
  navy: "colorNavy",
  olive: "colorOlive",
};

export const STYLE_LABEL_KEY: Record<GarmentStyle, "styleCrew" | "styleVneck" | "styleLongSleeve"> = {
  crew: "styleCrew",
  vneck: "styleVneck",
  "long-sleeve": "styleLongSleeve",
};

export const FIT_LABEL_KEY: Record<GarmentFit, "fitSlim" | "fitRegular" | "fitOversized"> = {
  slim: "fitSlim",
  regular: "fitRegular",
  oversized: "fitOversized",
};
