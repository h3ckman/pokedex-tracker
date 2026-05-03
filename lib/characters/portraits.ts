import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

const PORTRAIT_DIR = path.join(process.cwd(), "public", "portraits");
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

export type PresetPortrait = {
  url: string;
  label: string;
};

function humanize(basename: string): string {
  return basename
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export async function listPresetPortraits(): Promise<PresetPortrait[]> {
  try {
    const entries = await fs.readdir(PORTRAIT_DIR);
    const images = entries.filter((e) =>
      IMAGE_EXT.has(path.extname(e).toLowerCase()),
    );
    images.sort((a, b) => a.localeCompare(b));
    return images.map((file) => {
      const basename = file.replace(/\.[^.]+$/, "");
      return {
        url: `/portraits/${file}`,
        label: humanize(basename),
      };
    });
  } catch {
    return [];
  }
}

export const MAX_PORTRAIT_UPLOAD_BYTES = 500 * 1024;
export const ALLOWED_PORTRAIT_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
