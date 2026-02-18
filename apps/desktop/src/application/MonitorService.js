import { Posture } from '../domain/Posture.js';
import { MONITORING_CONFIG } from '../config/constants.js';

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
            this.view.updateStatus("Monitoring", "green");
            this.loop();
        } catch (error) {
            console.error("Failed to start monitoring:", error);
            this.view.updateStatus("Camera Error", "red");
            this.isMonitoring = false;
            this.badPostureStartTime = null;
            this.shouldCaptureBaseline = false;
            throw error;
        }
    }

    stop() {
        this.isMonitoring = false;
        this.cameraAdapter.stop();
        this.view.updateStatus("Stopped", "gray");
        this.badPostureStartTime = null;
        this.shouldCaptureBaseline = false;
        this.lastFrameTime = 0;
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
    }

    onPoseDetected(landmarks) {
        if (!this.isMonitoring) return;

        const currentPosture = new Posture(landmarks);

        if (this.shouldCaptureBaseline) {
            const updated = this.evaluator.updateBaseline(currentPosture);
            this.shouldCaptureBaseline = false;
            this.view.updateStatus(
                updated ? "Baseline Set" : "Baseline Invalid",
                updated ? "blue" : "red"
            );
        }

        const evaluation = this.evaluator.evaluate(currentPosture);

        this.view.render(currentPosture, evaluation);

        if (evaluation.status === 'BAD') {
            if (!this.badPostureStartTime) {
                this.badPostureStartTime = Date.now();
            } else {
                const duration = Date.now() - this.badPostureStartTime;
                if (duration >= MONITORING_CONFIG.DEBOUNCE_TIME) {
                    this.audioAdapter.playTap();
                }
            }
        } else {
            this.badPostureStartTime = null;
            this.audioAdapter.resetCooldown();
        }
    }
}
