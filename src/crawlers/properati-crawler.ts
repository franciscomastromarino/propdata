import { type PlaywrightCrawlingContext, Dataset } from "crawlee";
import { createBaseCrawler, type RawListingData } from "./base-crawler";

const CONFIG = {
  name: "properati",
  baseUrl: "https://www.properati.com.ar",
  startUrls: [
    "https://www.properati.com.ar/s/venta/departamento",
    "https://www.properati.com.ar/s/venta/casa",
    "https://www.properati.com.ar/s/alquiler/departamento",
  ],
};

async function handler(context: PlaywrightCrawlingContext) {
  const { page, request, log, enqueueLinks } = context;

  if (request.label === "DETAIL") {
    log.info(`Scraping detail: ${request.url}`);

    const listing: RawListingData = await page.evaluate(() => {
      const getText = (sel: string) =>
        document.querySelector(sel)?.textContent?.trim() || undefined;

      const priceText = getText("[class*='price']") || "";
      const isUsd = priceText.includes("U$S") || priceText.includes("USD");

      return {
        externalId: window.location.pathname.split("/").filter(Boolean).pop() || "",
        url: window.location.href,
        precio: parseFloat(priceText.replace(/[^0-9.,]/g, "").replace(",", ".")) || undefined,
        moneda: isUsd ? "USD" : "ARS",
        superficieM2: undefined,
        ambientes: undefined,
        direccion: getText("[class*='address']"),
        tipo: undefined,
        operacion: undefined,
        descripcion: getText("[class*='description']"),
        imagenes: [],
        extras: {},
      };
    });

    await Dataset.pushData({ portal: CONFIG.name, ...listing });
  } else {
    log.info(`Scraping list page: ${request.url}`);

    await enqueueLinks({
      selector: "a[class*='card']",
      label: "DETAIL",
      baseUrl: CONFIG.baseUrl,
    });

    await enqueueLinks({
      selector: "a[class*='next'], a[rel='next']",
      baseUrl: CONFIG.baseUrl,
    });
  }
}

export function createProperatiCrawler() {
  return createBaseCrawler(CONFIG, handler);
}
