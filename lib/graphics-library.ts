import graphicsData from "@/data/graphics-library.json";
import type { LibraryGraphic } from "@/types/configurator";

export const graphicsLibrary = graphicsData as LibraryGraphic[];

export function getLibraryGraphic(id: string): LibraryGraphic | undefined {
  return graphicsLibrary.find((g) => g.id === id);
}
