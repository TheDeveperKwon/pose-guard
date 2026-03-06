"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import { DOWNLOAD_URLS } from "@/lib/downloads";
import {
  DEFAULT_THRESHOLDS,
  evaluatePosture,
  extractPostureSample,
  type PostureSample
} from "@shared/posture/index.js";
import {
  ALERT_TONE_PATTERN,
  MONITORING_CONFIG,
  SOUND_CONFIG
} from "@shared/policy/index.js";

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

type SupportedPlatform = "mac" | "win" | "unknown";

const FRAME_INTERVAL = MONITORING_CONFIG.FRAME_INTERVAL;
const DEBOUNCE_MS = MONITORING_CONFIG.DEBOUNCE_TIME;
const ALARM_COOLDOWN_MS = SOUND_CONFIG.COOLDOWN_MS;
const DEFAULT_VOLUME = SOUND_CONFIG.VOLUME;
const MEDIAPIPE_POSE_CDN_VERSION = "0.5.1675469404";
const BASELINE_CAPTURE_DURATION_MS = 1800;
const BASELINE_CAPTURE_SAMPLE_GRACE_MS = 1000;
const BASELINE_CAPTURE_TIMEOUT_MS = 12000;
const INSTALL_CTA_DELAY_MS = 20000;
const NORMAL_METRICS: Metrics = { turtle: false, slouch: false, textNeck: false };

function areMetricsEqual(left: Metrics, right: Metrics) {
  return (
    left.turtle === right.turtle &&
    left.slouch === right.slouch &&
    left.textNeck === right.textNeck
  );
}

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
  for (const tone of ALERT_TONE_PATTERN) {
    scheduleTone(audioContext, destination, tone);
  }
}

function isLikelyWebglError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("webgl") || normalized.includes("loadgraph");
}

