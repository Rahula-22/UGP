import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type { TryOnRequest, TryOnResult } from "../types";
import { TryOnError } from "../types";

const MODEL_ID = "amazon.nova-canvas-v1:0";

function requireAwsEnv() {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  if (!region) {
    throw new TryOnError(
      "AWS_REGION is not set. Configure AWS credentials for Nova Canvas try-on.",
      503,
    );
  }
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new TryOnError(
      "AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY are not set. Add them to .env.local.",
      503,
    );
  }
  return region;
}

export async function runAwsNovaTryOn(
  req: TryOnRequest,
): Promise<TryOnResult> {
  const region = requireAwsEnv();
  const client = new BedrockRuntimeClient({ region });

  const body = {
    taskType: "VIRTUAL_TRY_ON",
    virtualTryOnParams: {
      sourceImage: req.personBase64,
      referenceImage: req.garmentBase64,
      maskType: "GARMENT",
      garmentBasedMask: {
        maskShape: "CONTOUR",
        garmentClass: req.garmentClass,
        garmentStyling: {
          longSleeveStyle: "SLEEVE_DOWN",
          tuckingStyle: "UNTUCKED",
          outerLayerStyle: "CLOSED",
        },
      },
      maskExclusions: {
        preserveFace: "ON",
        preserveHands: "ON",
        preserveBodyPose: "ON",
      },
      mergeStyle: "SEAMLESS",
      returnMask: false,
    },
    imageGenerationConfig: {
      numberOfImages: 1,
      quality: "premium",
      cfgScale: 7.5,
    },
  };

  let response;
  try {
    response = await client.send(
      new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(body),
      }),
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Bedrock InvokeModel failed";
    throw new TryOnError(
      `AWS Nova Canvas try-on failed: ${message}. Ensure Nova Canvas is enabled in Bedrock for ${region}.`,
      502,
    );
  }

  const raw = response.body
    ? new TextDecoder().decode(response.body)
    : "";
  let parsed: {
    images?: string[];
    error?: string;
  };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new TryOnError("Nova Canvas returned a non-JSON response", 502);
  }

  if (parsed.error) {
    throw new TryOnError(`Nova Canvas error: ${parsed.error}`, 502);
  }

  const imageBase64 = parsed.images?.[0];
  if (!imageBase64) {
    throw new TryOnError("Nova Canvas returned no images", 502);
  }

  return {
    imageBase64,
    mimeType: "image/png",
    provider: "aws-nova",
  };
}
