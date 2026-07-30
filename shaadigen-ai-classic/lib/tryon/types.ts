export type OutfitId = "lehenga" | "sherwani" | "jewelry";
export type LightingId = "sunset" | "stage" | "mandap";
export type TryOnProviderId = "aws-nova" | "openai" | "vertex";

export type GarmentClass =
  | "UPPER_BODY"
  | "LOWER_BODY"
  | "FULL_BODY"
  | "FOOTWEAR";

export interface OutfitGarment {
  id: OutfitId;
  fileName: string;
  garmentClass: GarmentClass;
  /** Used by OpenAI/prompt-based providers */
  promptLabel: string;
}

export interface TryOnRequest {
  personBase64: string;
  personMimeType: string;
  garmentBase64: string;
  garmentMimeType: string;
  outfitId: OutfitId;
  garmentClass: GarmentClass;
  lightingId?: LightingId;
  promptLabel: string;
}

export interface TryOnResult {
  imageBase64: string;
  mimeType: string;
  provider: TryOnProviderId;
}

export class TryOnError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "TryOnError";
    this.status = status;
  }
}
