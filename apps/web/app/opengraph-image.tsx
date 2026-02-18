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
          padding: 56,
          color: "#e8eef6",
          backgroundColor: "#0b1118",
          backgroundImage: "linear-gradient(135deg, #0f1b26 0%, #0b1118 65%)"
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#9bb2c8"
          }}
        >
          PoseGuard
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "82%" }}>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              lineHeight: 1.05,
              letterSpacing: -2,
              fontWeight: 700
            }}
          >
            Posture Monitoring
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 34, color: "#b7c7d8", lineHeight: 1.35 }}>
            Real-time on-device posture detection for focused work.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 26
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 9999,
              backgroundColor: "#7ef7c4",
              marginRight: 12
            }}
          />
          <span style={{ color: "#91ffd0" }}>poseguard.app</span>
        </div>
      </div>
    ),
    size
  );
}
