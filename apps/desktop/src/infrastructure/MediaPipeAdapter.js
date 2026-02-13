export class MediaPipeAdapter {
    constructor() {
        this.pose = new window.Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        this.onResultsCallback = null;
        this.pose.onResults(this.handleResults.bind(this));
    }

    setCallback(callback) {
        this.onResultsCallback = callback;
    }

    handleResults(results) {
        if (this.onResultsCallback && results.poseLandmarks) {
            this.onResultsCallback(results.poseLandmarks);
        }
    }

    async send(videoElement) {
        await this.pose.send({ image: videoElement });
    }
}
