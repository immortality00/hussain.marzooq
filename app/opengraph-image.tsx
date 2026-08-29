import { ImageResponse } from "next/og";

export const alt = "HM Visuals — Hussain Marzooq";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: "88px 96px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#a1a1aa",
          }}
        >
          Hussain Marzooq
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 132, fontWeight: 600, letterSpacing: -3, lineHeight: 1 }}>
            HM Visuals
          </div>
          <div style={{ fontSize: 34, color: "#a1a1aa", maxWidth: 820, lineHeight: 1.25 }}>
            Cinematic photography, film, and creative direction — Dubai, worldwide.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
