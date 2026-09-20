import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Hussain.Art — Hussain Marzooq";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function signatureDataUri() {
  const file = await readFile(
    join(process.cwd(), "public", "brand", "signature-white.png"),
  );
  return `data:image/png;base64,${file.toString("base64")}`;
}

export default async function OpengraphImage() {
  const signature = await signatureDataUri();

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
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          <img src={signature} alt="Hussain.Art" width={620} height={304} />
          <div style={{ fontSize: 34, color: "#a1a1aa", maxWidth: 820, lineHeight: 1.25 }}>
            Cinematic photography, film, and creative direction — Dubai, worldwide.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
