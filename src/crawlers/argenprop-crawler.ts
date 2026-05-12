import { type PlaywrightCrawlingContext, Dataset } from "crawlee";
import { createBaseCrawler, type RawListingData } from "./base-crawler";

const CONFIG = {
  name: "argenprop",
  baseUrl: "https://www.argenprop.com",
  startUrls: [
    "https://www.argenprop.com/departamento-venta",
    "https://www.argenprop.com/casa-venta",
    "https://www.argenprop.com/departamento-alquiler",
  ],
};

async function handler(context: PlaywrightCrawlingContext) {
  const { page, request, log, enqueueLinks } = context;

  if (request.label === "DETAIL") {
    log.info(`Scraping detail: ${request.url}`);

    const listing: RawListingData = await page.evaluate(() => {
      const getText = (sel: string) =>
        document.querySelector(sel)?.textContent?.trim() || undefined;

      const priceText = getText(".titlebar__price") || "";
      const isUsd = priceText.includes("U$S") || priceText.includes("USD");

      return {
        externalId: window.location.pathname.split("--").pop() || "",
        url: window.location.href,
        precio: parseFloat(priceText.replace(/[^0-9.,]/g, "").replace(",", ".")) || undefined,
        moneda: isUsd ? "USD" : "ARS",
        superficieM2: parseFloat(
          getText(".titlebar__address-info span")?.replace(/[^0-9.,]/g, "").replace(",", ".") || "0"
        ) || undefined,
        ambientes: undefined,
        direccion: getText(".titlebar__address"),
        tipo: undefined,
        operacion: undefined,
        descripcion: getText(".section-description--content"),
        imagenes: [],
        extras: {},
      };
    });

    await Dataset.pushData({ portal: CONFIG.name, ...listing });
  } else {
    log.info(`Scraping list page: ${request.url}`);

    await enqueueLinks({
      selector: ".listing__item a",
      label: "DETAIL",
      baseUrl: CONFIG.baseUrl,
    });

    await enqueueLinks({
      selector: 'a[rel="next"]',
      baseUrl: CONFIG.baseUrl,
    });
  }
}

export function createArgenpropCrawler() {
  return createBaseCrawler(CONFIG, handler);
}
