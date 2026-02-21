import { Posture } from '../domain/Posture.js';
import { MONITORING_CONFIG, SOUND_CONFIG } from '../config/constants.js';

const CALIBRATION_DURATION_MS = 1800;

export class MonitorService {
    constructor(cameraAdapter, mediaPipeAdapter, audioAdapter, evaluator, view) {
        this.cameraAdapter = cameraAdapter;
        this.mediaPipeAdapter = mediaPipeAdapter;
        this.audioAdapter = audioAdapter;
        this.evaluator = evaluator;
        this.view = view;

        this.isMonitoring = false;
        this.badPostureStartTime = null; // Timestamp when bad posture started
        this.lastFrameTime = 0; // For frame rate throttling if needed
        this.shouldCaptureBaseline = false;
        this.isMannerMode = false;
        this.lastMannerAlertAt = 0;
        this.isMannerAlertVisible = false;
        this.noUserStatusShown = false;
        this.calibrationStartTime = null;
        this.lastCalibrationProgress = -1;

        // Bind the callback for MediaPipe results
        this.mediaPipeAdapter.setCallback(this.onPoseDetected.bind(this));
    }

    async start() {
        if (this.isMonitoring) return;
        
        try {
            if (typeof this.mediaPipeAdapter.init === "function") {
                await this.mediaPipeAdapter.init();
            }
            await this.cameraAdapter.start();
            this.isMonitoring = true;
            this.shouldCaptureBaseline = true;
            this.noUserStatusShown = false;
            this.calibrationStartTime = null;
            this.lastCalibrationProgress = -1;
            this.view.updateStatus("Calibrating...", "blue");
            this.view.updateCalibrationProgress?.(
                0,
                "Keep your shoulders and face in frame"
            );
            this.loop();
        } catch (error) {
            console.error("Failed to start monitoring:", error);
            this.view.updateStatus("Camera Error", "red");
            this.isMonitoring = false;
            this.badPostureStartTime = null;
            this.shouldCaptureBaseline = false;
            this.calibrationStartTime = null;
            this.lastCalibrationProgress = -1;
            throw error;
        }
    }

    stop() {
        this.isMonitoring = false;
        this.cameraAdapter.stop();
        this.view.updateStatus("Stopped", "gray");
        this.badPostureStartTime = null;
        this.shouldCaptureBaseline = false;
        this.calibrationStartTime = null;
        this.lastCalibrationProgress = -1;
        this.lastFrameTime = 0;
        this.lastMannerAlertAt = 0;
        this.noUserStatusShown = false;
        this.view.clearCalibrationProgress?.();
        if (this.isMannerAlertVisible) {
            this.view.clearMannerAlert?.();
            this.isMannerAlertVisible = false;
        }
    }

    setMannerMode(enabled) {
        this.isMannerMode = Boolean(enabled);
        if (!this.isMannerMode) {
            this.lastMannerAlertAt = 0;
            if (this.isMannerAlertVisible) {
                this.view.clearMannerAlert?.();
                this.isMannerAlertVisible = false;
            }
        }
    }

    async loop() {
        if (!this.isMonitoring) return;

        // Send video frame to MediaPipe on each animation tick.
        requestAnimationFrame(async () => {
            const now = Date.now();
            if (now - this.lastFrameTime >= MONITORING_CONFIG.FRAME_INTERVAL) {
                try {
                    await this.mediaPipeAdapter.send(this.cameraAdapter.videoElement);
                    this.lastFrameTime = now;
                } catch (error) {
                    // Keep the monitoring loop alive even if one frame fails.
                    console.error("Pose processing failed:", error);
                }
            }
            this.loop();
        });
    }

    setBaseline() {
        // Capture baseline from the next available pose result.
        this.shouldCaptureBaseline = true;
        this.calibrationStartTime = null;
        this.lastCalibrationProgress = -1;
        this.view.updateStatus("Calibrating...", "blue");
        this.view.updateCalibrationProgress?.(
            0,
            "Recalibrating... hold steady for a moment"
        );
    }

