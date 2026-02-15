import { DEFAULT_THRESHOLDS } from '../config/constants.js';

function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}

export class Evaluator {
    constructor(baselinePosture) {
        this.baseline = baselinePosture;
        this.sensitivity = 50; // Default sensitivity (0-100)
    }

    updateBaseline(posture) {
        if (!posture || typeof posture !== "object") return false;

        const zoom = posture.getEyeDistance();
        const height = posture.getTorsoHeight();
        const pitch = posture.getNoseEarYDiff();

        if (!isFiniteNumber(zoom) || !isFiniteNumber(height) || !isFiniteNumber(pitch)) {
            return false;
        }

        this.baseline = { zoom, height, pitch };
        return true;
    }

    setSensitivity(value) {
        this.sensitivity = value;
    }

    evaluate(currentPosture) {
        if (!this.baseline) return { status: 'NORMAL', results: {} };

        // 1. 핵심 수치 계산
        const currentZoom = currentPosture.getEyeDistance();
        const currentHeight = currentPosture.getTorsoHeight();
        const currentPitch = currentPosture.getNoseEarYDiff();
        if (
            !isFiniteNumber(this.baseline.zoom) ||
            !isFiniteNumber(this.baseline.height) ||
            !isFiniteNumber(this.baseline.pitch) ||
            !isFiniteNumber(currentZoom) ||
            !isFiniteNumber(currentHeight) ||
            !isFiniteNumber(currentPitch) ||
            this.baseline.height === 0
        ) {
            return { status: 'NORMAL', results: {} };
        }

        // 2. 변화율 계산
        const zoomRatio = currentZoom / this.baseline.zoom;
        const heightRatio = currentHeight / this.baseline.height;
        const pitchDiff = currentPitch - this.baseline.pitch;

        // 3. 민감도(Sensitivity) 적용 (0 ~ 100)
        const factor = this.sensitivity / 100.0;
        
        // 4. 임계값(Threshold) 동적 계산 (Base값을 constants에서 가져옴)
        const thZoom = DEFAULT_THRESHOLDS.TURTLE_NECK - (0.20 * factor); 
        const thHeight = DEFAULT_THRESHOLDS.SLOUCHING + (0.15 * factor);
        const thPitch = DEFAULT_THRESHOLDS.TEXT_NECK - (0.04 * factor);

        // 5. 최종 판정
        const results = {
            isTurtleNeck: zoomRatio > thZoom,
            isSlouching: heightRatio < thHeight,
            isTextNeck: pitchDiff > thPitch,
            metrics: { zoomRatio, heightRatio, pitchDiff }
        };

        const isBad = results.isTurtleNeck || results.isSlouching || results.isTextNeck;

        return {
            status: isBad ? 'BAD' : 'NORMAL',
            results
        };
    }
}
