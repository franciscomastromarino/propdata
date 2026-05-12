import { type PlaywrightCrawlingContext, Dataset } from "crawlee";
import { createBaseCrawler, type RawListingData } from "./base-crawler";

const CONFIG = {
  name: "zonaprop",
  baseUrl: "https://www.zonaprop.com.ar",
  startUrls: [
    "https://www.zonaprop.com.ar/departamentos-venta.html",
    "https://www.zonaprop.com.ar/casas-venta.html",
    "https://www.zonaprop.com.ar/departamentos-alquiler.html",
  ],
};

async function handler(context: PlaywrightCrawlingContext) {
  const { page, request, log, enqueueLinks } = context;

  if (request.label === "DETAIL") {
    log.info(`Scraping detail: ${request.url}`);

    const listing: RawListingData = await page.evaluate(() => {
      const getText = (sel: string) =>
        document.querySelector(sel)?.textContent?.trim() || undefined;

      return {
        externalId: window.location.pathname.split("-").pop()?.replace(".html", "") || "",
        url: window.location.href,
        precio: parseFloat(
          getText('[data-qa="POSTING_CARD_PRICE"]')?.replace(/[^0-9.,]/g, "").replace(",", ".") || "0"
        ) || undefined,
        moneda: getText('[data-qa="POSTING_CARD_PRICE"]')?.includes("USD") ? "USD" : "ARS",
        superficieM2: parseFloat(
          getText('[data-qa="POSTING_CARD_FEATURES"] span')?.replace(/[^0-9.,]/g, "").replace(",", ".") || "0"
        ) || undefined,
        ambientes: undefined,
        direccion: getText('[data-qa="POSTING_CARD_LOCATION"]'),
        tipo: undefined,
        operacion: undefined,
        descripcion: getText('[data-qa="POSTING_DESCRIPTION"]'),
        imagenes: [],
        extras: {},
      };
    });

    await Dataset.pushData({ portal: CONFIG.name, ...listing });
  } else {
    log.info(`Scraping list page: ${request.url}`);

    // Enqueue detail pages
    await enqueueLinks({
      selector: 'a[data-qa="POSTING_CARD_DESCRIPTION"]',
      label: "DETAIL",
      baseUrl: CONFIG.baseUrl,
    });

    // Enqueue next page
    await enqueueLinks({
      selector: 'a[data-qa="PAGING_NEXT"]',
      baseUrl: CONFIG.baseUrl,
    });
  }
}

export function createZonapropCrawler() {
  return createBaseCrawler(CONFIG, handler);
}
