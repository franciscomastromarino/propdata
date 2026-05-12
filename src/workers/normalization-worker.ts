import { type Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { extractListingDetails } from "../lib/ai-extraction";
import { getDolarBlueVenta, convertArsToDolarBlue } from "../lib/dolar";
import { createWorker } from "../lib/queue";

interface NormalizationJobData {
  rawListingId: string;
}

async function processNormalization(job: Job<NormalizationJobData>) {
  const { rawListingId } = job.data;

  const rawListing = await prisma.rawListing.findUnique({
    where: { id: rawListingId },
    include: { portal: true },
  });

  if (!rawListing || rawListing.processed) return;

  const raw = rawListing.rawData as Record<string, unknown>;
  const descripcion = (raw.descripcion as string) || "";
  const direccion = (raw.direccion as string) || "";
  const precioRaw = raw.precio as number | undefined;
  const monedaRaw = (raw.moneda as string) || "ARS";
  const superficieM2 = raw.superficieM2 as number | undefined;

  // AI extraction from description
  let extracted = null;
  if (descripcion.length > 20) {
    extracted = await extractListingDetails(descripcion);
  }

  // Price conversion
  let precioUsd = precioRaw;
  if (precioRaw && monedaRaw === "ARS") {
    const dolarVenta = await getDolarBlueVenta();
    precioUsd = convertArsToDolarBlue(precioRaw, dolarVenta);
  }

  const precioPorM2Usd =
    precioUsd && superficieM2 ? precioUsd / superficieM2 : null;

  // Create or find property
  const property = await prisma.property.create({
    data: {
      addressRaw: direccion,
      tipo: extracted?.tipoPropiedad || (raw.tipo as string) || null,
      ambientes: extracted?.ambientes || (raw.ambientes as number) || null,
      superficieM2: superficieM2 || null,
      precio: precioRaw || null,
      moneda: monedaRaw,
      precioUsd: precioUsd || null,
      precioPorM2Usd: precioPorM2Usd,
      descripcion,
      amenities: extracted?.amenities?.length ? extracted.amenities : undefined,
      aptoCredito: extracted?.aptoCredito,
      antiguedad: extracted?.antiguedad || null,
      operacion: (raw.operacion as string) || null,
      estado: extracted?.estado || null,
      orientacion: extracted?.orientacion || null,
    },
  });

  // Create listing record
  await prisma.listing.create({
    data: {
      propertyId: property.id,
      portalId: rawListing.portalId,
      externalUrl: (raw.url as string) || "",
      precioPublicado: precioRaw || null,
      moneda: monedaRaw,
      activo: true,
    },
  });

  // Record price history
  if (precioRaw && precioUsd) {
    await prisma.priceHistory.create({
      data: {
        propertyId: property.id,
        precio: precioRaw,
        moneda: monedaRaw,
        precioUsd,
      },
    });
  }

  // Mark as processed
  await prisma.rawListing.update({
    where: { id: rawListingId },
    data: { processed: true },
  });

  job.log(`Processed raw listing ${rawListingId} → property ${property.id}`);
}

export function startNormalizationWorker() {
  return createWorker<NormalizationJobData>(
    "normalization",
    processNormalization,
    3
  );
}
