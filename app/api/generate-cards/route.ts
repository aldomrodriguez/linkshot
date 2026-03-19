import { NextRequest, NextResponse } from "next/server";
import { composeDesktopCard, composeMobileCard, composeMixedCard } from "@/lib/compose";
import type { Palette } from "@/lib/ai/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: {
    desktopShot?: string;
    mobileShot?: string;
    titulo?: string;
    descripcion?: string;
    palette?: Palette;
  };

  try {
    body = await req.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Cuerpo de la petición inválido" }, { status: 400 });
  }

  const { desktopShot, mobileShot, titulo, descripcion, palette } = body;

  if (!desktopShot || !mobileShot || !titulo || !descripcion || !palette) {
    return NextResponse.json(
      { error: "Faltan campos requeridos: desktopShot, mobileShot, titulo, descripcion, palette" },
      { status: 400 }
    );
  }

  try {
    const desktopBuf = Buffer.from(desktopShot, "base64");
    const mobileBuf = Buffer.from(mobileShot, "base64");

    // Componer las 3 cards en paralelo
    const [card1, card2, card3] = await Promise.all([
      composeDesktopCard(desktopBuf, palette, titulo, descripcion),
      composeMobileCard(mobileBuf, palette, titulo, descripcion),
      composeMixedCard(desktopBuf, mobileBuf, palette, titulo, descripcion),
    ]);

    return NextResponse.json({
      card1: card1.toString("base64"),
      card2: card2.toString("base64"),
      card3: card3.toString("base64"),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    console.error("[/api/generate-cards]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
