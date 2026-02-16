import { extractPostureSample } from "../../../shared/posture/index.js";

export class Posture {
    constructor(landmarks) {
        this.landmarks = Array.isArray(landmarks) ? landmarks : [];
    }

    hasRequiredLandmarks() {
        return extractPostureSample(this.landmarks) !== null;
    }

    getEyeDistance() {
        const sample = this.getSample();
        return sample ? sample.zoom : null;
    }

    getTorsoHeight() {
        const sample = this.getSample();
        return sample ? sample.height : null;
    }

    getNoseEarYDiff() {
        const sample = this.getSample();
        return sample ? sample.pitch : null;
    }

    getSample() {
        return extractPostureSample(this.landmarks);
    }
}
