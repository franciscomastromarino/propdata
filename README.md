# Plan de Implementación MVP — Inteligencia Inmobiliaria Argentina

## Contexto

No existe un servicio de inteligencia inmobiliaria para LATAM equivalente a lo que ATTOM/HouseCanary/CASAFARI ofrecen en USA/Europa. El objetivo es construir una plataforma que recopile, normalice con AI, y visualice datos de propiedades en Argentina, empezando por CABA + GBA. El producto se viraliza a través de tres features compartibles.

---

## Decisiones confirmadas

| Aspecto | Decisión |
|---------|---------|
| Repo | Independiente (fuera de quick.bot) |
| Runtime MVP | Node/TypeScript |
| ML futuro | Microservicio Python conectado a la misma DB |
| LLM | Claude Haiku via Instructor-JS |
| DB | Neon (PostgreSQL + PostGIS + pgvector) |
| Frontend | Next.js (App Router) |
| Scraping | Crawlee |
| Mapas | Mapbox GL JS |
| Mercado | Argentina (CABA + GBA) |
| Features | Las tres killer features juntas |

---

## Stack completo

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  Next.js (App Router) + Tailwind + Mapbox GL JS │
│  Satori + Sharp (generación de cards virales)    │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│                   BACKEND                        │
│  Next.js API Routes + tRPC o REST               │
│  BullMQ + Redis (job queue para scraping)        │
│  Instructor-JS + Claude Haiku (extracción AI)    │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│                   DATA LAYER                     │
│  Neon PostgreSQL + PostGIS + pgvector            │
│  Prisma (ORM) + raw SQL para queries geo         │
│  Turf.js (cálculos geoespaciales client-side)    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              SCRAPING PIPELINE                   │
│  Crawlee (Playwright mode)                       │
│  4 crawlers: Zonaprop, Argenprop, ML, Properati  │
│  Proxies opcionales (Webshare/IPRoyal ~$30/mes)  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              FUTURO (no MVP)                     │
│  Microservicio Python (sklearn, xgboost)         │
│  Conectado a la misma Neon PostgreSQL            │
└─────────────────────────────────────────────────┘
```

---

## Fases de implementación

### Fase 0: Setup del proyecto (~2 días)

1. Crear repo independiente
2. Setup Next.js con App Router + Tailwind
3. Configurar Neon PostgreSQL + habilitar extensiones:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Setup Prisma con schema inicial
5. Configurar Redis (Upstash o local) para BullMQ
6. Setup Crawlee en el proyecto

### Fase 1: Schema de base de datos (~3 días)

Tablas core:

```
portals           → id, name, base_url, scraper_config
raw_listings      → id, portal_id, external_id, raw_data (JSONB), scraped_at
properties        → id, address_raw, address_normalized, location (GEOGRAPHY Point),
                    barrio, ciudad, provincia, tipo, ambientes, superficie_m2,
                    precio, moneda, precio_usd, precio_por_m2_usd,
                    descripcion, amenities (JSONB), apto_credito, antiguedad,
                    embedding (vector(1536)), created_at, updated_at
listings          → id, property_id, portal_id, external_url, precio_publicado,
                    moneda, fecha_publicacion, fecha_baja, activo
price_history     → id, property_id, precio, moneda, precio_usd, recorded_at
zones             → id, name, type (barrio/comuna/localidad), geometry (GEOMETRY Polygon),
                    avg_price_m2_usd, median_price_m2_usd, listing_count, updated_at
