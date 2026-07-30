import { readFile } from "fs/promises";
import path from "path";
import type { OutfitGarment, OutfitId } from "./types";
import { TryOnError } from "./types";

export const OUTFIT_GARMENTS: Record<OutfitId, OutfitGarment> = {
  lehenga: {
    id: "lehenga",
    fileName: "lehenga.jpg",
    garmentClass: "FULL_BODY",
    promptLabel: "a red velvet embroidered Indian lehenga bridal outfit",
  },
  sherwani: {
    id: "sherwani",
    fileName: "sherwani.jpg",
    garmentClass: "UPPER_BODY",
    promptLabel: "a royal ivory embroidered sherwani",
  },
  jewelry: {
    id: "jewelry",
    fileName: "jewelry.jpg",
    garmentClass: "UPPER_BODY",
    promptLabel: "an antique gold temple jewelry necklace set (haram)",
  },
};

export function isOutfitId(value: string): value is OutfitId {
  return value in OUTFIT_GARMENTS;
}

export async function loadGarmentImage(outfitId: OutfitId): Promise<{
  base64: string;
  mimeType: string;
  meta: OutfitGarment;
}> {
  const meta = OUTFIT_GARMENTS[outfitId];
  const filePath = path.join(
    process.cwd(),
    "public",
    "garments",
    meta.fileName,
  );
  try {
    const buf = await readFile(filePath);
    return {
      base64: buf.toString("base64"),
      mimeType: "image/jpeg",
      meta,
    };
  } catch {
    throw new TryOnError(
      `Garment asset missing for ${outfitId}. Expected public/garments/${meta.fileName}`,
      500,
    );
  }
}

export const LIGHTING_HINTS: Record<string, string> = {
  sunset: "warm golden-hour sunset lighting",
  stage: "bright stage spotlight lighting with magenta accents",
  mandap: "warm diya-lit night mandap ambience",
};
