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
        this.isVisualAlertEnabled = true;
        this.isSoundAlertEnabled = false;
        this.lastVisualAlertAt = 0;
        this.isVisualAlertVisible = false;
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
            this.view.updateStatus("status.calibrating", "blue");
            this.view.updateCalibrationProgress?.(
                0,
                "calibration.keepShouldersFace"
            );
            this.loop();
        } catch (error) {
            console.error("Failed to start monitoring:", error);
            this.view.updateStatus("status.cameraError", "red");
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
        this.view.updateStatus("status.stopped", "gray");
        this.badPostureStartTime = null;
        this.shouldCaptureBaseline = false;
        this.calibrationStartTime = null;
        this.lastCalibrationProgress = -1;
        this.lastFrameTime = 0;
        this.lastVisualAlertAt = 0;
        this.noUserStatusShown = false;
        this.view.clearCalibrationProgress?.();
        if (this.isVisualAlertVisible) {
            this.view.clearVisualAlert?.();
            this.isVisualAlertVisible = false;
        }
    }

    setVisualAlertEnabled(enabled) {
        this.isVisualAlertEnabled = Boolean(enabled);
        if (!this.isVisualAlertEnabled) {
            this.lastVisualAlertAt = 0;
            if (this.isVisualAlertVisible) {
                this.view.clearVisualAlert?.();
                this.isVisualAlertVisible = false;
            }
        }
    }

    setSoundAlertEnabled(enabled) {
        this.isSoundAlertEnabled = Boolean(enabled);
        if (!this.isSoundAlertEnabled) {
            this.audioAdapter.resetCooldown();
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
        this.view.updateStatus("status.calibrating", "blue");
        this.view.updateCalibrationProgress?.(
            0,
            "calibration.recalibratingHold"
        );
    }

    onPoseDetected(landmarks) {
        if (!this.isMonitoring) return;

        if (!Array.isArray(landmarks) || landmarks.length === 0) {
            if (!this.noUserStatusShown) {
                this.view.updateStatus("status.noUserDetected", "gray");
                this.noUserStatusShown = true;
            }
            if (this.shouldCaptureBaseline) {
                this.calibrationStartTime = null;
                this.lastCalibrationProgress = -1;
                this.view.updateCalibrationProgress?.(
                    0,
                    "calibration.noUserKeepShoulders"
                );
            }
            this.badPostureStartTime = null;
            this.lastVisualAlertAt = 0;
            this.audioAdapter.resetCooldown();
            if (this.isVisualAlertVisible) {
                this.view.clearVisualAlert?.();
                this.isVisualAlertVisible = false;
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
                this.view.updateStatus("status.calibrating", "blue");
                this.view.updateCalibrationProgress?.(
                    0,
                    "calibration.keepFullFaceShoulders"
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
                        ? "calibration.holdPosture"
                        : "calibration.applyingBaseline"
                );
            }

            this.view.updateStatus("status.calibrating", "blue");
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
                this.view.updateStatus("status.monitoring", "green");
            } else {
                this.view.updateCalibrationProgress?.(
                    0,
                    "calibration.failedRetry"
                );
            }
            return;
        }

        if (wasNoUser) {
            this.view.updateStatus("status.monitoring", "green");
        }

        const evaluation = this.evaluator.evaluate(currentPosture);

        this.view.render(currentPosture, evaluation);

        if (evaluation.status === 'BAD') {
            if (!this.badPostureStartTime) {
                this.badPostureStartTime = Date.now();
            } else {
                const duration = Date.now() - this.badPostureStartTime;
                if (duration >= MONITORING_CONFIG.DEBOUNCE_TIME) {
                    if (this.isVisualAlertEnabled) {
                        const now = Date.now();
                        if (now - this.lastVisualAlertAt >= SOUND_CONFIG.COOLDOWN_MS) {
                            this.lastVisualAlertAt = now;
                            this.view.triggerVisualAlert?.();
                            this.isVisualAlertVisible = true;
                        }
                    }
                    if (this.isSoundAlertEnabled) {
                        this.audioAdapter.playTap();
                    }
                }
            }
        } else {
            this.badPostureStartTime = null;
            this.lastVisualAlertAt = 0;
            this.audioAdapter.resetCooldown();
            if (this.isVisualAlertVisible) {
                this.view.clearVisualAlert?.();
                this.isVisualAlertVisible = false;
            }
        }
    }
}
