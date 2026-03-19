"use client";

import { useState } from "react";
import type { Palette } from "@/lib/ai/types";

interface Props {
  paletas: Palette[];
  titulo: string;
  descripcion: string;
  onConfirm: (palette: Palette, titulo: string, descripcion: string) => void;
  loading: boolean;
}

export default function PaletteSelector({ paletas, titulo: initialTitulo, descripcion: initialDescripcion, onConfirm, loading }: Props) {
  const [selected, setSelected] = useState<Palette | null>(null);
  const [titulo, setTitulo] = useState(initialTitulo);
  const [descripcion, setDescripcion] = useState(initialDescripcion);

  function handleConfirm() {
    if (!selected) return;
    onConfirm(selected, titulo, descripcion);
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider">
          Título
        </label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          maxLength={60}
          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-gray-500 text-right">{titulo.length}/60</p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={120}
          rows={2}
          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <p className="text-xs text-gray-500 text-right">{descripcion.length}/120</p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider">
          Elige una paleta
        </label>
        <div className="grid grid-cols-2 gap-3">
          {paletas.map((p) => (
            <button
              key={p.nombre}
              onClick={() => setSelected(p)}
              className={`relative overflow-hidden rounded-xl h-20 flex items-end p-3 transition-all ${
                selected?.nombre === p.nombre
                  ? "ring-2 ring-white scale-[1.02]"
                  : "ring-1 ring-gray-700 hover:ring-gray-500"
              }`}
              style={{ background: `linear-gradient(135deg, ${p.color1}, ${p.color2})` }}
            >
              <span className="text-white font-semibold text-sm drop-shadow">{p.nombre}</span>
              {selected?.nombre === p.nombre && (
                <span className="absolute top-2 right-2 text-white text-lg">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selected || loading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-colors"
      >
        {loading ? "Generando cards..." : "Generar cards →"}
      </button>
    </div>
  );
}
