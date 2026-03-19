import { NextRequest, NextResponse } from "next/server";
import { captureDesktop, captureMobile } from "@/lib/screenshot";
import { extractMeta } from "@/lib/meta";
import { analyzeWithAI } from "@/lib/ai/robin";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let url: string;

  try {
    const body = await req.json() as { url?: string };
    url = body.url?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido" }, { status: 400 });
  }

  // Validar URL
  if (!url) {
    return NextResponse.json({ error: "La URL es requerida" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "URL inválida. Incluye el protocolo (https://...)" }, { status: 400 });
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return NextResponse.json({ error: "La URL debe empezar con http:// o https://" }, { status: 400 });
  }

  try {
    // Capturas y metadatos en paralelo
    const [desktopShot, mobileShot, meta] = await Promise.all([
      captureDesktop(url),
      captureMobile(url),
      extractMeta(url),
    ]);

    // Análisis con IA
    const aiResult = await analyzeWithAI(meta);

    return NextResponse.json({
      desktopShot: desktopShot.toString("base64"),
      mobileShot: mobileShot.toString("base64"),
      titulo: aiResult.titulo,
      descripcion: aiResult.descripcion,
      paletas: aiResult.paletas,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    console.error("[/api/process]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
