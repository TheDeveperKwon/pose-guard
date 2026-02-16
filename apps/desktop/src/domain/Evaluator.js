import { DEFAULT_THRESHOLDS, evaluatePosture } from '../../../shared/posture/index.js';

export class Evaluator {
    constructor(baselinePosture) {
        this.baseline = baselinePosture;
        this.sensitivity = 50; // Default sensitivity (0-100)
    }

    updateBaseline(posture) {
        if (!posture || typeof posture !== "object") return false;
        const baseline = posture.getSample ? posture.getSample() : posture;
        if (!baseline) {
            return false;
        }

        this.baseline = baseline;
        return true;
    }

    setSensitivity(value) {
        this.sensitivity = value;
    }

    evaluate(currentPosture) {
        const current = currentPosture?.getSample ? currentPosture.getSample() : currentPosture;
        const evaluation = evaluatePosture({
            baseline: this.baseline,
            current,
            sensitivity: this.sensitivity,
            thresholds: DEFAULT_THRESHOLDS
        });

        // Keep old shape for existing consumers
        return evaluation;
    }
}
