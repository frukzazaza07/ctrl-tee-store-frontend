import type { ConfiguratorConfig, ViewLayers } from "@/types/configurator";

/** Uploaded images (data URLs) are device-local and too large for a URL, so shared links only carry library graphics. */
function stripUploads(side: ViewLayers): ViewLayers {
  if (side.graphic?.source === "upload") {
    return { ...side, graphic: null };
  }
  return side;
}

export function encodeConfig(config: ConfiguratorConfig): string {
  const shareable: ConfiguratorConfig = {
    ...config,
    front: stripUploads(config.front),
    back: stripUploads(config.back),
  };
  const json = JSON.stringify(shareable);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeConfig(encoded: string): ConfiguratorConfig | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(json);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.garmentStyle === "string" &&
      typeof parsed.fit === "string" &&
      typeof parsed.color === "string"
    ) {
      return parsed as ConfiguratorConfig;
    }
    return null;
  } catch {
    return null;
  }
}

export function buildShareUrl(config: ConfiguratorConfig): string {
  const encoded = encodeConfig(config);
  const url = new URL(window.location.href);
  url.searchParams.set("c", encoded);
  return url.toString();
}