```

Indexes geoespaciales:
```sql
CREATE INDEX idx_properties_location ON properties USING GIST(location);
CREATE INDEX idx_zones_geometry ON zones USING GIST(geometry);
CREATE INDEX idx_properties_embedding ON properties USING ivfflat(embedding vector_cosine_ops);
```

### Fase 2: Scraping pipeline (~2 semanas)

**2.1 — Crawlers (1 semana)**

Un crawler Crawlee por portal:
- `zonaprop-crawler.ts` — Zonaprop (~700K listings)
- `argenprop-crawler.ts` — Argenprop (~430K listings)
- `ml-inmuebles-crawler.ts` — MercadoLibre Inmuebles
- `properati-crawler.ts` — Properati

Cada crawler:
1. Navega listados paginados
2. Extrae campos estructurados via CSS selectors (precio, m², dirección, tipo, ambientes)
3. Extrae texto libre de la descripción
4. Guarda en `raw_listings` como JSONB

**2.2 — Normalización con AI (1 semana)**

Pipeline de procesamiento por listing:

```
raw_listing
  → Extracción de campos básicos (regex/selectors, sin LLM)
  → Instructor-JS + Claude Haiku: extraer de la descripción
    → amenities, apto_credito, estado, orientación, etc.
  → Normalización de dirección (LLM + Google Geocoding API)
    → coordenadas lat/lng
  → Conversión de precio a USD (API dólar blue del día)
  → Generación de embedding (text-embedding-3-small de OpenAI)
  → Deduplicación: buscar en pgvector propiedades similares
    → distancia geo < 50m + embedding similarity > 0.92 + superficie ±5%
    → Si match: actualizar price_history
    → Si no match: insertar nueva property
  → Validación Zod → guardar en `properties`
