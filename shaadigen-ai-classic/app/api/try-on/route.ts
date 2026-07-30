import { NextResponse } from "next/server";
import { runVirtualTryOn, TryOnError } from "@/lib/tryon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const person = form.get("person");
    const outfitId = form.get("outfitId");
    const lightingId = form.get("lightingId");

    if (!(person instanceof File) || person.size === 0) {
      return NextResponse.json(
        { ok: false, error: "Missing person photo upload (field: person)" },
        { status: 400 },
      );
    }
    if (typeof outfitId !== "string" || !outfitId) {
      return NextResponse.json(
        { ok: false, error: "Missing outfitId" },
        { status: 400 },
      );
    }

    const result = await runVirtualTryOn({
      personFile: person,
      outfitId,
      lightingId: typeof lightingId === "string" ? lightingId : undefined,
    });

    return NextResponse.json({
      ok: true,
      imageUrl: result.imageUrl,
      provider: result.provider,
      outfitId: result.outfitId,
    });
  } catch (err) {
    if (err instanceof TryOnError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }
    const message = err instanceof Error ? err.message : "Unexpected try-on error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
