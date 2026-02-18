import { ALERT_TONE_PATTERN } from "../config/constants.js";

export class AudioAdapter {
    static audioContext = null;
    static masterGain = null;

    constructor(options = {}) {
        this.volume = typeof options.volume === "number" ? options.volume : 0.6;
        this.baseCooldownMs = options.cooldownMs || 10000;
        this.lastPlayedAt = { tap: 0 };
        this.isPlaying = false;

        this._ensureAudioGraph();
        this.setVolume(this.volume);
    }

    _ensureAudioGraph() {
        if (AudioAdapter.audioContext && AudioAdapter.masterGain) return;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        AudioAdapter.audioContext = new AudioCtx();
        AudioAdapter.masterGain = AudioAdapter.audioContext.createGain();
        AudioAdapter.masterGain.gain.value = 0.6;
        AudioAdapter.masterGain.connect(AudioAdapter.audioContext.destination);
    }

    async _resumeIfNeeded() {
        if (!AudioAdapter.audioContext) return;
        if (AudioAdapter.audioContext.state === "suspended") {
            try {
                await AudioAdapter.audioContext.resume();
            } catch (error) {
                console.warn("AudioContext resume failed:", error);
            }
        }
    }

    setVolume(v01) {
        const clamped = Math.max(0, Math.min(1, v01));
        this.volume = clamped;
        if (AudioAdapter.masterGain) {
            AudioAdapter.masterGain.gain.value = clamped;
        }
    }

    resetCooldown() {
        this.lastPlayedAt.tap = 0;
        this.isPlaying = false;
    }

    _canPlay(key, cooldownMs) {
        const now = Date.now();
        if (this.isPlaying) return false;
        if (now - this.lastPlayedAt[key] < cooldownMs) return false;
        this.lastPlayedAt[key] = now;
        return true;
    }

    _scheduleTone({ freq, durationMs, attackMs, releaseMs, type, gainScale, startDelayMs }) {
        if (!AudioAdapter.audioContext || !AudioAdapter.masterGain) return;

        const ctx = AudioAdapter.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = "bandpass";
        filter.frequency.value = 900;
        filter.Q.value = 0.65;

        osc.type = type || "sine";
        osc.frequency.value = freq;

        const now = ctx.currentTime;
        const attack = (attackMs || 20) / 1000;
        const release = (releaseMs || 260) / 1000;
        const duration = Math.max(0.12, (durationMs || 480) / 1000);
        const scale = typeof gainScale === "number" ? gainScale : 1.0;
        const startDelay = (startDelayMs || 0) / 1000;

        gain.gain.setValueAtTime(0.0001, now + startDelay);
        gain.gain.linearRampToValueAtTime(scale, now + startDelay + attack);
        gain.gain.setValueAtTime(scale, Math.max(now + startDelay + attack, now + startDelay + duration - release));
        gain.gain.linearRampToValueAtTime(0.0001, now + startDelay + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(AudioAdapter.masterGain);

        osc.start(now + startDelay);
        osc.stop(now + startDelay + duration + 0.02);
    }

    async playTap() {
        await this._resumeIfNeeded();
        if (!this._canPlay("tap", this.baseCooldownMs)) return;

        this.isPlaying = true;
        for (const tone of ALERT_TONE_PATTERN) {
            this._scheduleTone(tone);
        }

        const playbackMs = ALERT_TONE_PATTERN.reduce((max, tone) => {
            const delay = tone.startDelayMs || 0;
            const duration = tone.durationMs || 0;
            return Math.max(max, delay + duration);
        }, 0);

        setTimeout(() => {
            this.isPlaying = false;
        }, playbackMs + 80);
    }
}
