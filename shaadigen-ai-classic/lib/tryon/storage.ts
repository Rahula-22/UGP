import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { TryOnError } from "./types";

/** Optional: upload result to S3 when TRYON_S3_BUCKET is set. Returns public/HTTPS URL if configured. */
export async function maybeUploadTryOnResult(
  imageBase64: string,
  mimeType: string,
  outfitId: string,
): Promise<string | null> {
  const bucket = process.env.TRYON_S3_BUCKET;
  if (!bucket) return null;

  const region =
    process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
  const client = new S3Client({ region });
  const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";
  const key = `try-on/${outfitId}-${Date.now()}.${ext}`;
  const body = Buffer.from(imageBase64, "base64");

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: mimeType,
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "S3 upload failed";
    throw new TryOnError(`Failed to upload try-on result to S3: ${message}`, 502);
  }

  const publicBase = process.env.TRYON_S3_PUBLIC_BASE_URL;
  if (publicBase) {
    return `${publicBase.replace(/\/$/, "")}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
