import { loadGarmentImage, isOutfitId } from "./garments";
import { runAwsNovaTryOn } from "./providers/aws-nova";
import { runOpenAITryOn } from "./providers/openai";
import { runVertexTryOn } from "./providers/vertex";
import { maybeUploadTryOnResult } from "./storage";
import type {
  LightingId,
  OutfitId,
  TryOnProviderId,
  TryOnRequest,
  TryOnResult,
} from "./types";
import { TryOnError } from "./types";

export {
  isOutfitId,
  loadGarmentImage,
  TryOnError,
  type OutfitId,
  type LightingId,
  type TryOnProviderId,
};

const MAX_PERSON_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export function getActiveProvider(): TryOnProviderId {
  const raw = (process.env.TRYON_PROVIDER || "aws-nova").toLowerCase();
  if (raw === "openai" || raw === "vertex" || raw === "aws-nova") return raw;
  throw new TryOnError(
    `Unknown TRYON_PROVIDER "${raw}". Use aws-nova | openai | vertex.`,
    500,
  );
}

export async function bufferFromPersonFile(file: File): Promise<{
  base64: string;
  mimeType: string;
}> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new TryOnError(
      "Person photo must be JPEG, PNG, or WebP",
      400,
    );
  }
  if (file.size > MAX_PERSON_BYTES) {
    throw new TryOnError("Person photo must be under 10MB", 400);
  }
  const buf = Buffer.from(await file.arrayBuffer());
  return {
    base64: buf.toString("base64"),
    mimeType: file.type === "image/jpg" ? "image/jpeg" : file.type,
  };
}

async function invokeProvider(req: TryOnRequest): Promise<TryOnResult> {
  const provider = getActiveProvider();
  switch (provider) {
    case "aws-nova":
      return runAwsNovaTryOn(req);
    case "openai":
      return runOpenAITryOn(req);
    case "vertex":
      return runVertexTryOn(req);
    default:
      throw new TryOnError(`Unsupported provider: ${provider}`, 500);
  }
}

export async function runVirtualTryOn(input: {
  personFile: File;
  outfitId: string;
  lightingId?: string;
}): Promise<{
  imageUrl: string;
  provider: TryOnProviderId;
  outfitId: OutfitId;
}> {
  if (!isOutfitId(input.outfitId)) {
    throw new TryOnError(
      "Invalid outfitId. Expected lehenga | sherwani | jewelry",
      400,
    );
  }

  const person = await bufferFromPersonFile(input.personFile);
  const garment = await loadGarmentImage(input.outfitId);

  const req: TryOnRequest = {
    personBase64: person.base64,
    personMimeType: person.mimeType,
    garmentBase64: garment.base64,
    garmentMimeType: garment.mimeType,
    outfitId: input.outfitId,
    garmentClass: garment.meta.garmentClass,
    lightingId: input.lightingId as LightingId | undefined,
    promptLabel: garment.meta.promptLabel,
  };

  const result = await invokeProvider(req);
  const s3Url = await maybeUploadTryOnResult(
    result.imageBase64,
    result.mimeType,
    input.outfitId,
  );

  return {
    imageUrl: s3Url ?? `data:${result.mimeType};base64,${result.imageBase64}`,
    provider: result.provider,
    outfitId: input.outfitId,
  };
}
