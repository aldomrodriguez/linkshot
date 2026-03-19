"use client";

import JSZip from "jszip";

interface Props {
  card1: string;
  card2: string;
  card3: string;
}

function downloadBase64(base64: string, filename: string) {
  const link = document.createElement("a");
  link.href = `data:image/png;base64,${base64}`;
  link.download = filename;
  link.click();
}

export default function DownloadButtons({ card1, card2, card3 }: Props) {
  async function downloadZip() {
    const zip = new JSZip();
    zip.file("linkshot-desktop.png", card1, { base64: true });
    zip.file("linkshot-mobile.png", card2, { base64: true });
    zip.file("linkshot-mixed.png", card3, { base64: true });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "linkshot-cards.zip";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      <button
        onClick={() => downloadBase64(card1, "linkshot-desktop.png")}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium transition-colors"
      >
        ↓ Desktop
      </button>
      <button
        onClick={() => downloadBase64(card2, "linkshot-mobile.png")}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium transition-colors"
      >
        ↓ Mobile
      </button>
      <button
        onClick={() => downloadBase64(card3, "linkshot-mixed.png")}
        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium transition-colors"
      >
        ↓ Mixta
      </button>
      <button
        onClick={downloadZip}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition-colors"
      >
        ↓ Descargar ZIP
      </button>
    </div>
  );
}
