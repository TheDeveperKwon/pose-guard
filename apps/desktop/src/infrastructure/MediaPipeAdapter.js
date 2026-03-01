const REQUIRED_TRACKING_POINTS = [0, 11, 12];

function isLandmark(point) {
    return (
        point !== null &&
        typeof point === 'object' &&
        Number.isFinite(point.x) &&
        Number.isFinite(point.y)
    );
}

function isLandmarkSet(value) {
    if (!Array.isArray(value) || value.length < 13) return false;
    return REQUIRED_TRACKING_POINTS.every((index) => isLandmark(value[index]));
}

function distance(a, b) {
    if (!isLandmark(a) || !isLandmark(b)) return Number.POSITIVE_INFINITY;
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function visibility(point) {
    return typeof point?.visibility === 'number' && Number.isFinite(point.visibility)
        ? point.visibility
        : 1;
}

export class MediaPipeAdapter {
    constructor() {
        this.pose = null;
        this.initPromise = null;
        this.onResultsCallback = null;
        this.primaryAnchor = null;
    }

    resetTracking() {
        this.primaryAnchor = null;
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
                    return new URL(
                        `vendor/mediapipe/pose/${file}`,
                        window.location.href
                    ).toString();
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
        const selected = this.selectPrimaryLandmarks(results);
        if (this.onResultsCallback) {
            this.onResultsCallback(selected);
        }
    }

    async send(videoElement) {
        const pose = await this.init();
        await pose.send({ image: videoElement });
    }

    extractCandidates(results) {
        const candidates = [];
        const tryCollect = (input) => {
            if (isLandmarkSet(input)) {
                candidates.push(input);
                return;
            }
            if (!Array.isArray(input)) return;
            for (const item of input) {
                if (isLandmarkSet(item)) {
                    candidates.push(item);
                }
            }
        };

        tryCollect(results?.poseLandmarks);
        tryCollect(results?.landmarks);

        if (Array.isArray(results?.poses)) {
            for (const pose of results.poses) {
                tryCollect(pose?.landmarks);
                tryCollect(pose?.poseLandmarks);
            }
        }

        return candidates;
    }

    getAnchor(landmarks) {
        const nose = landmarks[0];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        if (!isLandmark(nose) || !isLandmark(leftShoulder) || !isLandmark(rightShoulder)) {
            return null;
        }
        return {
            x: (nose.x + leftShoulder.x + rightShoulder.x) / 3,
            y: (nose.y + leftShoulder.y + rightShoulder.y) / 3
        };
    }

    scoreCandidate(landmarks) {
        const nose = landmarks[0];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        if (!isLandmark(nose) || !isLandmark(leftShoulder) || !isLandmark(rightShoulder)) {
            return -Infinity;
        }

        const shoulderWidth = distance(leftShoulder, rightShoulder);
        const shoulderMid = {
            x: (leftShoulder.x + rightShoulder.x) / 2,
            y: (leftShoulder.y + rightShoulder.y) / 2
        };
        const torsoHeight = distance(nose, shoulderMid);
        const visibilityScore =
            visibility(nose) + visibility(leftShoulder) + visibility(rightShoulder);
        const centeredScore = 1 - Math.min(1, Math.abs(((nose.x + shoulderMid.x) / 2) - 0.5) * 2);

        return visibilityScore * 3 + shoulderWidth * 2 + torsoHeight * 2 + centeredScore;
    }

    selectPrimaryLandmarks(results) {
        const candidates = this.extractCandidates(results);
        if (candidates.length === 0) {
            this.primaryAnchor = null;
            return null;
        }

        let selected = candidates[0];
        let selectedScore = -Infinity;

        for (const landmarks of candidates) {
            const anchor = this.getAnchor(landmarks);
            const baseScore = this.scoreCandidate(landmarks);
            const trackingPenalty =
                this.primaryAnchor && anchor ? distance(anchor, this.primaryAnchor) * 4 : 0;
            const score = baseScore - trackingPenalty;

            if (score > selectedScore) {
                selected = landmarks;
                selectedScore = score;
            }
        }

        this.primaryAnchor = this.getAnchor(selected);
        return selected;
    }
}
