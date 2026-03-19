"use client";

import { useState } from "react";
import UrlForm from "@/components/UrlForm";
import PaletteSelector from "@/components/PaletteSelector";
import CardPreview from "@/components/CardPreview";
import DownloadButtons from "@/components/DownloadButtons";
import type { Palette } from "@/lib/ai/types";

type Step = "idle" | "processing" | "selecting" | "generating" | "done";

interface ProcessResult {
  desktopShot: string;
  mobileShot: string;
  titulo: string;
  descripcion: string;
  paletas: Palette[];
}

interface Cards {
  card1: string;
  card2: string;
  card3: string;
}

const STEP_LABELS: Partial<Record<Step, string>> = {
  processing: "Capturando screenshots y analizando con IA...",
  generating: "Componiendo las cards...",
};

export default function Home() {
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null);
  const [cards, setCards] = useState<Cards | null>(null);

  async function handleProcess(url: string) {
    setError("");
    setStep("processing");

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json() as ProcessResult & { error?: string };

      if (!res.ok) throw new Error(data.error ?? "Error desconocido");

      setProcessResult(data);
      setStep("selecting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la URL");
      setStep("idle");
    }
  }

  async function handleGenerate(palette: Palette, titulo: string, descripcion: string) {
    if (!processResult) return;
    setError("");
    setStep("generating");

    try {
      const res = await fetch("/api/generate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          desktopShot: processResult.desktopShot,
          mobileShot: processResult.mobileShot,
          titulo,
          descripcion,
          palette,
        }),
      });
      const data = await res.json() as Cards & { error?: string };

      if (!res.ok) throw new Error(data.error ?? "Error desconocido");

      setCards(data);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar las cards");
      setStep("selecting");
    }
  }

  function reset() {
    setStep("idle");
    setError("");
    setProcessResult(null);
    setCards(null);
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-12 gap-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Linkshot
        </h1>
        <p className="text-gray-400 text-lg max-w-md">
          Pega una URL y obtén 3 social cards listas para compartir — con screenshots reales e IA.
        </p>
      </div>

      {/* Indicador de pasos */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {(["idle", "processing", "selecting", "generating", "done"] as Step[]).map((s, i) => {
          const labels = ["URL", "Capturando", "Paleta", "Componiendo", "Listo"];
          const active = s === step;
          const done = (["idle", "processing", "selecting", "generating", "done"] as Step[]).indexOf(step) > i;
          return (
            <span key={s} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-700">—</span>}
              <span className={`${active ? "text-indigo-400 font-semibold" : done ? "text-gray-400" : "text-gray-700"}`}>
                {labels[i]}
              </span>
            </span>
          );
        })}
      </div>

      {/* Paso 1: Formulario */}
      {(step === "idle" || step === "processing") && (
        <UrlForm
          onSubmit={handleProcess}
          loading={step === "processing"}
          step={STEP_LABELS[step] ?? ""}
        />
      )}

      {/* Error */}
      {error && (
        <div className="w-full max-w-2xl bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-sm text-center">
          {error}
          <button onClick={reset} className="block mx-auto mt-2 underline text-red-400 hover:text-red-300">
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Paso 2: Selector de paleta */}
      {(step === "selecting" || step === "generating") && processResult && (
        <PaletteSelector
          paletas={processResult.paletas}
          titulo={processResult.titulo}
          descripcion={processResult.descripcion}
          onConfirm={handleGenerate}
          loading={step === "generating"}
        />
      )}

      {/* Paso 3: Cards generadas */}
      {step === "done" && cards && (
        <>
          <CardPreview card1={cards.card1} card2={cards.card2} card3={cards.card3} />
          <DownloadButtons card1={cards.card1} card2={cards.card2} card3={cards.card3} />
          <button
            onClick={reset}
            className="text-gray-500 hover:text-gray-300 text-sm underline transition-colors"
          >
            Empezar de nuevo
          </button>
        </>
      )}
    </main>
  );
}
