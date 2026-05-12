"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddressSearch from "@/components/AddressSearch";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface ZoneData {
  location: { latitude: number; longitude: number };
  radius_km: number;
  count: number;
  avg_price_m2_usd: number;
  median_price_m2_usd: number;
  percentile_caba: number;
  types: Record<string, number>;
  message?: string;
}

function ZoneResults() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const [data, setData] = useState<ZoneData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function fetchZoneData(lat: number, lng: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/zone?lat=${lat}&lng=${lng}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error fetching zone data");
      setData(json);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  // Demo data for display when no DB is connected
  const demoData: ZoneData = {
    location: { latitude: -34.5875, longitude: -58.4161 },
    radius_km: 0.5,
    count: 247,
    avg_price_m2_usd: 2847,
    median_price_m2_usd: 2650,
    percentile_caba: 72,
    types: { departamento: 189, casa: 32, ph: 26 },
  };

  const displayData = data || (!searched ? demoData : null);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold">
          Cuanto vale tu cuadra
        </h1>
        <p className="mt-3 text-muted">
          Ingresa una direccion para conocer el precio promedio por m2 en tu
          zona
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <AddressSearch redirectTo="/cuanto-vale" />
      </div>

      {address && !searched && (
        <div className="text-center mb-8 p-4 rounded-xl bg-accent/5 border border-accent/20">
          <p className="text-sm text-muted mb-2">
            Buscando: <strong>{address}</strong>
          </p>
          <p className="text-xs text-muted">
            Geocoding pendiente — mostrando datos de ejemplo (Palermo, CABA)
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-muted">Analizando zona...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8 text-danger">
          <p>{error}</p>
        </div>
      )}

      {displayData && !loading && (
        <div className="space-y-6">
          {/* Main stat card */}
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted mb-2">Precio promedio por m2</p>
            <p className="text-5xl font-bold text-accent">
              USD {displayData.avg_price_m2_usd.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-muted">
              Mediana: USD {displayData.median_price_m2_usd.toLocaleString()}/m2
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Percentile */}
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted mb-1">Ranking CABA</p>
              <p className="text-3xl font-bold">
                Top {100 - displayData.percentile_caba}%
              </p>
              <div className="mt-3 h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${displayData.percentile_caba}%` }}
                />
              </div>
            </div>

            {/* Count */}
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted mb-1">Propiedades analizadas</p>
              <p className="text-3xl font-bold">{displayData.count}</p>
              <p className="mt-1 text-xs text-muted">
                en radio de {displayData.radius_km}km
              </p>
            </div>

            {/* Types breakdown */}
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted mb-3 text-center">Por tipo</p>
              <div className="space-y-2">
                {Object.entries(displayData.types).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="capitalize">{type}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Share CTA */}
          <div className="text-center pt-4">
            <button className="px-6 py-3 bg-accent hover:bg-accent-light text-white font-medium rounded-xl transition-colors">
              Compartir resultado
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CuantoValePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <ZoneResults />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