```

**2.3 — Agregación por zonas (2 días)**

Job periódico que:
1. Calcula promedio y mediana de precio/m² por zona (barrio, comuna)
2. Actualiza tabla `zones`
3. Genera tendencia (comparación con período anterior)

### Fase 3: Feature 1 — "¿Cuánto vale tu cuadra?" (~1 semana)

**Input**: dirección ingresada por el usuario

**Pipeline**:
1. Geocoding de la dirección → lat/lng
2. Query PostGIS: propiedades en radio de 500m
3. Calcular: promedio m², ranking vs otras zonas, tendencia
4. Generar card visual con Satori + Sharp:
   - Precio/m² de la zona
   - Ranking percentil ("Top 15% de CABA")
   - Flecha tendencia (verde/roja)
   - Comparación: "Con este precio en X, comprarías Y"
5. Servir como OG image para sharing en redes
6. Link corto a versión interactiva

**Endpoints**:
- `GET /api/zone?address=...` → datos de la zona
- `GET /api/og/zone?address=...` → imagen OG generada dinámicamente

### Fase 4: Feature 2 — Mapa de Calor Interactivo (~1.5 semanas)

**Componentes**:
1. Mapbox GL JS con heatmap layer
2. Datos servidos como GeoJSON tiles desde PostGIS
3. Filtros: tipo (venta/alquiler), ambientes, rango de precio
4. Color scale por precio/m² USD
5. Click en zona → detalle con stats
6. Slider temporal (cuando haya datos acumulados de >1 mes)

**Endpoints**:
- `GET /api/tiles/{z}/{x}/{y}.geojson` → tiles con datos agregados
- `GET /api/zone/{id}/stats` → estadísticas detalladas de una zona

### Fase 5: Feature 3 — Calculadora de Oportunidad (~1 semana)

**Input**: URL de un listing o datos manuales (dirección, m², precio)

**Pipeline**:
1. Si URL: scrape on-demand del listing
2. Geocoding → lat/lng
3. Query PostGIS: propiedades comparables (mismo tipo, ambientes ±1, radio 1km)
4. Calcular percentil del precio vs comparables
5. Score 1-100:
   - 80-100: oportunidad (por debajo del promedio)
   - 50-80: precio justo
   - 0-50: por encima del promedio
6. Generar card compartible con score + veredicto

**Endpoints**:
- `POST /api/opportunity` → análisis de oportunidad
- `GET /api/og/opportunity?id=...` → card compartible

### Fase 6: Landing page + SEO (~3 días)

1. Home con mapa preview + CTA
2. Páginas por barrio generadas estáticamente (`/barrio/[slug]`)
   - SEO optimizado: "Precio m² en Palermo 2026"
3. Share cards con OG tags dinámicos
4. Analytics (Plausible o PostHog)

---

## Costos estimados

### Scraping inicial (one-time) — ~1.5M listings de 4 portales

| Opción | Costo estimado | Notas |
|--------|---------------|-------|
| **Crawlee self-hosted** | $0 (solo infra) | Gratis pero requiere proxies para evitar bloqueos |
| **Crawlee + proxies** | $50-100 | Webshare/IPRoyal por el volumen de la corrida inicial |
| **Bright Data Web Scraper** | ~$4,500 | $3 por cada 1,000 páginas × 1.5M páginas |
| **Bright Data (solo proxies residenciales)** | ~$150-300 | $8.40/GB, estimando ~20-35GB para 1.5M páginas. Usás Crawlee para la lógica y Bright Data solo para IPs |
| **Apify Cloud (managed)** | ~$200-500 | Plan Scale $199/mes, créditos incluidos cubren parte del volumen |

**Recomendación**: Crawlee + Bright Data solo como proveedor de proxies residenciales (~$150-300). Obtenés la lógica custom de Crawlee con la red de IPs de Bright Data sin pagar $3/página.

### Costos de procesamiento AI inicial (one-time)

| Servicio | Costo estimado | Cálculo |
|----------|---------------|---------|
| Claude Haiku (extracción) | $200-400 | ~500 tokens/listing × 800K propiedades únicas |
| OpenAI embeddings | $10-20 | text-embedding-3-small, ~$0.02/1M tokens |
| Google Geocoding | $40-80 | $5/1K requests × 800K propiedades únicas (con cache de direcciones repetidas) |
| **Total one-time** | **~$400-800** | — |

### Costos mensuales operativos (post-scraping inicial)

| Servicio | Costo |
|----------|-------|
| Neon PostgreSQL (Pro) | $19/mes |
| Redis (Upstash) | $0-10/mes |
| Claude Haiku (Instructor) | $50-100/mes (corridas incrementales ~100-200K listings nuevos/modificados) |
| OpenAI embeddings | $5-10/mes |
| Google Geocoding API | $5-20/mes |
| Vercel (deploy) | $0-20/mes |
| Mapbox | $0 (50K loads gratis) |
| Bright Data proxies residenciales (corridas incrementales semanales) | $30-80/mes |
| **Total mensual** | **~$110-260/mes** |

Primera corrida completa (one-time): ~$200-400 adicional en tokens de LLM.

---

## Decisiones adicionales

- **Moneda**: Todos los precios se normalizan a USD. Se usa API de dólar blue del día para conversión ARS→USD.
- **Seed histórico**: Descartado para el MVP. Los datos se acumulan desde la primera corrida de scraping.
- **Anti-bloqueo**: Bright Data proxies residenciales se encarga de rotación de IPs, fingerprinting y bypass de protecciones de los portales. Crawlee maneja la lógica, Bright Data la red.
- **Monitoreo de scrapers**: Alertas automáticas cuando un crawler falla (cambio de HTML del portal, bloqueo, etc.). BullMQ registra jobs fallidos → notificación por email/Slack.
- **Microservicio Python (futuro)**: Se agrega cuando se necesiten modelos de valuación custom (sklearn/xgboost) o detección de anomalías estadística. Lee de la misma Neon PostgreSQL. No es parte del MVP.

---

## Timeline estimado

| Fase | Duración | Acumulado |
|------|----------|-----------|
| 0: Setup | 2 días | 2 días |
| 1: Schema DB | 3 días | 1 semana |
| 2: Scraping + AI pipeline | 2 semanas | 3 semanas |
| 3: "¿Cuánto vale tu cuadra?" | 1 semana | 4 semanas |
| 4: Mapa de Calor | 1.5 semanas | 5.5 semanas |
| 5: Calculadora de Oportunidad | 1 semana | 6.5 semanas |
| 6: Landing + SEO | 3 días | ~7 semanas |

**MVP funcional: ~7 semanas** con 1 dev full-time.

---

## Verificación / Testing

1. **Scraping**: Correr cada crawler contra 100 listings y validar extracción de campos
2. **Normalización AI**: Sample de 50 listings, verificar calidad de extracción de Instructor vs manual
3. **Deduplicación**: Insertar misma propiedad de 2 portales, verificar que se detecta como duplicada
4. **PostGIS queries**: Test de búsqueda por radio, por zona, performance con >100K registros
5. **Cards compartibles**: Verificar render correcto de OG images en WhatsApp, Twitter, Instagram
6. **Mapa**: Test con dataset completo, verificar performance de tiles y filtros
7. **Calculadora**: Test con propiedades conocidas, validar que el score es coherente
