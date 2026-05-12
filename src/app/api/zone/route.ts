import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    if (!address) {
      return NextResponse.json(
        { error: "Provide address or lat/lng parameters" },
        { status: 400 }
      );
    }

    // TODO: Geocode address to lat/lng using Google Geocoding API
    return NextResponse.json(
      { error: "Geocoding not yet implemented. Provide lat/lng directly." },
      { status: 501 }
    );
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusKm = parseFloat(
    request.nextUrl.searchParams.get("radius") || "0.5"
  );

  // Find properties within radius using Haversine approximation
  // 0.009 degrees ≈ 1km at Buenos Aires latitude
  const degreeRadius = radiusKm * 0.009;

  const properties = await prisma.property.findMany({
    where: {
      latitude: {
        gte: latitude - degreeRadius,
        lte: latitude + degreeRadius,
      },
      longitude: {
        gte: longitude - degreeRadius,
        lte: longitude + degreeRadius,
      },
      precioPorM2Usd: { not: null },
    },
    select: {
      precioPorM2Usd: true,
      tipo: true,
      ambientes: true,
      superficieM2: true,
      barrio: true,
    },
  });

  if (properties.length === 0) {
    return NextResponse.json({
      message: "No properties found in this area",
      count: 0,
    });
  }

  const prices = properties
    .map((p) => p.precioPorM2Usd!)
    .sort((a, b) => a - b);
  const avgPriceM2 = prices.reduce((a, b) => a + b, 0) / prices.length;
  const medianPriceM2 = prices[Math.floor(prices.length / 2)];

  // Get city-wide stats for percentile ranking
  const allZones = await prisma.zone.findMany({
    where: { avgPriceM2Usd: { not: null } },
    select: { avgPriceM2Usd: true },
    orderBy: { avgPriceM2Usd: "asc" },
  });

  let percentile = 50;
  if (allZones.length > 0) {
    const rank = allZones.filter(
      (z) => z.avgPriceM2Usd! <= avgPriceM2
    ).length;
    percentile = Math.round((rank / allZones.length) * 100);
  }

  return NextResponse.json({
    location: { latitude, longitude },
    radius_km: radiusKm,
    count: properties.length,
    avg_price_m2_usd: Math.round(avgPriceM2),
    median_price_m2_usd: Math.round(medianPriceM2),
    percentile_caba: percentile,
    types: countBy(properties, "tipo"),
  });
}

function countBy<T>(arr: T[], key: keyof T): Record<string, number> {
  return arr.reduce(
    (acc, item) => {
      const val = String(item[key] || "otros");
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}
