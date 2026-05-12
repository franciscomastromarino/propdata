import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

function getScoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#22c55e";
  if (score >= 40) return "#eab308";
  if (score >= 20) return "#ea580c";
  return "#dc2626";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const score = Number(searchParams.get("score") || "78");
  const verdict = searchParams.get("verdict") || "Buen precio";
  const priceM2 = searchParams.get("price") || "2,200";
  const avgM2 = searchParams.get("avg") || "2,847";
  const diff = searchParams.get("diff") || "23";

  const color = getScoreColor(score);

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
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: "60px",
          }}
        >
          {/* Score circle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                border: `8px solid ${color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{ fontSize: "64px", fontWeight: "bold", color: color }}
              >
                {score}
              </span>
            </div>
            <span style={{ fontSize: "24px", fontWeight: "600", color: color }}>
              {verdict}
            </span>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "18px", color: "#94a3b8" }}>
                Precio/m2
              </span>
              <span style={{ fontSize: "36px", fontWeight: "bold" }}>
                USD {priceM2}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "18px", color: "#94a3b8" }}>
                Promedio zona
              </span>
              <span style={{ fontSize: "36px", fontWeight: "bold" }}>
                USD {avgM2}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "18px", color: "#94a3b8" }}>
                Diferencia
              </span>
              <span
                style={{ fontSize: "36px", fontWeight: "bold", color: color }}
              >
                -{diff}%
              </span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: "16px", color: "#64748b", margin: 0 }}>
          propdata.ar — Calculadora de Oportunidad Inmobiliaria
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
