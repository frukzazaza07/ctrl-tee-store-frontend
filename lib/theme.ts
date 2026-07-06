/**
 * Design tokens mirrored from app/globals.css CSS variables.
 * Use these in contexts Tailwind classes can't reach directly
 * (inline SVG fills, Framer Motion configs, canvas-less computed styles).
 */
export const colors = {
  bg: "#0e1418",
  bgRaised: "#161d22",
  fg: "#f5f6f7",
  fgMuted: "#9aa4ab",
  border: "#2a3339",
  accent: "#e4002b",
  accentFg: "#ffffff",
} as const;

export const motionTokens = {
  fast: 0.2,
  base: 0.4,
  slow: 0.7,
  easeOut: [0.16, 1, 0.3, 1] as const,
} as const;

export const garmentColors = [
  { id: "black", name: "Black", hex: "#0e1418" },
  { id: "white", name: "White", hex: "#f5f6f7" },
  { id: "red", name: "Racing Red", hex: "#e4002b" },
  { id: "stone", name: "Stone", hex: "#a89f91" },
  { id: "navy", name: "Navy", hex: "#1b2a4a" },
  { id: "olive", name: "Olive", hex: "#4a4f3a" },
] as const;

export type GarmentColorId = (typeof garmentColors)[number]["id"];
