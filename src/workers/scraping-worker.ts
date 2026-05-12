import { type Job } from "bullmq";
import { prisma } from "../lib/prisma";
import { normalizationQueue, createWorker } from "../lib/queue";
import { createZonapropCrawler } from "../crawlers/zonaprop-crawler";
import { createArgenpropCrawler } from "../crawlers/argenprop-crawler";
import { createMlInmueblesCrawler } from "../crawlers/ml-inmuebles-crawler";
import { createProperatiCrawler } from "../crawlers/properati-crawler";
import { Dataset } from "crawlee";

interface ScrapingJobData {
  portal: "zonaprop" | "argenprop" | "mercadolibre" | "properati";
  maxRequests?: number;
}

const crawlerFactories = {
  zonaprop: createZonapropCrawler,
  argenprop: createArgenpropCrawler,
  mercadolibre: createMlInmueblesCrawler,
  properati: createProperatiCrawler,
};

async function processScraping(job: Job<ScrapingJobData>) {
  const { portal, maxRequests } = job.data;
  job.log(`Starting ${portal} crawler`);

  const factory = crawlerFactories[portal];
  if (!factory) throw new Error(`Unknown portal: ${portal}`);

  const crawler = factory();
  await crawler.run();

  // Get portal record
  const portalRecord = await prisma.portal.upsert({
    where: { name: portal },
    create: { name: portal, baseUrl: "" },
    update: {},
  });

  // Process dataset items
  const dataset = await Dataset.open();
  const items = await dataset.getData();

  for (const item of items.items) {
    const rawListing = await prisma.rawListing.upsert({
      where: {
        portalId_externalId: {
          portalId: portalRecord.id,
          externalId: item.externalId as string,
        },
      },
      create: {
        portalId: portalRecord.id,
        externalId: item.externalId as string,
        rawData: item,
      },
      update: {
        rawData: item,
        scrapedAt: new Date(),
      },
    });

    // Queue for normalization
    await normalizationQueue.add("normalize", {
      rawListingId: rawListing.id,
    });
  }

  await dataset.drop();
  job.log(`Completed ${portal}: ${items.items.length} listings scraped`);
}

export function startScrapingWorker() {
  return createWorker<ScrapingJobData>("scraping", processScraping, 1);
}
