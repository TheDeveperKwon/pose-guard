"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import {
  DEFAULT_THRESHOLDS,
  evaluatePosture,
  extractPostureSample,
  type PostureSample
} from "../../../../shared/posture/index.js";
import { MONITORING_CONFIG, SOUND_CONFIG } from "../../../../shared/policy/index.js";

type Metrics = {
  turtle: boolean;
  slouch: boolean;
  textNeck: boolean;
};

type Baseline = PostureSample;

type ToneOptions = {
  freq: number;
  durationMs: number;
  attackMs?: number;
  releaseMs?: number;
  type?: OscillatorType;
  gainScale?: number;
  startDelayMs?: number;
};

const FRAME_INTERVAL = MONITORING_CONFIG.FRAME_INTERVAL;
const DEBOUNCE_MS = MONITORING_CONFIG.DEBOUNCE_TIME;
const ALARM_COOLDOWN_MS = SOUND_CONFIG.COOLDOWN_MS;
const DEFAULT_VOLUME = SOUND_CONFIG.VOLUME;

function scheduleTone(
  audioContext: AudioContext,
  destination: GainNode,
  options: ToneOptions
) {
  const {
    freq,
    durationMs,
    attackMs = 20,
    releaseMs = 260,
    type = "sine",
    gainScale = 1,
    startDelayMs = 0
  } = options;

  const oscillator = audioContext.createOscillator();
  const toneGain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  filter.type = "bandpass";
  filter.frequency.value = 900;
  filter.Q.value = 0.65;

  oscillator.type = type;
  oscillator.frequency.value = freq;

  const now = audioContext.currentTime;
  const attack = attackMs / 1000;
  const release = releaseMs / 1000;
  const duration = Math.max(0.12, durationMs / 1000);
  const delay = startDelayMs / 1000;

  toneGain.gain.setValueAtTime(0.0001, now + delay);
  toneGain.gain.linearRampToValueAtTime(gainScale, now + delay + attack);
  toneGain.gain.setValueAtTime(
    gainScale,
    Math.max(now + delay + attack, now + delay + duration - release)
  );
  toneGain.gain.linearRampToValueAtTime(0.0001, now + delay + duration);

  oscillator.connect(filter);
  filter.connect(toneGain);
  toneGain.connect(destination);

  oscillator.start(now + delay);
  oscillator.stop(now + delay + duration + 0.02);
}

