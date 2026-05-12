interface DolarBlueResponse {
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

let cachedRate: { venta: number; fetchedAt: number } | null = null;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function getDolarBlueVenta(): Promise<number> {
  if (cachedRate && Date.now() - cachedRate.fetchedAt < CACHE_TTL) {
    return cachedRate.venta;
  }

  const url =
    process.env.DOLAR_API_URL || "https://dolarapi.com/v1/dolares/blue";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch dolar blue: ${res.status}`);

  const data: DolarBlueResponse = await res.json();
  cachedRate = { venta: data.venta, fetchedAt: Date.now() };
  return data.venta;
}

export function convertArsToDolarBlue(ars: number, ventaRate: number): number {
  return Math.round((ars / ventaRate) * 100) / 100;
}
