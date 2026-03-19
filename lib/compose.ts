import sharp from "sharp";
import path from "path";
import type { Palette } from "./ai/types";

const MOCKUPS_DIR = path.join(process.cwd(), "public", "mockups");

// Dimensiones de las cards de salida
const DESKTOP_CARD = { w: 1200, h: 630 };
const MOBILE_CARD = { w: 1080, h: 1920 };
const MIXED_CARD = { w: 1200, h: 630 };

// Dimensiones del hueco de la pantalla en los mockups
const DESKTOP_SCREEN = { x: 60, y: 50, w: 1280, h: 800 };
const MOBILE_SCREEN = { x: 35, y: 60, w: 390, h: 780 };

/** Genera un SVG de gradiente como fondo */
function gradientSVG(w: number, h: number, color1: string, color2: string): Buffer {
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1"/>
        <stop offset="100%" style="stop-color:${color2};stop-opacity:1"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
  </svg>`;
  return Buffer.from(svg);
}

/** Genera texto SVG para título y descripción */
function textOverlaySVG(
  w: number,
  h: number,
  titulo: string,
  descripcion: string,
  yOffset: number
): Buffer {
  // Escapar caracteres especiales XML
  const escapeXml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <text
      x="${w / 2}" y="${yOffset}"
      text-anchor="middle"
      font-family="system-ui, -apple-system, sans-serif"
      font-size="32" font-weight="700"
      fill="white"
      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
    >${escapeXml(titulo)}</text>
    <text
      x="${w / 2}" y="${yOffset + 44}"
      text-anchor="middle"
      font-family="system-ui, -apple-system, sans-serif"
      font-size="20" font-weight="400"
      fill="rgba(255,255,255,0.85)"
      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"
    >${escapeXml(descripcion)}</text>
  </svg>`;
  return Buffer.from(svg);
}

/** Card 1: Desktop (1200×630) — mockup de computadora con screenshot */
export async function composeDesktopCard(
  screenshot: Buffer,
  palette: Palette,
  titulo: string,
  descripcion: string
): Promise<Buffer> {
  const { w, h } = DESKTOP_CARD;

  // Fondo con gradiente
  const background = await sharp(gradientSVG(w, h, palette.color1, palette.color2))
    .png()
    .toBuffer();

  // Escalar mockup desktop a 480px de ancho aprox para que quepa en 1200×630
  const mockupScale = 0.36; // 1400 * 0.36 = 504px
  const mockupW = Math.round(1400 * mockupScale);
  const mockupH = Math.round(900 * mockupScale);

  const mockupResized = await sharp(path.join(MOCKUPS_DIR, "desktop.png"))
    .resize(mockupW, mockupH)
    .toBuffer();

  // Escalar screenshot para que quepa dentro del hueco del mockup
  const screenW = Math.round(DESKTOP_SCREEN.w * mockupScale);
  const screenH = Math.round(DESKTOP_SCREEN.h * mockupScale);
  const screenResized = await sharp(screenshot)
    .resize(screenW, screenH, { fit: "cover" })
    .toBuffer();

  // Posición del mockup en la card (centrado horizontalmente, arriba)
  const mockupX = Math.round((w - mockupW) / 2);
  const mockupY = 20;

  // Posición del screenshot dentro del mockup (relativa a la card)
  const screenInCardX = mockupX + Math.round(DESKTOP_SCREEN.x * mockupScale);
  const screenInCardY = mockupY + Math.round(DESKTOP_SCREEN.y * mockupScale);

  // Texto en la parte inferior
  const textY = mockupY + mockupH + 30;
  const textOverlay = textOverlaySVG(w, h, titulo, descripcion, textY);

  const result = await sharp(background)
    .composite([
      { input: screenResized, left: screenInCardX, top: screenInCardY },
      { input: mockupResized, left: mockupX, top: mockupY },
      { input: textOverlay, left: 0, top: 0 },
    ])
    .png()
    .toBuffer();

  return result;
}