function playAlertSound(audioContext: AudioContext, destination: GainNode) {
  scheduleTone(audioContext, destination, {
    freq: 540,
    durationMs: 260,
    attackMs: 14,
    releaseMs: 160,
    type: "sine",
    gainScale: 1.0
  });
  scheduleTone(audioContext, destination, {
    freq: 810,
    durationMs: 220,
    attackMs: 14,
    releaseMs: 140,
    type: "sine",
    gainScale: 0.22,
    startDelayMs: 10
  });
  scheduleTone(audioContext, destination, {
    freq: 540,
    durationMs: 260,
    attackMs: 14,
    releaseMs: 160,
    type: "sine",
    gainScale: 0.9,
    startDelayMs: 190
  });
  scheduleTone(audioContext, destination, {
    freq: 810,
    durationMs: 220,
    attackMs: 14,
    releaseMs: 140,
    type: "sine",
    gainScale: 0.2,
    startDelayMs: 200
  });
}

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
  const badPostureStartTimeRef = useRef<number | null>(null);
  const lastAlertAtRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<GainNode | null>(null);
  const lowPowerRef = useRef(false);
  const runningRef = useRef(false);
  const sensitivityRef = useRef(50);

  const [running, setRunning] = useState(false);
  const [sensitivity, setSensitivity] = useState(50);
  const [fps, setFps] = useState(0);
  const [status, setStatus] = useState<"NORMAL" | "BAD">("NORMAL");
  const [metrics, setMetrics] = useState<Metrics>({
    turtle: false,
    slouch: false,
    textNeck: false
  });
  const [lowPower, setLowPower] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [isCameraVisible, setIsCameraVisible] = useState(true);
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
            volume: "경고음 크기",
            showCamera: "카메라 표시",
            fps: "처리 FPS",
            lowPower: "저전력 모드",
            camHint: "브라우저 카메라 권한을 허용하세요.",
            on: "On",
            off: "Off"
          }
        : {
            start: "Start Demo",
            stop: "Stop",
            baseline: "Set Baseline",
            status: "Status",
            normal: "Normal",
            bad: "Warning",
            sensitivity: "Sensitivity",
            volume: "Alert volume",
            showCamera: "Show camera",
            fps: "Processing FPS",
            lowPower: "Low-power mode",
            camHint: "Allow camera access in your browser.",
            on: "On",
            off: "Off"
          },
    [locale]
  );

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

  function resetAlertState() {
    badPostureStartTimeRef.current = null;
    lastAlertAtRef.current = 0;
  }

  async function ensureAudio() {
    if (audioContextRef.current && audioDestinationRef.current) {
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume().catch(() => undefined);
      }
      return;
    }

    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const audioContext = new AudioCtx();
    const destination = audioContext.createGain();
    destination.gain.value = Math.max(0, Math.min(1, volume / 100));
    destination.connect(audioContext.destination);
    audioContextRef.current = audioContext;
    audioDestinationRef.current = destination;

    if (audioContext.state === "suspended") {
      await audioContext.resume().catch(() => undefined);
    }
  }

  function playAlarmIfNeeded() {
    const now = Date.now();
    if (!runningRef.current) return;
    if (now - lastAlertAtRef.current < ALARM_COOLDOWN_MS) return;
    if (!audioContextRef.current || !audioDestinationRef.current) return;
    if (audioContextRef.current.state === "suspended") return;

    lastAlertAtRef.current = now;
    playAlertSound(audioContextRef.current, audioDestinationRef.current);
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

      const now = Date.now();
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!results.poseLandmarks) {
        setStatus("NORMAL");
        setMetrics({ turtle: false, slouch: false, textNeck: false });
        resetAlertState();
        updateFps();
        return;
      }

      const posture = extractPostureSample(results.poseLandmarks);
      if (!posture) {
        setStatus("NORMAL");
        setMetrics({ turtle: false, slouch: false, textNeck: false });
        resetAlertState();
        updateFps();
        return;
      }

      if (baselineRequestedRef.current) {
        baselineRef.current = posture;
        baselineRequestedRef.current = false;
      }

      if (!lowPowerRef.current) {
        drawPkg.drawConnectors(ctx, results.poseLandmarks, posePkg.POSE_CONNECTIONS, {
          color: "#77ff88",
          lineWidth: 2
        });
        drawPkg.drawLandmarks(ctx, results.poseLandmarks, {
          color: "#bbffcc",
          lineWidth: 1,
          radius: 2
        });
      }

      const evaluated = evaluatePosture({
        baseline: baselineRef.current,
        current: posture,
        sensitivity: sensitivityRef.current,
        thresholds: DEFAULT_THRESHOLDS
      });
      setStatus(evaluated.status);
      setMetrics({
        turtle: evaluated.results.isTurtleNeck,
        slouch: evaluated.results.isSlouching,
        textNeck: evaluated.results.isTextNeck
      });

      if (evaluated.status === "BAD") {
        if (!badPostureStartTimeRef.current) {
          badPostureStartTimeRef.current = now;
        } else if (now - badPostureStartTimeRef.current >= DEBOUNCE_MS) {
          void ensureAudio().then(() => {
            playAlarmIfNeeded();
          });
        }
      } else {
        resetAlertState();
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

      await ensureAudio();
      await ensurePose();

      setRunning(true);
      runningRef.current = true;
      resetAlertState();
      trackEvent("demo_start", { locale });

      rafRef.current = requestAnimationFrame(() => {
        void tick();
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start camera");
      runningRef.current = false;
      setRunning(false);
    }
  }

  function stop() {
    setRunning(false);
    runningRef.current = false;
    baselineRef.current = null;
    baselineRequestedRef.current = false;

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
    resetAlertState();
  }

  function setBaseline() {
    if (!running) return;
    baselineRequestedRef.current = true;
    trackEvent("demo_baseline_set", { locale });
  }

  function updateSensitivity(next: number) {
    const clamped = Math.max(0, Math.min(100, next));
    setSensitivity(clamped);
    sensitivityRef.current = clamped;
  }

  function toggleLowPower(next: boolean) {
    lowPowerRef.current = next;
    setLowPower(next);
  }

  function updateVolume(next: number) {
    const clamped = Math.max(0, Math.min(100, next));
    setVolume(clamped);

    if (audioDestinationRef.current) {
      audioDestinationRef.current.gain.value = clamped / 100;
    }
  }

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        badPostureStartTimeRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

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
          <video
            ref={videoRef}
            playsInline
            muted
            style={{ opacity: lowPower || !isCameraVisible ? 0 : 1 }}
          />
          <canvas ref={canvasRef} style={{ opacity: lowPower ? 0 : 1 }} />
        </div>

        <div className="stats-card">
          <p>
            {t.status}: <strong className={status === "BAD" ? "bad" : "good"}>{status === "BAD" ? t.bad : t.normal}</strong>
          </p>
          <p>
            {t.fps}: <strong>{fps}</strong>
          </p>
          <p>
            {t.lowPower}: <strong>{lowPower ? t.on : t.off}</strong>
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
            onChange={(e) => updateSensitivity(Number(e.target.value))}
          />

          <label htmlFor="volume">{t.volume}</label>
          <input
            id="volume"
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => updateVolume(Number(e.target.value))}
          />

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={isCameraVisible}
              onChange={(e) => setIsCameraVisible(e.target.checked)}
              disabled={lowPower}
            />
            {t.showCamera}
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={lowPower}
              onChange={(e) => toggleLowPower(e.target.checked)}
            />
            {t.lowPower}
          </label>
        </div>
      </div>
    </div>
  );
}
