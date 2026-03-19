export interface PageMeta {
  title: string;
  description: string;
  image: string;
  themeColor: string;
}

/** Extrae metadatos Open Graph y theme-color de una URL usando fetch */
export async function extractMeta(url: string): Promise<PageMeta> {
  let html = "";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Linkshot/1.0 (+https://github.com/linkshot)" },
      signal: AbortSignal.timeout(15000),
    });
    html = await res.text();
  } catch {
    // Si no se puede obtener el HTML, retornar valores vacíos para que la IA los llene
    return { title: "", description: "", image: "", themeColor: "" };
  }

  const getMeta = (property: string): string => {
    // Buscar og: y name= en las etiquetas meta
    const ogRegex = new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i"
    );
    const nameRegex = new RegExp(
      `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i"
    );
    const altOgRegex = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
      "i"
    );
    const altNameRegex = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`,
      "i"
    );

    return (
      html.match(ogRegex)?.[1] ||
      html.match(altOgRegex)?.[1] ||
      html.match(nameRegex)?.[1] ||
      html.match(altNameRegex)?.[1] ||
      ""
    );
  };

  // Título: og:title → <title>
  let title = getMeta("og:title");
  if (!title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    title = titleMatch?.[1]?.trim() ?? "";
  }

  const description = getMeta("og:description") || getMeta("description");
  const image = getMeta("og:image");
  const themeColor = getMeta("theme-color");

  return { title, description, image, themeColor };
}
