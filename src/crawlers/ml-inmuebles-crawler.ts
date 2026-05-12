import { type PlaywrightCrawlingContext, Dataset } from "crawlee";
import { createBaseCrawler, type RawListingData } from "./base-crawler";

const CONFIG = {
  name: "mercadolibre",
  baseUrl: "https://inmuebles.mercadolibre.com.ar",
  startUrls: [
    "https://inmuebles.mercadolibre.com.ar/departamentos/venta/",
    "https://inmuebles.mercadolibre.com.ar/casas/venta/",
    "https://inmuebles.mercadolibre.com.ar/departamentos/alquiler/",
  ],
};

async function handler(context: PlaywrightCrawlingContext) {
  const { page, request, log, enqueueLinks } = context;

  if (request.label === "DETAIL") {
    log.info(`Scraping detail: ${request.url}`);

    const listing: RawListingData = await page.evaluate(() => {
      const getText = (sel: string) =>
        document.querySelector(sel)?.textContent?.trim() || undefined;

      const priceText = getText(".ui-pdp-price__second-line .andes-money-amount__fraction") || "";
      const currencySymbol = getText(".ui-pdp-price__second-line .andes-money-amount__currency-symbol") || "";

      return {
        externalId: window.location.pathname.match(/MLA-(\d+)/)?.[1] || "",
        url: window.location.href,
        precio: parseFloat(priceText.replace(/\./g, "")) || undefined,
        moneda: currencySymbol.includes("U$S") ? "USD" : "ARS",
        superficieM2: undefined,
        ambientes: undefined,
        direccion: getText(".ui-pdp-media__title"),
        tipo: undefined,
        operacion: undefined,
        descripcion: getText(".ui-pdp-description__content"),
        imagenes: [],
        extras: {},
      };
    });

    await Dataset.pushData({ portal: CONFIG.name, ...listing });
  } else {
    log.info(`Scraping list page: ${request.url}`);

    await enqueueLinks({
      selector: ".ui-search-result__content a.ui-search-link",
      label: "DETAIL",
      baseUrl: CONFIG.baseUrl,
    });

    await enqueueLinks({
      selector: "a.andes-pagination__link[title='Siguiente']",
      baseUrl: CONFIG.baseUrl,
    });
  }
}

export function createMlInmueblesCrawler() {
  return createBaseCrawler(CONFIG, handler);
}
