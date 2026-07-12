"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  useConfiguratorStore,
  GRAPHIC_SCALE_MIN,
  GRAPHIC_SCALE_MAX,
} from "@/features/configurator/store";
import { GarmentPhoto } from "@/components/configurator/GarmentPhoto";
import { useCatalog } from "@/features/catalog/useCatalog";
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type DragState =
  | { mode: "move"; layer: DragLayer; startX: number; startY: number; origX: number; origY: number }
  | { mode: "resize"; startX: number; startY: number; origScale: number; centerX: number; centerY: number };

export function ConfiguratorPreview() {
  const frameRef = useRef<HTMLDivElement>(null);
  const graphicRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

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
  const { garments } = useCatalog();
  const garment = garments.find((g) => g.id === garmentStyle);
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
      mode: "move",
      layer,
      startX: e.clientX,
      startY: e.clientY,
      origX: target.x,
      origY: target.y,
    };
  }

  function handleResizeStart(e: ReactPointerEvent) {
    e.stopPropagation();
    if (!side.graphic || !graphicRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const box = graphicRef.current.getBoundingClientRect();
    dragRef.current = {
      mode: "resize",
      startX: e.clientX,
      startY: e.clientY,
      origScale: side.graphic.scale,
      centerX: box.left + box.width / 2,
      centerY: box.top + box.height / 2,
    };
  }

  function handlePointerMove(e: ReactPointerEvent) {
    const drag = dragRef.current;
    const frame = frameRef.current;
    if (!drag || !frame) return;

    if (drag.mode === "resize") {
      const startDist = Math.hypot(drag.startX - drag.centerX, drag.startY - drag.centerY);
      const currentDist = Math.hypot(e.clientX - drag.centerX, e.clientY - drag.centerY);
      if (startDist < 1) return;
      const nextScale = clamp(
        drag.origScale * (currentDist / startDist),
        GRAPHIC_SCALE_MIN,
        GRAPHIC_SCALE_MAX,
      );
      updateGraphic(view, { scale: nextScale });
      return;
    }

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
            ref={graphicRef}
            aria-hidden="true"
            onPointerDown={(e) => handlePointerDown(e, "graphic")}
            className="absolute left-1/2 top-1/2 h-24 w-24 cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(-50%, -50%) translate(${side.graphic.x}%, ${side.graphic.y}%) scale(${side.graphic.scale}) rotate(${side.graphic.rotation}deg)`,
            }}
          >
            <div
              className="h-full w-full"
              style={{ mixBlendMode: useMultiply ? "multiply" : undefined }}
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

            <div
              aria-hidden="true"
              onPointerDown={handleResizeStart}
              className="absolute -bottom-2.5 -right-2.5 flex h-6 w-6 cursor-nwse-resize items-center justify-center rounded-full border border-white/70 bg-bg text-accent shadow-md shadow-black/50 transition-colors hover:bg-accent hover:text-accent-fg"
              style={{ transform: `scale(${1 / side.graphic.scale})` }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <line x1="19" y1="5" x2="5" y2="19" />
                <polyline points="19 11 19 5 13 5" />
                <polyline points="5 13 5 19 11 19" />
              </svg>
            </div>
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
