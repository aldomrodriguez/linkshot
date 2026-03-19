import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Linkshot — URL to Social Card",
  description: "Pega una URL y obtén 3 cards listas para redes sociales con screenshots reales e IA.",
  openGraph: {
    title: "Linkshot",
    description: "Genera social cards profesionales desde cualquier URL",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full bg-gray-950 text-white flex flex-col">{children}</body>
    </html>
  );
}
