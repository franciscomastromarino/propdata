"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface OpportunityResult {
  score: number;
  verdict: string;
  input_price_m2_usd: number;
  avg_comparable_m2_usd: number;
  median_comparable_m2_usd: number;
  difference_percent: number;
  comparables_count: number;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-green-500";
  if (score >= 40) return "text-yellow-500";
  if (score >= 20) return "text-orange-500";
  return "text-danger";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-green-500";
  if (score >= 40) return "bg-yellow-500";
  if (score >= 20) return "bg-orange-500";
  return "bg-danger";
}

export default function OportunidadPage() {
  const [mode, setMode] = useState<"url" | "manual">("manual");
  const [url, setUrl] = useState("");
  const [form, setForm] = useState({
    direccion: "",
    precioUsd: "",
    superficieM2: "",
    tipo: "departamento",
    ambientes: "",
  });
  const [result, setResult] = useState<OpportunityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo result for display
  const demoResult: OpportunityResult = {
    score: 78,
    verdict: "Buen precio - Por debajo del promedio",
    input_price_m2_usd: 2200,
    avg_comparable_m2_usd: 2847,
    median_comparable_m2_usd: 2650,
    difference_percent: 23,
    comparables_count: 34,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "manual") {
        const res = await fetch("/api/opportunity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: -34.5875, // TODO: geocode from direccion
            lng: -58.4161,
            precioUsd: Number(form.precioUsd),
            superficieM2: Number(form.superficieM2),
            tipo: form.tipo,
            ambientes: form.ambientes ? Number(form.ambientes) : undefined,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Error");
        setResult(json);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      // Show demo result on error (no DB connected)
      setResult(demoResult);
    } finally {
      setLoading(false);
    }
  }

  const displayResult = result || demoResult;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold">
              Calculadora de oportunidad
            </h1>
            <p className="mt-3 text-muted">
              Analiza si una propiedad es oportunidad, precio justo o esta cara
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setMode("manual")}
                className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                  mode === "manual"
                    ? "bg-accent text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Datos manuales
              </button>
              <button
                onClick={() => setMode("url")}
                className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                  mode === "url"
                    ? "bg-accent text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                URL de aviso
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-8 mb-8"
          >
            {mode === "url" ? (
              <div>
                <label className="block text-sm font-medium mb-2">
                  URL del aviso
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.zonaprop.com.ar/propiedades/..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <p className="mt-2 text-xs text-muted">
                  Soportamos Zonaprop, Argenprop, MercadoLibre y Properati
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Direccion
                  </label>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, direccion: e.target.value }))
                    }
                    placeholder="Av. Santa Fe 1234, Palermo"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Precio (USD)
                  </label>
                  <input
                    type="number"
                    value={form.precioUsd}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, precioUsd: e.target.value }))
                    }
                    placeholder="120000"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Superficie (m2)
                  </label>
                  <input
                    type="number"
                    value={form.superficieM2}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, superficieM2: e.target.value }))
                    }
                    placeholder="55"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tipo: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    <option value="departamento">Departamento</option>
                    <option value="casa">Casa</option>
                    <option value="ph">PH</option>
                    <option value="local">Local</option>
                    <option value="oficina">Oficina</option>
                    <option value="terreno">Terreno</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ambientes
                  </label>
                  <input
                    type="number"
                    value={form.ambientes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ambientes: e.target.value }))
                    }
                    placeholder="2"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-accent hover:bg-accent-light disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
              >
                {loading ? "Analizando..." : "Analizar propiedad"}
              </button>
            </div>
          </form>

          {error && (
            <p className="text-center text-sm text-muted mb-4">
              No hay conexion a la DB — mostrando resultado de ejemplo
            </p>
          )}

          {/* Results */}
          {displayResult && (
            <div className="space-y-6">
              {/* Score card */}
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <p className="text-sm text-muted mb-3">Score de oportunidad</p>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      className="text-border"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      className={getScoreColor(displayResult.score)}
                      strokeWidth="8"
                      strokeDasharray={`${displayResult.score * 2.64} 264`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={`text-3xl font-bold ${getScoreColor(displayResult.score)}`}
                    >
                      {displayResult.score}
                    </span>
                  </div>
                </div>
                <p className="text-lg font-semibold">{displayResult.verdict}</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <p className="text-sm text-muted mb-1">Tu precio/m2</p>
                  <p className="text-2xl font-bold">
                    USD {displayResult.input_price_m2_usd.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <p className="text-sm text-muted mb-1">Promedio zona</p>
                  <p className="text-2xl font-bold">
                    USD {displayResult.avg_comparable_m2_usd.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <p className="text-sm text-muted mb-1">Diferencia</p>
                  <p
                    className={`text-2xl font-bold ${
                      displayResult.difference_percent > 0
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {displayResult.difference_percent > 0 ? "-" : "+"}
                    {Math.abs(displayResult.difference_percent)}%
                  </p>
                  <p className="text-xs text-muted mt-1">
                    vs {displayResult.comparables_count} comparables
                  </p>
                </div>
              </div>

              <div className="text-center pt-4">
                <button className="px-6 py-3 bg-accent hover:bg-accent-light text-white font-medium rounded-xl transition-colors">
                  Compartir resultado
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
