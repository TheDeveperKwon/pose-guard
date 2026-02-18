export const MONITORING_CONFIG = {
  DEBOUNCE_TIME: 2000,
  FRAME_INTERVAL: 200
};

export const SOUND_CONFIG = {
  VOLUME: 60,
  COOLDOWN_MS: 1500
};

export const ALERT_TONE_PATTERN = [
  {
    freq: 540,
    durationMs: 260,
    attackMs: 14,
    releaseMs: 160,
    type: "sine",
    gainScale: 1.0
  },
  {
    freq: 810,
    durationMs: 220,
    attackMs: 14,
    releaseMs: 140,
    type: "sine",
    gainScale: 0.22,
    startDelayMs: 10
  },
  {
    freq: 540,
    durationMs: 260,
    attackMs: 14,
    releaseMs: 160,
    type: "sine",
    gainScale: 0.9,
    startDelayMs: 190
  },
  {
    freq: 810,
    durationMs: 220,
    attackMs: 14,
    releaseMs: 140,
    type: "sine",
    gainScale: 0.2,
    startDelayMs: 200
  }
];
