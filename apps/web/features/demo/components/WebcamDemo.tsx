"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";

type Metrics = {
  turtle: boolean;
  slouch: boolean;
  textNeck: boolean;
};

type Baseline = {
  zoom: number;
  height: number;
  pitch: number;
};

type PoseLandmark = {
  x: number;
  y: number;
};

type PoseLandmarks = Record<number, PoseLandmark>;

const DEFAULT_THRESHOLDS = {
  TURTLE_NECK: 1.3,
  SLOUCHING: 0.8,
  TEXT_NECK: 0.05
};

const FRAME_INTERVAL = 100;
const REQUIRED_LANDMARK_INDICES = [0, 2, 5, 7, 8, 11, 12] as const;

export function WebcamDemo({ locale }: { locale: Locale }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const poseRef = useRef<any>(null);
  const baselineRef = useRef<Baseline | null>(null);
  const baselineRequestedRef = useRef(false);
  const lastFrameRef = useRef<number>(0);
  const fpsWindowRef = useRef<{ start: number; count: number }>({
    start: performance.now(),
    count: 0
  });

  const [running, setRunning] = useState(false);
  const [sensitivity, setSensitivity] = useState(50);
  const [fps, setFps] = useState(0);
  const [status, setStatus] = useState<"NORMAL" | "BAD">("NORMAL");
  const [metrics, setMetrics] = useState<Metrics>({
    turtle: false,
    slouch: false,
    textNeck: false
  });
  const [error, setError] = useState<string>("");

  const t = useMemo(
    () =>
      locale === "ko"
        ? {
            start: "데모 시작",
            stop: "중지",
            baseline: "Baseline 설정",
            status: "상태",
            normal: "정상",
            bad: "경고",
            sensitivity: "민감도",
            fps: "처리 FPS",
            lowPower: "저전력 모드",
            active: "활성",
            idle: "안정",
            camHint: "브라우저 카메라 권한을 허용하세요."
          }
        : {
            start: "Start Demo",
            stop: "Stop",
            baseline: "Set Baseline",
            status: "Status",
            normal: "Normal",
            bad: "Warning",
            sensitivity: "Sensitivity",
            fps: "Processing FPS",
            lowPower: "Low-power mode",
            active: "Active",
            idle: "Stable",
            camHint: "Allow camera access in your browser."
          },
    [locale]
  );

  function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
  }

  function getLandmark(landmarks: unknown[], index: number): PoseLandmark | null {
    const point = landmarks[index];
    if (!point || typeof point !== "object") return null;
    const candidate = point as { x?: unknown; y?: unknown };
    if (!isFiniteNumber(candidate.x) || !isFiniteNumber(candidate.y)) return null;
    return { x: candidate.x, y: candidate.y };
  }

  function hasRequiredLandmarks(landmarks: unknown[]): landmarks is PoseLandmarks {
    return REQUIRED_LANDMARK_INDICES.every((index) => getLandmark(landmarks, index) !== null);
  }

  function getEyeDistance(landmarks: unknown[]) {
    if (!hasRequiredLandmarks(landmarks)) return null;
    const leftEye = getLandmark(landmarks, 2);
    const rightEye = getLandmark(landmarks, 5);
    if (!leftEye || !rightEye) return null;
    return Math.hypot(leftEye.x - rightEye.x, leftEye.y - rightEye.y);
  }

  function getTorsoHeight(landmarks: unknown[]) {
    if (!hasRequiredLandmarks(landmarks)) return null;
    const nose = getLandmark(landmarks, 0);
    const leftShoulder = getLandmark(landmarks, 11);
    const rightShoulder = getLandmark(landmarks, 12);
    if (!nose || !leftShoulder || !rightShoulder) return null;
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    return Math.abs(shoulderMidY - nose.y);
  }

  function getNoseEarYDiff(landmarks: unknown[]) {
    if (!hasRequiredLandmarks(landmarks)) return null;
    const nose = getLandmark(landmarks, 0);
    const leftEar = getLandmark(landmarks, 7);
    const rightEar = getLandmark(landmarks, 8);
    if (!nose || !leftEar || !rightEar) return null;
    const earMidY = (leftEar.y + rightEar.y) / 2;
    return nose.y - earMidY;
  }

  function getPostureSample(landmarks: unknown[]): Baseline | null {
    const zoom = getEyeDistance(landmarks);
    const height = getTorsoHeight(landmarks);
    const pitch = getNoseEarYDiff(landmarks);
    if (!isFiniteNumber(zoom) || !isFiniteNumber(height) || !isFiniteNumber(pitch)) return null;
    return { zoom, height, pitch };
  }

  function evaluate(currentPosture: Baseline | null) {
    const baseline = baselineRef.current;
    if (!baseline || !currentPosture) {
      return {
        status: "NORMAL" as const,
        metrics: { turtle: false, slouch: false, textNeck: false }
      };
    }

    const { zoom: currentZoom, height: currentHeight, pitch: currentPitch } = currentPosture;

    if (baseline.height === 0) {
      return {
        status: "NORMAL" as const,
        metrics: { turtle: false, slouch: false, textNeck: false }
      };
    }

    const zoomRatio = currentZoom / baseline.zoom;
    const heightRatio = currentHeight / baseline.height;
    const pitchDiff = currentPitch - baseline.pitch;

    const factor = sensitivity / 100;
    const thZoom = DEFAULT_THRESHOLDS.TURTLE_NECK - 0.2 * factor;
    const thHeight = DEFAULT_THRESHOLDS.SLOUCHING + 0.15 * factor;
    const thPitch = DEFAULT_THRESHOLDS.TEXT_NECK - 0.04 * factor;

    const turtle = zoomRatio > thZoom;
    const slouch = heightRatio < thHeight;
    const textNeck = pitchDiff > thPitch;
    const isBad = turtle || slouch || textNeck;

    return {
      status: isBad ? ("BAD" as const) : ("NORMAL" as const),
      metrics: { turtle, slouch, textNeck }
    };
  }

  function updateFps() {
    const now = performance.now();
    fpsWindowRef.current.count += 1;
    const elapsed = now - fpsWindowRef.current.start;
    if (elapsed >= 1000) {
      const nextFps = Math.round((fpsWindowRef.current.count * 1000) / elapsed);
      setFps(nextFps);
      fpsWindowRef.current.start = now;
      fpsWindowRef.current.count = 0;
    }
  }

  async function ensurePose() {
    if (poseRef.current) return poseRef.current;

    const posePkg = await import("@mediapipe/pose");
    const drawPkg = await import("@mediapipe/drawing_utils");

    const pose = new posePkg.Pose({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    pose.onResults((results: any) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.poseLandmarks) {
        const posture = getPostureSample(results.poseLandmarks);
        if (!posture) {
          setStatus("NORMAL");
          setMetrics({ turtle: false, slouch: false, textNeck: false });
          updateFps();
          return;
        }

        if (baselineRequestedRef.current) {
          baselineRef.current = posture;
          baselineRequestedRef.current = false;
        }

        drawPkg.drawConnectors(ctx, results.poseLandmarks, posePkg.POSE_CONNECTIONS, {
          color: "#77ff88",
          lineWidth: 2
        });
        drawPkg.drawLandmarks(ctx, results.poseLandmarks, {
          color: "#bbffcc",
          lineWidth: 1,
          radius: 2
        });

        const evaluated = evaluate(posture);
        setStatus(evaluated.status);
        setMetrics(evaluated.metrics);
      }
      updateFps();
    });

    poseRef.current = pose;
    return pose;
  }

  async function tick() {
    const now = performance.now();
    const video = videoRef.current;
    if (!video || !poseRef.current) return;

    if (now - lastFrameRef.current >= FRAME_INTERVAL) {
      await poseRef.current.send({ image: video });
      lastFrameRef.current = now;
    }

    rafRef.current = requestAnimationFrame(() => {
      void tick();
    });
  }

  async function start() {
    setError("");
    try {
      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      await ensurePose();
      setRunning(true);
      trackEvent("demo_start", { locale });
      rafRef.current = requestAnimationFrame(() => {
        void tick();
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start camera");
    }
  }

  function stop() {
    setRunning(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setFps(0);
    setStatus("NORMAL");
    setMetrics({ turtle: false, slouch: false, textNeck: false });
  }

  function setBaseline() {
    if (!running) return;
    baselineRequestedRef.current = true;
    trackEvent("demo_baseline_set", { locale });
  }

  useEffect(() => stop, []);

  return (
    <div className="demo-shell">
      <div className="demo-toolbar">
        <button onClick={() => void start()} disabled={running}>
          {t.start}
        </button>
        <button onClick={stop} disabled={!running}>
          {t.stop}
        </button>
        <button onClick={setBaseline} disabled={!running}>
          {t.baseline}
        </button>
      </div>

      <p className="muted">{t.camHint}</p>
      {error ? <p className="error">{error}</p> : null}

      <div className="demo-grid">
        <div className="video-stage">
          <video ref={videoRef} playsInline muted />
          <canvas ref={canvasRef} />
        </div>
        <div className="stats-card">
          <p>
            {t.status}:{" "}
            <strong className={status === "BAD" ? "bad" : "good"}>
              {status === "BAD" ? t.bad : t.normal}
            </strong>
          </p>
          <p>
            {t.fps}: <strong>{fps}</strong>
          </p>
          <p>
            {t.lowPower}: <strong>{fps < 12 ? t.idle : t.active}</strong>
          </p>
          <div className="metric-list">
            <p>Turtle Neck: {metrics.turtle ? t.bad : t.normal}</p>
            <p>Slouching: {metrics.slouch ? t.bad : t.normal}</p>
            <p>Text Neck: {metrics.textNeck ? t.bad : t.normal}</p>
          </div>
          <label htmlFor="sensitivity">{t.sensitivity}</label>
          <input
            id="sensitivity"
            type="range"
            min={0}
            max={100}
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
