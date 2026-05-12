import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const OpportunityInput = z.object({
  lat: z.number(),
  lng: z.number(),
  precioUsd: z.number(),
  superficieM2: z.number(),
  tipo: z.string().optional(),
  ambientes: z.number().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const input = OpportunityInput.safeParse(body);

  if (!input.success) {
    return NextResponse.json(
      { error: "Invalid input", details: input.error.flatten() },
      { status: 400 }
    );
  }

  const { lat, lng, precioUsd, superficieM2, tipo, ambientes } = input.data;
  const precioPorM2 = precioUsd / superficieM2;

  // Find comparable properties (same type, +-1 ambientes, within 1km)
  const degreeRadius = 0.009; // ~1km

  const comparables = await prisma.property.findMany({
    where: {
      latitude: { gte: lat - degreeRadius, lte: lat + degreeRadius },
      longitude: { gte: lng - degreeRadius, lte: lng + degreeRadius },
      precioPorM2Usd: { not: null },
      ...(tipo ? { tipo } : {}),
      ...(ambientes
        ? { ambientes: { gte: ambientes - 1, lte: ambientes + 1 } }
        : {}),
    },
    select: {
      precioPorM2Usd: true,
      precioUsd: true,
      superficieM2: true,
      tipo: true,
      ambientes: true,
    },
  });

  if (comparables.length < 3) {
    return NextResponse.json({
      message: "Not enough comparable properties to calculate opportunity score",
      comparables_count: comparables.length,
    });
  }

  const prices = comparables
    .map((c) => c.precioPorM2Usd!)
    .sort((a, b) => a - b);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const median = prices[Math.floor(prices.length / 2)];

  // Percentile: how many comparables are MORE expensive
  const cheaperCount = prices.filter((p) => p > precioPorM2).length;
  const score = Math.round((cheaperCount / prices.length) * 100);

  let verdict: string;
  if (score >= 80) verdict = "Oportunidad - Muy por debajo del mercado";
  else if (score >= 60) verdict = "Buen precio - Por debajo del promedio";
  else if (score >= 40) verdict = "Precio justo - En linea con el mercado";
  else if (score >= 20) verdict = "Por encima del promedio";
  else verdict = "Caro - Muy por encima del mercado";

  const difference = Math.round(((avg - precioPorM2) / avg) * 100);

  return NextResponse.json({
    score,
    verdict,
    input_price_m2_usd: Math.round(precioPorM2),
    avg_comparable_m2_usd: Math.round(avg),
    median_comparable_m2_usd: Math.round(median),
    difference_percent: difference,
    comparables_count: comparables.length,
  });
}
