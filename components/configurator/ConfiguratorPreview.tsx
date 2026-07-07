"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useConfiguratorStore } from "@/features/configurator/store";
import { GarmentPhoto } from "@/components/configurator/GarmentPhoto";
import { getGarment } from "@/lib/garments";
import { getPrintArea, printAreaClipPath, clampToPrintArea } from "@/features/configurator/printArea";
import { getLibraryGraphic } from "@/lib/graphics-library";
import type { GarmentColorId } from "@/lib/theme";
import type { TextFont } from "@/types/configurator";

const FONT_FAMILY: Record<TextFont, string> = {
  sans: "var(--font-body), sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', monospace",
};

const LIGHT_GARMENT_COLORS = new Set<GarmentColorId>(["white", "stone"]);

function iconTintFor(color: GarmentColorId): string {
  return LIGHT_GARMENT_COLORS.has(color) ? "#0e1418" : "#f5f6f7";
}

type DragLayer = "graphic" | "text";

export function ConfiguratorPreview() {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    layer: DragLayer;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const {
    garmentStyle,
    color,
    view,
    front,
    back,
    updateGraphic,
    updateText,
  } = useConfiguratorStore();

  const side = view === "front" ? front : back;
  const garment = getGarment(garmentStyle);
  const printArea = garment
    ? getPrintArea(garment, view)
    : { x: 0, y: 0, width: 100, height: 100 };
  const libraryGraphic =
    side.graphic?.source === "library"
      ? getLibraryGraphic(side.graphic.value)
      : null;
  const useMultiply = LIGHT_GARMENT_COLORS.has(color);

  function handlePointerDown(e: ReactPointerEvent, layer: DragLayer) {
    const target = layer === "graphic" ? side.graphic : side.text;
    if (!target) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      layer,
      startX: e.clientX,
      startY: e.clientY,
      origX: target.x,
      origY: target.y,
    };
  }

  function handlePointerMove(e: ReactPointerEvent) {
    const drag = dragRef.current;
    const frame = frameRef.current;
    if (!drag || !frame) return;
    const rect = frame.getBoundingClientRect();
    const dxPct = ((e.clientX - drag.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - drag.startY) / rect.height) * 100;
    const { x: nextX, y: nextY } = clampToPrintArea(
      printArea,
      drag.origX + dxPct,
      drag.origY + dyPct,
    );
    if (drag.layer === "graphic") updateGraphic(view, { x: nextX, y: nextY });
    else updateText(view, { x: nextX, y: nextY });
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  return (
    <div
      ref={frameRef}
      className="relative aspect-[4/5] w-full touch-none select-none overflow-hidden rounded-2xl bg-preview-bg"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <GarmentPhoto style={garmentStyle} view={view} color={color} />

      <div
        className="absolute inset-0"
        style={{ clipPath: printAreaClipPath(printArea) }}
      >
        {side.graphic && (
          <div
            aria-hidden="true"
            onPointerDown={(e) => handlePointerDown(e, "graphic")}
            className="absolute left-1/2 top-1/2 h-24 w-24 cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(-50%, -50%) translate(${side.graphic.x}%, ${side.graphic.y}%) scale(${side.graphic.scale}) rotate(${side.graphic.rotation}deg)`,
              mixBlendMode: useMultiply ? "multiply" : undefined,
            }}
          >
            {side.graphic.source === "upload" ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL, not a static asset
              <img
                src={side.graphic.value}
                alt=""
                className="h-full w-full object-contain"
                draggable={false}
              />
            ) : libraryGraphic ? (
              <svg viewBox={libraryGraphic.viewBox} className="h-full w-full">
                <path
                  d={libraryGraphic.path}
                  fillRule={libraryGraphic.fillRule}
                  fill={iconTintFor(color)}
                />
              </svg>
            ) : null}
          </div>
        )}

        {side.text?.content && (
          <div
            aria-hidden="true"
            onPointerDown={(e) => handlePointerDown(e, "text")}
            className="absolute left-1/2 top-1/2 max-w-[80%] cursor-grab whitespace-nowrap font-semibold active:cursor-grabbing"
            style={{
              transform: `translate(-50%, -50%) translate(${side.text.x}%, ${side.text.y}%) rotate(${side.text.rotation}deg)`,
              color: side.text.color,
              fontFamily: FONT_FAMILY[side.text.font],
              fontSize: side.text.size,
            }}
          >
            {side.text.content}
          </div>
        )}
      </div>
    </div>
  );
}
