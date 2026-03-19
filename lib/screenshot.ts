import puppeteer from "puppeteer";

// Opciones comunes de lanzamiento para Linux/producción
const LAUNCH_ARGS = {
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
};

/** Captura screenshot de escritorio (1280×800) */
export async function captureDesktop(url: string): Promise<Buffer> {
  const browser = await puppeteer.launch(LAUNCH_ARGS);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    const screenshot = await page.screenshot({ type: "png" });
    return Buffer.from(screenshot);
  } finally {
    // Siempre cerrar el browser para liberar RAM
    await browser.close();
  }
}

/** Captura screenshot móvil (390×844) */
export async function captureMobile(url: string): Promise<Buffer> {
  const browser = await puppeteer.launch(LAUNCH_ARGS);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    const screenshot = await page.screenshot({ type: "png" });
    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
}