function detectPlatform(): SupportedPlatform {
  if (typeof navigator === "undefined") return "unknown";
  const agent = `${navigator.userAgent} ${navigator.platform}`.toLowerCase();
  if (agent.includes("win")) return "win";
  if (agent.includes("mac")) return "mac";
  return "unknown";
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
  const pendingFirstStartRef = useRef(false);
  const startInFlightRef = useRef(false);
  const baselineCaptureStartRef = useRef<number | null>(null);
  const baselineLastSampleRef = useRef<Baseline | null>(null);
  const baselineLastSampleAtRef = useRef(0);
  const baselineRequestStartAtRef = useRef<number | null>(null);
  const initialBootCalibrationRef = useRef(false);
  const installCtaTimerRef = useRef<number | null>(null);
  const installCtaViewTrackedRef = useRef(false);

  const [running, setRunning] = useState(false);
  const [isDemoVisible, setIsDemoVisible] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
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
  const [baselineProgress, setBaselineProgress] = useState<number | null>(null);
  const [baselineTimedOut, setBaselineTimedOut] = useState(false);
  const [platform, setPlatform] = useState<SupportedPlatform>("unknown");
  const [isInstallCtaRaised, setIsInstallCtaRaised] = useState(false);

  const t = useMemo(
    () =>
      locale === "ko"
        ? {
            start: "데모 시작",
            stop: "데모 중지",
            baseline: "기준 자세 다시 설정",
            status: "상태",
            normal: "정상",
            bad: "경고",
            statusGuideGood: "좋아요. 지금 자세를 유지해보세요.",
            statusGuideBad: "자세가 무너졌습니다. 어깨와 목을 곧게 펴주세요.",
            sensitivity: "민감도",
            volume: "경고음 크기",
            showCamera: "카메라 표시",
            fps: "처리 FPS",
            lowPower: "저전력 모드",
            advancedSettings: "고급 설정",
            metrics: "세부 지표",
            camHint: "브라우저 카메라 권한을 허용하세요.",
            introGuide: "바른 자세를 유지하고 데모를 시작해주세요.",
            introStart: "데모 시작",
            introBooting: "바른 자세를 유지해주세요. 데모를 준비하고 있습니다.",
            cancel: "취소",
            baselineCalibrating: "기준 자세 설정 중... 바른 자세를 유지해주세요.",
            baselineTimeoutTitle: "기준 자세를 잡지 못했습니다.",
            baselineTimeoutBody:
              "정면으로 앉아 어깨가 보이게 한 뒤 다시 시도해 주세요.",
            baselineRetry: "기준 자세 다시 시도",
            requestingCamera: "카메라 권한을 요청하는 중...",
            cameraDenied: "카메라 권한이 거부되었습니다. 브라우저에서 카메라 권한을 허용해 주세요.",
            cameraNotFound: "사용 가능한 카메라를 찾지 못했습니다. 장치 연결 상태를 확인해 주세요.",
            cameraBusy:
              "카메라가 다른 앱에서 사용 중입니다. 다른 앱을 종료하고 다시 시도해 주세요.",
            webglFailed:
              "WebGL 초기화에 실패했습니다. Chrome 기준: 설정 > 시스템 > '가능한 경우 그래픽 가속 사용'을 켜고 브라우저를 다시 시작해 주세요.",
            installKicker: "정식 버전",
            installTitle: "데스크톱 앱에서 실사용 모니터링을 시작하세요",
            installBody:
              "백그라운드 작동, 무음 화면 알림, 리소스 최적화 기능을 사용할 수 있습니다.",
            installFeatureBackground: "백그라운드 작동",
            installFeatureSilent: "무음 화면 알림",
            installFeatureOptimized: "리소스 최적화",
            installMac: "macOS 다운로드",
            installWin: "Windows 다운로드",
            installNow: "지금 설치",
            installChooseOs: "OS 선택해서 설치",
            installMore: "다른 OS 다운로드 보기",
            on: "On",
            off: "Off"
          }
        : {
            start: "Start Demo",
            stop: "Stop Demo",
            baseline: "Recalibrate baseline",
            status: "Status",
            normal: "Normal",
            bad: "Warning",
            statusGuideGood: "Good posture. Keep this position.",
            statusGuideBad: "Posture dropped. Straighten your neck and shoulders.",
            sensitivity: "Sensitivity",
            volume: "Alert volume",
            showCamera: "Show camera",
            fps: "Processing FPS",
            lowPower: "Low-power mode",
            advancedSettings: "Advanced settings",
            metrics: "Detailed metrics",
            camHint: "Allow camera access in your browser.",
            introGuide: "Maintain an upright posture, then start the demo.",
            introStart: "Start Demo",
            introBooting: "Keep an upright posture. Preparing the demo...",
            cancel: "Cancel",
            baselineCalibrating: "Calibrating baseline... keep an upright posture.",
            baselineTimeoutTitle: "Could not capture your baseline posture.",
            baselineTimeoutBody:
              "Sit facing the camera with both shoulders visible, then try again.",
            baselineRetry: "Retry baseline setup",
            requestingCamera: "Requesting camera permission...",
            cameraDenied:
              "Camera permission was denied. Allow camera access in your browser settings.",
            cameraNotFound:
              "No camera was found. Check your camera device connection and try again.",
            cameraBusy:
              "Your camera is being used by another app. Close it and try again.",
            webglFailed:
              "WebGL initialization failed. In Chrome: Settings > System > enable 'Use hardware acceleration when available', then restart the browser.",
            installKicker: "Full version",
            installTitle: "Start full monitoring with the desktop app",
            installBody:
              "Get background operation, silent visual alerts, and better resource optimization.",
            installFeatureBackground: "Background operation",
            installFeatureSilent: "Silent visual alerts",
            installFeatureOptimized: "Resource optimization",
            installMac: "Download macOS",
            installWin: "Download Windows",
            installNow: "Install now",
            installChooseOs: "Choose OS to install",
            installMore: "See other OS downloads",
            on: "On",
            off: "Off"
          },
    [locale]
  );

  const isKnownPlatform = platform !== "unknown";
  const primaryPlatform: Exclude<SupportedPlatform, "unknown"> =
    platform === "win" ? "win" : "mac";
  const primaryHref =
    isKnownPlatform
      ? primaryPlatform === "mac"
        ? DOWNLOAD_URLS.mac
        : DOWNLOAD_URLS.win
      : `/${locale}/download`;
  const primaryLabel =
    isKnownPlatform
      ? primaryPlatform === "mac"
        ? `${t.installNow} · macOS`
        : `${t.installNow} · Windows`
      : t.installChooseOs;

  function resolveStartErrorMessage(error: unknown) {
    if (error instanceof DOMException) {
      if (error.name === "NotAllowedError" || error.name === "SecurityError") {
        return t.cameraDenied;
      }
      if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
        return t.cameraNotFound;
      }
      if (error.name === "NotReadableError") {
        return t.cameraBusy;
      }
      return error.message || "Failed to start camera";
    }

    if (error instanceof Error) return error.message || "Failed to start camera";
    return "Failed to start camera";
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

  function resetAlertState() {
    badPostureStartTimeRef.current = null;
    lastAlertAtRef.current = 0;
  }

  function resetBaselineCaptureState() {
    baselineCaptureStartRef.current = null;
    baselineLastSampleRef.current = null;
    baselineLastSampleAtRef.current = 0;
  }

  function syncStatusAndMetrics(nextStatus: "NORMAL" | "BAD", nextMetrics: Metrics) {
    setStatus((prev) => (prev === nextStatus ? prev : nextStatus));
    setMetrics((prev) => (areMetricsEqual(prev, nextMetrics) ? prev : nextMetrics));
  }

  function failBaselineCapture(phase: "boot" | "manual") {
    baselineRequestedRef.current = false;
    baselineRequestStartAtRef.current = null;
    resetBaselineCaptureState();
    setBaselineProgress(null);
    setBaselineTimedOut(true);

    if (initialBootCalibrationRef.current) {
      initialBootCalibrationRef.current = false;
      setIsBooting(false);
      setBootProgress(0);
    }

    trackEvent("demo_baseline_timeout", { locale, phase });
  }

  function hasBaselineCaptureTimedOut(now: number) {
    if (!baselineRequestedRef.current) return false;
    if (!baselineRequestStartAtRef.current) return false;
    if (now - baselineRequestStartAtRef.current < BASELINE_CAPTURE_TIMEOUT_MS) return false;

    failBaselineCapture(initialBootCalibrationRef.current ? "boot" : "manual");
    return true;
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
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${MEDIAPIPE_POSE_CDN_VERSION}/${file}`
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

      if (hasBaselineCaptureTimedOut(now)) {
        syncStatusAndMetrics("NORMAL", NORMAL_METRICS);
        resetAlertState();
        updateFps();
        return;
      }

      if (!results.poseLandmarks) {
        syncStatusAndMetrics("NORMAL", NORMAL_METRICS);
        if (baselineRequestedRef.current) {
          const now = Date.now();
          const hasRecentSample =
            Boolean(baselineLastSampleRef.current) &&
            now - baselineLastSampleAtRef.current <= BASELINE_CAPTURE_SAMPLE_GRACE_MS;
          if (!hasRecentSample) {
            resetBaselineCaptureState();
            if (initialBootCalibrationRef.current) {
              setBootProgress(80);
            } else {
              setBaselineProgress(0);
            }
          }
        }
        resetAlertState();
        updateFps();
        return;
      }

      const posture = extractPostureSample(results.poseLandmarks);
      if (!posture) {
        syncStatusAndMetrics("NORMAL", NORMAL_METRICS);
        if (baselineRequestedRef.current) {
          const now = Date.now();
          const hasRecentSample =
            Boolean(baselineLastSampleRef.current) &&
            now - baselineLastSampleAtRef.current <= BASELINE_CAPTURE_SAMPLE_GRACE_MS;
          if (!hasRecentSample) {
            resetBaselineCaptureState();
            if (initialBootCalibrationRef.current) {
              setBootProgress(80);
            } else {
              setBaselineProgress(0);
            }
          }
        }
        resetAlertState();
        updateFps();
        return;
      }

      if (baselineRequestedRef.current) {
        const now = Date.now();
        baselineLastSampleRef.current = posture;
        baselineLastSampleAtRef.current = now;
        if (!baselineCaptureStartRef.current) {
          baselineCaptureStartRef.current = now;
        }

        const elapsed = now - baselineCaptureStartRef.current;
        const progress = Math.min(
          100,
          Math.round((elapsed / BASELINE_CAPTURE_DURATION_MS) * 100)
        );
        if (initialBootCalibrationRef.current) {
          const bootPhaseProgress = Math.min(99, 80 + Math.round(progress * 0.2));
          setBootProgress(bootPhaseProgress);
        } else {
          setBaselineProgress(progress);
        }

        if (elapsed >= BASELINE_CAPTURE_DURATION_MS) {
          baselineRef.current = baselineLastSampleRef.current;
          baselineRequestedRef.current = false;
          baselineRequestStartAtRef.current = null;
          resetBaselineCaptureState();
          setBaselineTimedOut(false);
          if (initialBootCalibrationRef.current) {
            initialBootCalibrationRef.current = false;
            setBootProgress(100);
            setIsBooting(false);
            setBaselineProgress(null);
          } else {
            setBaselineProgress(null);
          }
        }
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
      syncStatusAndMetrics(evaluated.status, {
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
      try {
        await poseRef.current.send({ image: video });
        lastFrameRef.current = now;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (isLikelyWebglError(message)) {
          setError(t.webglFailed);
          stop();
          return;
        }
        setError(message || "Failed to process camera frame");
        stop();
        return;
      }
    }

    rafRef.current = requestAnimationFrame(() => {
      void tick();
    });
  }

  async function start() {
    if (runningRef.current || startInFlightRef.current) return;
    startInFlightRef.current = true;
    setIsStarting(true);
    setBootProgress(20);
    runningRef.current = true;
    setError("");
    setBaselineTimedOut(false);

    try {
      if (!videoRef.current) {
        runningRef.current = false;
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      setBootProgress(50);
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      await ensureAudio();
      await ensurePose();
      initialBootCalibrationRef.current = true;
      setBootProgress(80);
      baselineRequestedRef.current = true;
      baselineRequestStartAtRef.current = Date.now();
      resetBaselineCaptureState();
      setBaselineProgress(null);

      setRunning(true);
      resetAlertState();
      trackEvent("demo_start", { locale });

      rafRef.current = requestAnimationFrame(() => {
        void tick();
      });
    } catch (e) {
      const message = resolveStartErrorMessage(e);
      setError(isLikelyWebglError(message) ? t.webglFailed : message);
      runningRef.current = false;
      setRunning(false);
      initialBootCalibrationRef.current = false;
      baselineRequestStartAtRef.current = null;
      setBaselineTimedOut(false);
      setIsBooting(false);
      setBootProgress(0);
      setIsDemoVisible(false);
    } finally {
      startInFlightRef.current = false;
      setIsStarting(false);
    }
  }

  function stop() {
    startInFlightRef.current = false;
    setIsStarting(false);
    setRunning(false);
    runningRef.current = false;
    baselineRef.current = null;
    baselineRequestedRef.current = false;
    baselineRequestStartAtRef.current = null;
    initialBootCalibrationRef.current = false;
    resetBaselineCaptureState();
    setBaselineProgress(null);
    setBaselineTimedOut(false);
    setIsInstallCtaRaised(false);

    if (installCtaTimerRef.current !== null) {
      window.clearTimeout(installCtaTimerRef.current);
      installCtaTimerRef.current = null;
    }

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

    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
      audioDestinationRef.current = null;
    }

    setFps(0);
    syncStatusAndMetrics("NORMAL", NORMAL_METRICS);
    resetAlertState();
  }

  function trackDownloadClick(downloadPlatform: SupportedPlatform, source: string) {
    trackEvent("download_click", {
      platform:
        downloadPlatform === "mac"
          ? "macos"
          : downloadPlatform === "win"
            ? "windows"
            : "unknown",
      locale,
      source
    });
  }

  function setBaseline() {
    if (!running) return;
    initialBootCalibrationRef.current = false;
    baselineRequestedRef.current = true;
    baselineRequestStartAtRef.current = Date.now();
    resetBaselineCaptureState();
    setBaselineProgress(0);
    setBaselineTimedOut(false);
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

  function revealDemoAndStart() {
    if (isDemoVisible) return;
    pendingFirstStartRef.current = true;
    setError("");
    setBaselineTimedOut(false);
    setBootProgress(10);
    setIsBooting(true);
    setIsDemoVisible(true);
    trackEvent("demo_entry_start_click", { locale, source: "demo-prestart" });
  }

  function stopDemoAndReturnToStart(source: "runtime" | "boot") {
    stop();
    setIsBooting(false);
    setBootProgress(0);
    setIsDemoVisible(false);
    setError("");
    trackEvent("demo_stop", { locale, source });
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

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  useEffect(() => {
    if (isDemoVisible && pendingFirstStartRef.current) {
      pendingFirstStartRef.current = false;
      void start();
    }
  }, [isDemoVisible]);

  useEffect(() => {
    if (!running) {
      if (installCtaTimerRef.current !== null) {
        window.clearTimeout(installCtaTimerRef.current);
        installCtaTimerRef.current = null;
      }
      return;
    }

    installCtaViewTrackedRef.current = false;
    setIsInstallCtaRaised(false);
    installCtaTimerRef.current = window.setTimeout(() => {
      setIsInstallCtaRaised(true);
      if (!installCtaViewTrackedRef.current) {
        installCtaViewTrackedRef.current = true;
        trackEvent("demo_install_cta_view", {
          locale,
          source: "demo-runtime"
        });
      }
    }, INSTALL_CTA_DELAY_MS);

    return () => {
      if (installCtaTimerRef.current !== null) {
        window.clearTimeout(installCtaTimerRef.current);
        installCtaTimerRef.current = null;
      }
    };
  }, [running, locale]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return (
    <div className="demo-shell">
      {!isDemoVisible ? (
        <div className="demo-prestart">
          <p className="demo-prestart-message">{t.introGuide}</p>
          <button className="btn btn-primary demo-monitor-toggle" onClick={revealDemoAndStart} disabled={isStarting}>
            {isStarting ? t.requestingCamera : t.introStart}
          </button>
          {error ? <p className="error">{error}</p> : null}
        </div>
      ) : null}

      {isDemoVisible && isBooting ? (
        <div className="demo-booting">
          <p className="demo-booting-message">{t.introBooting}</p>
          <div className="demo-loading-track" aria-hidden="true">
            <div className="demo-loading-fill" style={{ width: `${bootProgress}%` }} />
          </div>
          <button
            className="btn demo-boot-cancel"
            onClick={() => stopDemoAndReturnToStart("boot")}
          >
            {t.cancel}
          </button>
          {error ? <p className="error">{error}</p> : null}
        </div>
      ) : null}

      {isDemoVisible ? (
        <div className={`demo-runtime${isBooting ? " is-hidden" : ""}`}>
          <div className="demo-grid">
            <div className="video-panel">
              <div className="video-stage">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  style={{ opacity: lowPower || !isCameraVisible ? 0 : 1 }}
                />
                <canvas ref={canvasRef} style={{ opacity: lowPower ? 0 : 1 }} />
                {isStarting && !running ? (
                  <p className="video-stage-hint">{t.requestingCamera}</p>
                ) : null}
              </div>
              <p className="muted demo-inline-note">{t.camHint}</p>
            </div>

            <div className="stats-card">
              <div className="demo-toolbar">
                <button
                  className={`btn btn-primary demo-monitor-toggle${running ? " is-stop" : ""}`}
                  onClick={() => {
                    if (running) {
                      stopDemoAndReturnToStart("runtime");
                      return;
                    }
                    void start();
                  }}
                  disabled={isStarting}
                >
                  {isStarting ? t.requestingCamera : running ? t.stop : t.start}
                </button>
              </div>

              <section className={`demo-status-card${status === "BAD" ? " is-bad" : " is-good"}`}>
                <p className="demo-status-label">{t.status}</p>
                <p className="demo-status-value">{status === "BAD" ? t.bad : t.normal}</p>
                <p className="demo-status-guide">
                  {status === "BAD" ? t.statusGuideBad : t.statusGuideGood}
                </p>
              </section>

              {error ? <p className="error demo-inline-note">{error}</p> : null}
              {baselineProgress !== null ? (
                <p className="muted demo-inline-note">
                  {t.baselineCalibrating} ({baselineProgress}%)
                </p>
              ) : null}
              {baselineTimedOut ? (
                <section className="demo-baseline-warning">
                  <p className="demo-baseline-warning-title">{t.baselineTimeoutTitle}</p>
                  <p className="muted demo-baseline-warning-body">{t.baselineTimeoutBody}</p>
                  <button
                    className="btn demo-advanced-baseline"
                    onClick={setBaseline}
                    disabled={!running || isStarting}
                  >
                    {t.baselineRetry}
                  </button>
                </section>
              ) : null}

              {isInstallCtaRaised ? (
                <article className="demo-install-card is-raised">
                  <p className="demo-install-kicker">{t.installKicker}</p>
                  <h3>{t.installTitle}</h3>
                  <p className="muted demo-install-body">{t.installBody}</p>
                  <ul className="demo-install-pills">
                    <li>{t.installFeatureBackground}</li>
                    <li>{t.installFeatureSilent}</li>
                    <li>{t.installFeatureOptimized}</li>
                  </ul>
                  <div className="demo-install-actions">
                    <a
                      className="btn btn-primary"
                      href={primaryHref}
                      onClick={() =>
                        trackDownloadClick(
                          isKnownPlatform ? primaryPlatform : "unknown",
                          "demo-runtime-install-primary"
                        )
                      }
                    >
                      {primaryLabel}
                    </a>
                    <a
                      className="demo-install-more-link"
                      href={`/${locale}/download`}
                      onClick={() =>
                        trackEvent("download_click", {
                          platform: "multi",
                          locale,
                          source: "demo-runtime-install-more-options"
                        })
                      }
                    >
                      {t.installMore}
                    </a>
                  </div>
                </article>
              ) : null}

              <details className="demo-advanced">
                <summary>{t.advancedSettings}</summary>
                <div className="demo-advanced-body">
                  <button
                    className="btn demo-advanced-baseline"
                    onClick={setBaseline}
                    disabled={!running || isStarting}
                  >
                    {t.baseline}
                  </button>

                  <p className="muted demo-advanced-meta">
                    {t.fps}: <strong>{fps}</strong>
                  </p>
                  <p className="muted demo-advanced-meta">
                    {t.lowPower}: <strong>{lowPower ? t.on : t.off}</strong>
                  </p>

                  <p className="demo-advanced-metrics-title">{t.metrics}</p>
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
              </details>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
