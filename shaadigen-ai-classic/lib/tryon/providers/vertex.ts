import type { TryOnRequest, TryOnResult } from "../types";
import { TryOnError } from "../types";

/**
 * Google Vertex AI virtual-try-on-001 via REST.
 * Requires GOOGLE_CLOUD_PROJECT + Application Default Credentials
 * or GOOGLE_ACCESS_TOKEN (short-lived) for local/dev.
 */
export async function runVertexTryOn(req: TryOnRequest): Promise<TryOnResult> {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  const token = process.env.GOOGLE_ACCESS_TOKEN;

  if (!project) {
    throw new TryOnError(
      "GOOGLE_CLOUD_PROJECT is not set for Vertex virtual try-on",
      503,
    );
  }
  if (!token) {
    throw new TryOnError(
      "GOOGLE_ACCESS_TOKEN is not set. Use `gcloud auth print-access-token` or ADC-backed token for Vertex.",
      503,
    );
  }

  const model = "virtual-try-on-001";
  const url =
    `https://${location}-aiplatform.googleapis.com/v1/projects/${project}` +
    `/locations/${location}/publishers/google/models/${model}:predict`;

  const body = {
    instances: [
      {
        personImage: {
          bytesBase64Encoded: req.personBase64,
        },
        productImages: [
          {
            image: {
              bytesBase64Encoded: req.garmentBase64,
            },
          },
        ],
      },
    ],
    parameters: {
      sampleCount: 1,
      baseSteps: 32,
    },
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "network error";
    throw new TryOnError(`Vertex try-on request failed: ${message}`, 502);
  }

  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    predictions?: Array<{ bytesBase64Encoded?: string }>;
  };

  if (!res.ok) {
    throw new TryOnError(
      `Vertex try-on failed (${res.status}): ${json.error?.message ?? res.statusText}`,
      502,
    );
  }

  const imageBase64 = json.predictions?.[0]?.bytesBase64Encoded;
  if (!imageBase64) {
    throw new TryOnError("Vertex returned no try-on image", 502);
  }

  return {
    imageBase64,
    mimeType: "image/png",
    provider: "vertex",
  };
}