    onPoseDetected(landmarks) {
        if (!this.isMonitoring) return;

        if (!Array.isArray(landmarks) || landmarks.length === 0) {
            if (!this.noUserStatusShown) {
                this.view.updateStatus("No User Detected", "gray");
                this.noUserStatusShown = true;
            }
            if (this.shouldCaptureBaseline) {
                this.calibrationStartTime = null;
                this.lastCalibrationProgress = -1;
                this.view.updateCalibrationProgress?.(
                    0,
                    "No user detected. Face the camera with shoulders visible"
                );
            }
            this.badPostureStartTime = null;
            this.lastMannerAlertAt = 0;
            this.audioAdapter.resetCooldown();
            if (this.isMannerAlertVisible) {
                this.view.clearMannerAlert?.();
                this.isMannerAlertVisible = false;
            }
            this.view.render(null, null);
            return;
        }

        const wasNoUser = this.noUserStatusShown;
        this.noUserStatusShown = false;
        const currentPosture = new Posture(landmarks);

        if (this.shouldCaptureBaseline) {
            const sample = currentPosture.getSample();
            if (!sample) {
                this.calibrationStartTime = null;
                this.lastCalibrationProgress = -1;
                this.view.updateStatus("Calibrating...", "blue");
                this.view.updateCalibrationProgress?.(
                    0,
                    "Keep your full face and shoulders in frame"
                );
                this.view.render(null, null);
                return;
            }

            if (!this.calibrationStartTime) {
                this.calibrationStartTime = Date.now();
            }

            const elapsed = Date.now() - this.calibrationStartTime;
            const progress = Math.min(
                100,
                Math.round((elapsed / CALIBRATION_DURATION_MS) * 100)
            );

            if (progress !== this.lastCalibrationProgress) {
                this.lastCalibrationProgress = progress;
                this.view.updateCalibrationProgress?.(
                    progress,
                    progress < 100
                        ? "Calibrating... hold your posture"
                        : "Applying baseline..."
                );
            }

            this.view.updateStatus("Calibrating...", "blue");
            this.view.render(null, null);

            if (elapsed < CALIBRATION_DURATION_MS) {
                return;
            }

            const updated = this.evaluator.updateBaseline(sample);
            this.calibrationStartTime = null;
            this.lastCalibrationProgress = -1;

            if (updated) {
                this.shouldCaptureBaseline = false;
                this.view.clearCalibrationProgress?.();
                this.view.updateStatus("Monitoring", "green");
            } else {
                this.view.updateCalibrationProgress?.(
                    0,
                    "Calibration failed. Keep shoulders visible and retry"
                );
            }
            return;
        }

        if (wasNoUser) {
            this.view.updateStatus("Monitoring", "green");
        }

        const evaluation = this.evaluator.evaluate(currentPosture);

        this.view.render(currentPosture, evaluation);

        if (evaluation.status === 'BAD') {
            if (!this.badPostureStartTime) {
                this.badPostureStartTime = Date.now();
            } else {
                const duration = Date.now() - this.badPostureStartTime;
                if (duration >= MONITORING_CONFIG.DEBOUNCE_TIME) {
                    if (this.isMannerMode) {
                        const now = Date.now();
                        if (now - this.lastMannerAlertAt >= SOUND_CONFIG.COOLDOWN_MS) {
                            this.lastMannerAlertAt = now;
                            this.view.triggerMannerAlert?.();
                            this.isMannerAlertVisible = true;
                        }
                    } else {
                        this.audioAdapter.playTap();
                    }
                }
            }
        } else {
            this.badPostureStartTime = null;
            this.lastMannerAlertAt = 0;
            this.audioAdapter.resetCooldown();
            if (this.isMannerAlertVisible) {
                this.view.clearMannerAlert?.();
                this.isMannerAlertVisible = false;
            }
        }
    }
}
