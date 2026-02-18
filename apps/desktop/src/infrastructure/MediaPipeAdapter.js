export class MediaPipeAdapter {
    constructor() {
        this.pose = null;
        this.initPromise = null;
        this.onResultsCallback = null;
    }

    setCallback(callback) {
        this.onResultsCallback = callback;
    }

    async init() {
        if (this.pose) return this.pose;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            if (!window.Pose) {
                throw new Error("MediaPipe Pose is not loaded");
            }

            const pose = new window.Pose({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                }
            });

            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            pose.onResults(this.handleResults.bind(this));
            this.pose = pose;
            return pose;
        })();

        try {
            return await this.initPromise;
        } finally {
            this.initPromise = null;
        }
    }

    handleResults(results) {
        if (this.onResultsCallback) {
            this.onResultsCallback(results?.poseLandmarks || null);
        }
    }

    async send(videoElement) {
        const pose = await this.init();
        await pose.send({ image: videoElement });
    }
}
