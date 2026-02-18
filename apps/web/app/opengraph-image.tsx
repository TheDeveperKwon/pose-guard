import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          color: "#dbe3ed",
          background:
            "radial-gradient(900px 420px at 82% -10%, #1a3140 0%, rgba(7, 10, 13, 0) 60%), radial-gradient(700px 340px at -12% 22%, #12202c 0%, rgba(7, 10, 13, 0) 58%), #070a0d"
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#9bb2c8"
          }}
        >
          PoseGuard
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: "82%" }}>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              fontWeight: 700
            }}
          >
            Posture Monitoring
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#9ab0c5", lineHeight: 1.35 }}>
            Real-time on-device posture detection for focused work.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 26,
            color: "#7ef7c4"
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#7ef7c4"
            }}
          />
          poseguard.app
        </div>
      </div>
    ),
    size
  );
}
