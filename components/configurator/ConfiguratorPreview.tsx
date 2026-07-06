"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useConfiguratorStore } from "@/features/configurator/store";
import { GarmentMockup } from "@/components/configurator/GarmentMockup";
import { getLibraryGraphic } from "@/lib/graphics-library";
import { garmentColors, type GarmentColorId } from "@/lib/theme";
import type { TextFont } from "@/types/configurator";

const FONT_FAMILY: Record<TextFont, string> = {
  sans: "var(--font-body), sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', monospace",
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function iconTintFor(color: GarmentColorId): string {
  return color === "white" || color === "stone" ? "#0e1418" : "#f5f6f7";
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
    fit,
    color,
    view,
    front,
    back,
    updateGraphic,
    updateText,
  } = useConfiguratorStore();

  const side = view === "front" ? front : back;
  const colorHex = garmentColors.find((c) => c.id === color)?.hex ?? "#0e1418";
  const libraryGraphic =
    side.graphic?.source === "library"
      ? getLibraryGraphic(side.graphic.value)
      : null;

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
    const nextX = clamp(drag.origX + dxPct, -45, 45);
    const nextY = clamp(drag.origY + dyPct, -45, 45);
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
      <GarmentMockup style={garmentStyle} view={view} fit={fit} colorHex={colorHex} />

      {side.graphic && (
        <div
          aria-hidden="true"
          onPointerDown={(e) => handlePointerDown(e, "graphic")}
          className="absolute left-1/2 top-1/2 h-24 w-24 cursor-grab active:cursor-grabbing"
          style={{
            transform: `translate(-50%, -50%) translate(${side.graphic.x}%, ${side.graphic.y}%) scale(${side.graphic.scale}) rotate(${side.graphic.rotation}deg)`,
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
  );
}
