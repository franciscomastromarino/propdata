import { PlaywrightCrawler, type PlaywrightCrawlingContext } from "crawlee";

export interface CrawlerConfig {
  name: string;
  baseUrl: string;
  startUrls: string[];
  maxConcurrency?: number;
  maxRequestsPerMinute?: number;
  proxyUrls?: string[];
}

export interface RawListingData {
  externalId: string;
  url: string;
  precio?: number;
  moneda?: string;
  superficieM2?: number;
  ambientes?: number;
  direccion?: string;
  tipo?: string;
  operacion?: string;
  descripcion?: string;
  imagenes?: string[];
  rawHtml?: string;
  extras: Record<string, unknown>;
}

export function createBaseCrawler(
  config: CrawlerConfig,
  handler: (context: PlaywrightCrawlingContext) => Promise<void>
) {
  return new PlaywrightCrawler({
    maxConcurrency: config.maxConcurrency ?? 5,
    maxRequestsPerMinute: config.maxRequestsPerMinute ?? 60,
    requestHandlerTimeoutSecs: 60,
    navigationTimeoutSecs: 30,
    requestHandler: handler,
    failedRequestHandler: async ({ request, log }) => {
      log.error(`Request ${request.url} failed after retries.`);
    },
    ...(config.proxyUrls?.length
      ? {
          proxyConfiguration: undefined, // Configure with ProxyConfiguration if using Bright Data
        }
      : {}),
  });
}
