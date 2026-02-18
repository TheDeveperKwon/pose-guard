export interface MonitoringConfig {
  DEBOUNCE_TIME: number;
  FRAME_INTERVAL: number;
}

export interface SoundConfig {
  VOLUME: number;
  COOLDOWN_MS: number;
}

export interface AlertToneStep {
  freq: number;
  durationMs: number;
  attackMs?: number;
  releaseMs?: number;
  type?: "sine" | "square" | "sawtooth" | "triangle";
  gainScale?: number;
  startDelayMs?: number;
}

export const MONITORING_CONFIG: MonitoringConfig;
export const SOUND_CONFIG: SoundConfig;
export const ALERT_TONE_PATTERN: AlertToneStep[];
