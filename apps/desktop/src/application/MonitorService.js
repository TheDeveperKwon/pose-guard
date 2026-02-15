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
        this.lastAlertLevel = null;
        this.lastFrameTime = 0; // For frame rate throttling if needed
        this.shouldCaptureBaseline = false;

        // Bind the callback for MediaPipe results
        this.mediaPipeAdapter.setCallback(this.onPoseDetected.bind(this));
    }

    async start() {
        if (this.isMonitoring) return;
        
        try {
            await this.cameraAdapter.start();
            this.isMonitoring = true;
            this.view.updateStatus("Monitoring", "green");
            this.loop();
        } catch (error) {
            console.error("Failed to start monitoring:", error);
            this.view.updateStatus("Camera Error", "red");
        }
    }

    stop() {
        this.isMonitoring = false;
        this.cameraAdapter.stop();
        this.view.updateStatus("Stopped", "gray");
        this.badPostureStartTime = null;
    }

    async loop() {
        if (!this.isMonitoring) return;

        // Send video frame to MediaPipe
        // Note: requestAnimationFrame is usually handled by the browser's render loop,
        // but here we trigger the processing explicitly.
        // We can use requestAnimationFrame to sync with display refresh rate.
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
        // Needs to capture the current frame's posture as baseline.
        // We can do this by setting a flag or exposing a method that takes the *next* available posture.
        // Or better, we can just grab the latest posture if we stored it.
        // Since onPoseDetected is async, let's use a one-time flag mechanism or ask the user to stay still.
        // For simplicity, let's assume the View calls this when the user clicks "Set Baseline".
        // We need the *current* landmarks to set baseline.
        // Let's modify onPoseDetected to store the latest posture temporarily or request a baseline capture.
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
                this.lastAlertLevel = null;
            } else {
                const duration = Date.now() - this.badPostureStartTime;
                if (duration >= MONITORING_CONFIG.DEBOUNCE_TIME) {
                    this.audioAdapter.playTap();
                    this.lastAlertLevel = 'tap';
                }
            }
        } else {
            this.badPostureStartTime = null;
            this.lastAlertLevel = null;
            this.audioAdapter.resetCooldown();
        }
    }
}
