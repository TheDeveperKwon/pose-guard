export interface MonitoringConfig {
  DEBOUNCE_TIME: number;
  FRAME_INTERVAL: number;
}

export interface SoundConfig {
  VOLUME: number;
  COOLDOWN_MS: number;
}

export const MONITORING_CONFIG: MonitoringConfig;
export const SOUND_CONFIG: SoundConfig;
