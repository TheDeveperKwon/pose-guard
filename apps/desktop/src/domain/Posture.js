import { extractPostureSample } from "../shared/posture/index.js";

export class Posture {
    constructor(landmarks) {
        this.landmarks = Array.isArray(landmarks) ? landmarks : [];
    }

    getSample() {
        return extractPostureSample(this.landmarks);
    }
}
