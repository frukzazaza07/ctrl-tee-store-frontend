export const ACCEPTED_DESIGN_TYPES = ["image/png", "image/jpeg"] as const;
export const MAX_DESIGN_FILE_BYTES = 10 * 1024 * 1024;

export type DesignFileError = "type" | "size";
export type DesignFileValidation = { ok: true } | { ok: false; reason: DesignFileError };

export function validateDesignFile(file: File): DesignFileValidation {
  if (!ACCEPTED_DESIGN_TYPES.includes(file.type as (typeof ACCEPTED_DESIGN_TYPES)[number])) {
    return { ok: false, reason: "type" };
  }
  if (file.size > MAX_DESIGN_FILE_BYTES) {
    return { ok: false, reason: "size" };
  }
  return { ok: true };
}

export function readDesignFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
