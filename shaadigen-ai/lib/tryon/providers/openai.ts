import type { TryOnRequest, TryOnResult } from "../types";
import { TryOnError } from "../types";
import { LIGHTING_HINTS } from "../garments";

/**
 * Fallback provider using OpenAI (or Azure OpenAI) Images Edit API.
 * Less garment-faithful than Nova/Vertex dedicated VTO, but works with existing credits.
 */
export async function runOpenAITryOn(req: TryOnRequest): Promise<TryOnResult> {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureKey = process.env.AZURE_OPENAI_API_KEY;
  const azureDeployment =
    process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT || "gpt-image-1";
  const openAiKey = process.env.OPENAI_API_KEY;

  const lighting =
    (req.lightingId && LIGHTING_HINTS[req.lightingId]) ||
    "natural soft studio lighting";

  const prompt = [
    "Dress the person in image 1 wearing the garment shown in image 2.",
    `The garment is ${req.promptLabel}.`,
    "Keep the person's face, skin tone, body pose, and proportions unchanged.",
    `Apply ${lighting}.`,
    "Photorealistic wedding fashion photography, full body when possible.",
  ].join(" ");

  let url: string;
  let headers: Record<string, string>;

  if (azureEndpoint && azureKey) {
    const base = azureEndpoint.replace(/\/$/, "");
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2025-04-01-preview";
    url = `${base}/openai/deployments/${azureDeployment}/images/edits?api-version=${apiVersion}`;
    headers = { "api-key": azureKey };
  } else if (openAiKey) {
    url = "https://api.openai.com/v1/images/edits";
    headers = { Authorization: `Bearer ${openAiKey}` };
  } else {
    throw new TryOnError(
      "OPENAI_API_KEY or AZURE_OPENAI_ENDPOINT + AZURE_OPENAI_API_KEY required for openai provider",
      503,
    );
  }

  const personBytes = Buffer.from(req.personBase64, "base64");
  const garmentBytes = Buffer.from(req.garmentBase64, "base64");

  const form = new FormData();
  form.append(
    "image",
    new Blob([new Uint8Array(personBytes)], { type: req.personMimeType }),
    "person.png",
  );
  form.append(
    "image",
    new Blob([new Uint8Array(garmentBytes)], { type: req.garmentMimeType }),
    "garment.png",
  );
  form.append("prompt", prompt);
  form.append("model", process.env.OPENAI_IMAGE_MODEL || "gpt-image-1");
  form.append("size", "1024x1536");

  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers, body: form });
  } catch (err) {
    const message = err instanceof Error ? err.message : "network error";
    throw new TryOnError(`OpenAI image edit request failed: ${message}`, 502);
  }

  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string };
    data?: Array<{ b64_json?: string; url?: string }>;
  };

  if (!res.ok) {
    throw new TryOnError(
      `OpenAI image edit failed (${res.status}): ${json.error?.message ?? res.statusText}`,
      502,
    );
  }

  const b64 = json.data?.[0]?.b64_json;
  if (b64) {
    return { imageBase64: b64, mimeType: "image/png", provider: "openai" };
  }

  const remoteUrl = json.data?.[0]?.url;
  if (remoteUrl) {
    const imgRes = await fetch(remoteUrl);
    if (!imgRes.ok) {
      throw new TryOnError("Failed to download OpenAI result image", 502);
    }
    const buf = Buffer.from(await imgRes.arrayBuffer());
    return {
      imageBase64: buf.toString("base64"),
      mimeType: imgRes.headers.get("content-type") || "image/png",
      provider: "openai",
    };
  }

  throw new TryOnError("OpenAI returned no image data", 502);
}
