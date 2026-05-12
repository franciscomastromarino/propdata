import { NextRequest, NextResponse } from "next/server";
import { scrapingQueue } from "@/lib/queue";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { portal, maxRequests } = body;

  const validPortals = ["zonaprop", "argenprop", "mercadolibre", "properati"];
  if (!validPortals.includes(portal)) {
    return NextResponse.json(
      { error: `Invalid portal. Use one of: ${validPortals.join(", ")}` },
      { status: 400 }
    );
  }

  const job = await scrapingQueue.add(`scrape-${portal}`, {
    portal,
    maxRequests: maxRequests || undefined,
  });

  return NextResponse.json({
    message: `Scraping job queued for ${portal}`,
    jobId: job.id,
  });
}
