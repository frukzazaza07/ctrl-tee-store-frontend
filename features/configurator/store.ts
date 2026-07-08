import { create } from "zustand";
import type { GarmentColorId } from "@/lib/theme";
import type { GarmentStyle } from "@/types/product";
import type {
  ConfiguratorConfig,
  ConfiguratorView,
  GarmentFit,
  GraphicLayer,
  TextLayer,
} from "@/types/configurator";

export const GRAPHIC_SCALE_MIN = 0.3;
export const GRAPHIC_SCALE_MAX = 2.5;

export function defaultConfig(garmentStyle: GarmentStyle): ConfiguratorConfig {
  return {
    garmentStyle,
    fit: "regular",
    color: "black",
    view: "front",
    front: { graphic: null, text: null },
    back: { graphic: null, text: null },
  };
}

export function defaultTextLayer(): TextLayer {
  return {
    content: "",
    font: "sans",
    color: "#f5f6f7",
    x: 0,
    y: 20,
    size: 32,
    rotation: 0,
  };
}

export function defaultGraphicLayer(
  source: GraphicLayer["source"],
  value: string,
): GraphicLayer {
  return { source, value, x: 0, y: -5, scale: 1, rotation: 0 };
}

interface ConfiguratorState extends ConfiguratorConfig {
  setGarmentStyle: (style: GarmentStyle) => void;
  setFit: (fit: GarmentFit) => void;
  setColor: (color: GarmentColorId) => void;
  setView: (view: ConfiguratorView) => void;
  setGraphic: (view: ConfiguratorView, graphic: GraphicLayer | null) => void;
  updateGraphic: (
    view: ConfiguratorView,
    patch: Partial<GraphicLayer>,
  ) => void;
  setText: (view: ConfiguratorView, text: TextLayer | null) => void;
  updateText: (view: ConfiguratorView, patch: Partial<TextLayer>) => void;
  loadConfig: (config: ConfiguratorConfig) => void;
  reset: (garmentStyle: GarmentStyle) => void;
}

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  ...defaultConfig("crew"),

  setGarmentStyle: (garmentStyle) => set({ garmentStyle }),
  setFit: (fit) => set({ fit }),
  setColor: (color) => set({ color }),
  setView: (view) => set({ view }),

  setGraphic: (view, graphic) =>
    set((state) =>
      view === "front"
        ? { front: { ...state.front, graphic } }
        : { back: { ...state.back, graphic } },
    ),

  updateGraphic: (view, patch) =>
    set((state) => {
      const side = view === "front" ? state.front : state.back;
      if (!side.graphic) return {};
      const updated = { ...side, graphic: { ...side.graphic, ...patch } };
      return view === "front" ? { front: updated } : { back: updated };
    }),

  setText: (view, text) =>
    set((state) =>
      view === "front"
        ? { front: { ...state.front, text } }
        : { back: { ...state.back, text } },
    ),

  updateText: (view, patch) =>
    set((state) => {
      const side = view === "front" ? state.front : state.back;
      if (!side.text) return {};
      const updated = { ...side, text: { ...side.text, ...patch } };
      return view === "front" ? { front: updated } : { back: updated };
    }),

  loadConfig: (config) => set({ ...config }),
  reset: (garmentStyle) => set(defaultConfig(garmentStyle)),
}));

export function configFromState(state: ConfiguratorConfig): ConfiguratorConfig {
  const { garmentStyle, fit, color, view, front, back } = state;
  return { garmentStyle, fit, color, view, front, back };
}