/** Card 2: Mobile (1080×1920) — mockup de smartphone con screenshot */
export async function composeMobileCard(
  screenshot: Buffer,
  palette: Palette,
  titulo: string,
  descripcion: string
): Promise<Buffer> {
  const { w, h } = MOBILE_CARD;

  const background = await sharp(gradientSVG(w, h, palette.color1, palette.color2))
    .png()
    .toBuffer();

  // Escalar mockup móvil a ~500px de ancho
  const mockupScale = 1.1; // 460 * 1.1 = 506px
  const mockupW = Math.round(460 * mockupScale);
  const mockupH = Math.round(900 * mockupScale);

  const mockupResized = await sharp(path.join(MOCKUPS_DIR, "mobile.png"))
    .resize(mockupW, mockupH)
    .toBuffer();

  // Screenshot dentro del hueco
  const screenW = Math.round(MOBILE_SCREEN.w * mockupScale);
  const screenH = Math.round(MOBILE_SCREEN.h * mockupScale);
  const screenResized = await sharp(screenshot)
    .resize(screenW, screenH, { fit: "cover" })
    .toBuffer();

  const mockupX = Math.round((w - mockupW) / 2);
  const mockupY = 200;

  const screenInCardX = mockupX + Math.round(MOBILE_SCREEN.x * mockupScale);
  const screenInCardY = mockupY + Math.round(MOBILE_SCREEN.y * mockupScale);

  // Texto en la parte inferior
  const textY = mockupY + mockupH + 60;
  const textOverlay = textOverlaySVG(w, h, titulo, descripcion, textY);

  const result = await sharp(background)
    .composite([
      { input: screenResized, left: screenInCardX, top: screenInCardY },
      { input: mockupResized, left: mockupX, top: mockupY },
      { input: textOverlay, left: 0, top: 0 },
    ])
    .png()
    .toBuffer();

  return result;
}

/** Card 3: Mixta (1200×630) — desktop a la izquierda + mobile a la derecha */
export async function composeMixedCard(
  desktopShot: Buffer,
  mobileShot: Buffer,
  palette: Palette,
  titulo: string,
  descripcion: string
): Promise<Buffer> {
  const { w, h } = MIXED_CARD;

  const background = await sharp(gradientSVG(w, h, palette.color1, palette.color2))
    .png()
    .toBuffer();

  // Desktop a la izquierda: ~55% del ancho
  const desktopScale = 0.28;
  const desktopMockupW = Math.round(1400 * desktopScale);
  const desktopMockupH = Math.round(900 * desktopScale);

  const desktopMockup = await sharp(path.join(MOCKUPS_DIR, "desktop.png"))
    .resize(desktopMockupW, desktopMockupH)
    .toBuffer();

  const desktopScreenW = Math.round(DESKTOP_SCREEN.w * desktopScale);
  const desktopScreenH = Math.round(DESKTOP_SCREEN.h * desktopScale);
  const desktopScreenResized = await sharp(desktopShot)
    .resize(desktopScreenW, desktopScreenH, { fit: "cover" })
    .toBuffer();

  const desktopX = 30;
  const desktopY = Math.round((h - desktopMockupH) / 2) - 20;
  const desktopScreenX = desktopX + Math.round(DESKTOP_SCREEN.x * desktopScale);
  const desktopScreenY = desktopY + Math.round(DESKTOP_SCREEN.y * desktopScale);

  // Mobile a la derecha: ~30% del ancho
  const mobileScale = 0.52;
  const mobileMockupW = Math.round(460 * mobileScale);
  const mobileMockupH = Math.round(900 * mobileScale);

  const mobileMockup = await sharp(path.join(MOCKUPS_DIR, "mobile.png"))
    .resize(mobileMockupW, mobileMockupH)
    .toBuffer();

  const mobileScreenW = Math.round(MOBILE_SCREEN.w * mobileScale);
  const mobileScreenH = Math.round(MOBILE_SCREEN.h * mobileScale);
  const mobileScreenResized = await sharp(mobileShot)
    .resize(mobileScreenW, mobileScreenH, { fit: "cover" })
    .toBuffer();

  const mobileX = w - mobileMockupW - 30;
  const mobileY = Math.round((h - mobileMockupH) / 2) - 10;
  const mobileScreenX = mobileX + Math.round(MOBILE_SCREEN.x * mobileScale);
  const mobileScreenY = mobileY + Math.round(MOBILE_SCREEN.y * mobileScale);

  // Texto centrado entre los dos mockups
  const centerX = desktopX + desktopMockupW + Math.round((mobileX - desktopX - desktopMockupW) / 2);
  const textSVG = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <text
      x="${centerX}" y="${Math.round(h / 2) - 10}"
      text-anchor="middle"
      font-family="system-ui, -apple-system, sans-serif"
      font-size="22" font-weight="700"
      fill="white"
      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
    >${titulo.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
    <text
      x="${centerX}" y="${Math.round(h / 2) + 30}"
      text-anchor="middle"
      font-family="system-ui, -apple-system, sans-serif"
      font-size="15" font-weight="400"
      fill="rgba(255,255,255,0.85)"
      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))"
    >${descripcion.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
  </svg>`;

  const result = await sharp(background)
    .composite([
      { input: desktopScreenResized, left: desktopScreenX, top: desktopScreenY },
      { input: desktopMockup, left: desktopX, top: desktopY },
      { input: mobileScreenResized, left: mobileScreenX, top: mobileScreenY },
      { input: mobileMockup, left: mobileX, top: mobileY },
      { input: Buffer.from(textSVG), left: 0, top: 0 },
    ])
    .png()
    .toBuffer();

  return result;
}
