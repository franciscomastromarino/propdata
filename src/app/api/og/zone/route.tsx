import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const price = searchParams.get("price") || "2,847";
  const barrio = searchParams.get("barrio") || "Palermo";
  const percentile = searchParams.get("percentile") || "72";
  const count = searchParams.get("count") || "247";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0b1120",
          color: "#e2e8f0",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#2563eb",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            P
          </div>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>PropData</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <p style={{ fontSize: "24px", color: "#94a3b8", margin: 0 }}>
            Precio promedio por m2 en {barrio}
          </p>
          <p
            style={{
              fontSize: "80px",
              fontWeight: "bold",
              color: "#3b82f6",
              margin: 0,
              lineHeight: 1,
            }}
          >
            USD {price}
          </p>
          <div style={{ display: "flex", gap: "40px", marginTop: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "18px", color: "#94a3b8" }}>
                Ranking CABA
              </span>
              <span style={{ fontSize: "32px", fontWeight: "bold" }}>
                Top {100 - Number(percentile)}%
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "18px", color: "#94a3b8" }}>
                Propiedades
              </span>
              <span style={{ fontSize: "32px", fontWeight: "bold" }}>
                {count}
              </span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: "16px", color: "#64748b", margin: 0 }}>
          propdata.ar — Inteligencia Inmobiliaria Argentina
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
