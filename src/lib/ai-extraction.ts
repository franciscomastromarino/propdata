import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const anthropic = new Anthropic();

export const ExtractedListingSchema = z.object({
  amenities: z.array(z.string()).default([]),
  aptoCredito: z.boolean().nullable().default(null),
  estado: z
    .enum(["nuevo", "muy bueno", "bueno", "regular", "a reciclar", "en construccion"])
    .nullable()
    .default(null),
  orientacion: z.string().nullable().default(null),
  ambientes: z.number().nullable().default(null),
  banos: z.number().nullable().default(null),
  cochera: z.boolean().nullable().default(null),
  expensas: z.number().nullable().default(null),
  piso: z.string().nullable().default(null),
  antiguedad: z.number().nullable().default(null),
  tipoPropiedad: z
    .enum(["departamento", "casa", "ph", "local", "oficina", "terreno", "otro"])
    .nullable()
    .default(null),
});

export type ExtractedListing = z.infer<typeof ExtractedListingSchema>;

export async function extractListingDetails(
  descripcion: string
): Promise<ExtractedListing> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Extraé los siguientes datos de esta descripción de propiedad inmobiliaria argentina. Respondé SOLO con JSON válido, sin markdown ni explicaciones.

Campos a extraer:
- amenities: array de strings (pileta, gym, sum, laundry, seguridad 24hs, balcon, terraza, parrilla, etc.)
- aptoCredito: boolean o null
- estado: "nuevo" | "muy bueno" | "bueno" | "regular" | "a reciclar" | "en construccion" | null
- orientacion: string o null (norte, sur, este, oeste, noroeste, etc.)
- ambientes: numero o null
- banos: numero o null
- cochera: boolean o null
- expensas: numero en ARS o null
- piso: string o null
- antiguedad: años como numero o null
- tipoPropiedad: "departamento" | "casa" | "ph" | "local" | "oficina" | "terreno" | "otro" | null

Descripción:
${descripcion}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  const parsed = JSON.parse(text);
  return ExtractedListingSchema.parse(parsed);
}
