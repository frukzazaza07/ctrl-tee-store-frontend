import { getLibraryGraphic } from "@/lib/graphics-library";
import { getPrintArea } from "@/features/configurator/printArea";
import type {
  ConfiguratorConfig,
  ConfiguratorView,
  Garment,
  TextFont,
  ViewLayers,
} from "@/types/configurator";
import type { GarmentColorId } from "@/lib/theme";

/**
 * The live preview positions layers against a fixed 96px box and font-size
 * inside a fluid aspect-[4/5] frame (see ConfiguratorPreview.tsx), calibrated
 * against the legacy 400-wide garment viewBox. Export re-derives absolute
 * pixel sizes from that same reference width so flattened output matches the
 * on-screen proportions at any garment photo resolution.
 */
const REFERENCE_WIDTH = 400;
const GRAPHIC_BOX_FRACTION = 96 / REFERENCE_WIDTH;

const FONT_FAMILY: Record<TextFont, string> = {
  sans: "system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', monospace",
};

const LIGHT_GARMENT_COLORS = new Set<GarmentColorId>(["white", "stone"]);

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function libraryGraphicToDataUrl(
  viewBox: string,
  path: string,
  fillRule: "evenodd" | "nonzero" | undefined,
  fill: string,
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><path d="${path}"${
    fillRule ? ` fill-rule="${fillRule}"` : ""
  } fill="${fill}"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

async function drawGraphicLayer(
  ctx: CanvasRenderingContext2D,
  layer: NonNullable<ViewLayers["graphic"]>,
  canvasWidth: number,
  canvasHeight: number,
  color: GarmentColorId,
): Promise<void> {
  const isLight = LIGHT_GARMENT_COLORS.has(color);
  const img =
    layer.source === "upload"
      ? await loadImage(layer.value)
      : await (async () => {
          const lib = getLibraryGraphic(layer.value);
          if (!lib) return null;
          return loadImage(
            libraryGraphicToDataUrl(lib.viewBox, lib.path, lib.fillRule, isLight ? "#0e1418" : "#f5f6f7"),
          );
        })();
  if (!img) return;

  const boxSize = GRAPHIC_BOX_FRACTION * canvasWidth;
  const fit = Math.min(boxSize / img.width, boxSize / img.height);
  const drawWidth = img.width * fit;
  const drawHeight = img.height * fit;

  const centerX = canvasWidth / 2 + (layer.x / 100) * canvasWidth;
  const centerY = canvasHeight / 2 + (layer.y / 100) * canvasHeight;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.scale(layer.scale, layer.scale);
  if (isLight) ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();
}

function drawTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: NonNullable<ViewLayers["text"]>,
  canvasWidth: number,
  canvasHeight: number,
): void {
  const centerX = canvasWidth / 2 + (layer.x / 100) * canvasWidth;
  const centerY = canvasHeight / 2 + (layer.y / 100) * canvasHeight;
  const fontSize = layer.size * (canvasWidth / REFERENCE_WIDTH);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.font = `600 ${fontSize}px ${FONT_FAMILY[layer.font]}`;
  ctx.fillStyle = layer.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(layer.content, 0, 0);
  ctx.restore();
}

/** Flattens garment photo + design + text for one view onto a canvas, or null if that side is empty. */
async function flattenViewToCanvas(
  config: ConfiguratorConfig,
  view: ConfiguratorView,
  garment: Garment,
): Promise<HTMLCanvasElement | null> {
  const side = view === "front" ? config.front : config.back;
  if (!side.graphic && !side.text?.content) return null;

  const garmentImg = await loadImage(garment.images[config.color][view]);
  const canvas = document.createElement("canvas");
  canvas.width = garmentImg.naturalWidth;
  canvas.height = garmentImg.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(garmentImg, 0, 0, canvas.width, canvas.height);

  const rect = getPrintArea(garment, view);
  ctx.save();
  ctx.beginPath();
  ctx.rect(
    (rect.x / 100) * canvas.width,
    (rect.y / 100) * canvas.height,
    (rect.width / 100) * canvas.width,
    (rect.height / 100) * canvas.height,
  );
  ctx.clip();

  if (side.graphic) await drawGraphicLayer(ctx, side.graphic, canvas.width, canvas.height, config.color);
  if (side.text?.content) drawTextLayer(ctx, side.text, canvas.width, canvas.height);
  ctx.restore();

  return canvas;
}

/** Flattens garment photo + design + text for one view into a single, print-ready PNG data URL, or null if that side is empty. */
export async function flattenViewToPng(
  config: ConfiguratorConfig,
  view: ConfiguratorView,
  garment: Garment,
): Promise<string | null> {
  const canvas = await flattenViewToCanvas(config, view, garment);
  return canvas ? canvas.toDataURL("image/png") : null;
}

export interface CartExport {
  thumbnail: string;
  printFiles: { front?: string; back?: string };
}

/**
 * Flattens whichever views have content; used to build the cart-item
 * thumbnail + print files on Add to Cart. Print files stay lossless PNG
 * (print-ready); the thumbnail is re-encoded as JPEG from the same canvas —
 * photographic content (garment photo + design) compresses far better as
 * JPEG, and a UI thumbnail doesn't need print-file fidelity. Without this,
 * a single flattened PNG can run into several MB and blow past the Server
 * Action body-size limit once it's part of an order payload.
 */
export async function buildCartExport(
  config: ConfiguratorConfig,
  garment: Garment | undefined,
): Promise<CartExport> {
  if (!garment) return { thumbnail: "", printFiles: {} };

  const [frontCanvas, backCanvas] = await Promise.all([
    flattenViewToCanvas(config, "front", garment),
    flattenViewToCanvas(config, "back", garment),
  ]);

  const printFiles: { front?: string; back?: string } = {};
  if (frontCanvas) printFiles.front = frontCanvas.toDataURL("image/png");
  if (backCanvas) printFiles.back = backCanvas.toDataURL("image/png");

  const primaryCanvas = frontCanvas ?? backCanvas;
  const thumbnail = primaryCanvas
    ? primaryCanvas.toDataURL("image/jpeg", 0.85)
    : garment.images[config.color].front;

  return { thumbnail, printFiles };
}
