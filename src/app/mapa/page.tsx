"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Demo data points for Buenos Aires (used when no DB is connected)
const DEMO_POINTS = [
  { lat: -34.5875, lng: -58.4161, price: 3200, barrio: "Palermo" },
  { lat: -34.5957, lng: -58.3732, price: 3800, barrio: "Recoleta" },
  { lat: -34.6037, lng: -58.3816, price: 3500, barrio: "Barrio Norte" },
  { lat: -34.5697, lng: -58.4314, price: 2900, barrio: "Belgrano" },
  { lat: -34.6158, lng: -58.3815, price: 2200, barrio: "San Telmo" },
  { lat: -34.6083, lng: -58.3712, price: 4200, barrio: "Puerto Madero" },
  { lat: -34.6197, lng: -58.3650, price: 2000, barrio: "La Boca" },
  { lat: -34.6275, lng: -58.3881, price: 1800, barrio: "Barracas" },
  { lat: -34.5988, lng: -58.4200, price: 2700, barrio: "Villa Crespo" },
  { lat: -34.5824, lng: -58.4367, price: 2600, barrio: "Colegiales" },
  { lat: -34.6118, lng: -58.4005, price: 2400, barrio: "Almagro" },
  { lat: -34.6040, lng: -58.4107, price: 2500, barrio: "Palermo Viejo" },
  { lat: -34.5761, lng: -58.4542, price: 2300, barrio: "Nunez" },
  { lat: -34.6345, lng: -58.4017, price: 1600, barrio: "Parque Patricios" },
  { lat: -34.6099, lng: -58.4253, price: 2100, barrio: "Caballito" },
];

function getPriceColor(price: number): string {
  if (price >= 3500) return "#dc2626";
  if (price >= 3000) return "#ea580c";
  if (price >= 2500) return "#eab308";
  if (price >= 2000) return "#22c55e";
  return "#3b82f6";
}

export default function MapaPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [selectedBarrio, setSelectedBarrio] = useState<(typeof DEMO_POINTS)[0] | null>(null);
  const [filters, setFilters] = useState({
    tipo: "todos",
    minPrice: 0,
    maxPrice: 5000,
  });

  const filteredPoints = DEMO_POINTS.filter(
    (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
  );

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        {/* Filters bar */}
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
            <label className="text-sm text-muted">
              Tipo:
              <select
                value={filters.tipo}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, tipo: e.target.value }))
                }
                className="ml-2 px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
              >
                <option value="todos">Todos</option>
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </label>
            <label className="text-sm text-muted">
              Precio min USD/m2:
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    minPrice: Number(e.target.value),
                  }))
                }
                className="ml-2 w-24 px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
              />
            </label>
            <label className="text-sm text-muted">
              Precio max USD/m2:
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    maxPrice: Number(e.target.value),
                  }))
                }
                className="ml-2 w-24 px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
              />
            </label>
          </div>
        </div>

        {/* Map placeholder + data overlay */}
        <div className="flex-1 relative bg-slate-100 dark:bg-slate-900 min-h-[600px]">
          {/* Placeholder until Mapbox token is configured */}
          <div
            ref={mapContainer}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                </svg>
              </div>
              <p className="text-muted mb-2">
                Configura <code className="text-xs bg-card px-1.5 py-0.5 rounded border border-border">NEXT_PUBLIC_MAPBOX_TOKEN</code> en tu <code className="text-xs bg-card px-1.5 py-0.5 rounded border border-border">.env</code> para ver el mapa interactivo
              </p>
              <p className="text-xs text-muted">
                Mientras tanto, estos son datos de ejemplo de CABA:
              </p>
            </div>
          </div>

          {/* Demo data cards overlay */}
          <div className="absolute bottom-4 left-4 right-4 overflow-x-auto">
            <div className="flex gap-3 pb-2">
              {filteredPoints.map((point) => (
                <button
                  key={point.barrio}
                  onClick={() => setSelectedBarrio(point)}
                  className={`flex-shrink-0 rounded-xl border bg-card p-4 min-w-[160px] text-left transition-all ${
                    selectedBarrio?.barrio === point.barrio
                      ? "border-accent shadow-lg"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getPriceColor(point.price) }}
                    />
                    <span className="text-xs font-medium">{point.barrio}</span>
                  </div>
                  <p className="text-lg font-bold">
                    USD {point.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted">por m2</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="border-t border-border bg-card px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4 text-xs">
            <span className="text-muted">USD/m2:</span>
            {[
              { color: "#3b82f6", label: "< 2000" },
              { color: "#22c55e", label: "2000-2500" },
              { color: "#eab308", label: "2500-3000" },
              { color: "#ea580c", label: "3000-3500" },
              { color: "#dc2626", label: "> 3500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
