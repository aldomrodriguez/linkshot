"use client";

import { useState } from "react";

interface Props {
  onSubmit: (url: string) => void;
  loading: boolean;
  step: string;
}

export default function UrlForm({ onSubmit, loading, step }: Props) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Ingresa una URL");
      return;
    }

    // Agregar https:// si no tiene protocolo
    const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;

    try {
      new URL(normalized);
    } catch {
      setError("URL inválida");
      return;
    }

    onSubmit(normalized);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://ejemplo.com"
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 text-lg"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-colors whitespace-nowrap"
        >
          {loading ? "Procesando..." : "Generar cards"}
        </button>
      </div>

      {loading && (
        <p className="mt-3 text-center text-sm text-indigo-400 animate-pulse">{step}</p>
      )}

      {error && (
        <p className="mt-2 text-center text-sm text-red-400">{error}</p>
      )}
    </form>
  );
}
