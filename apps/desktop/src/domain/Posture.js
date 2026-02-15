const REQUIRED_LANDMARK_INDICES = [0, 2, 5, 7, 8, 11, 12];

function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}

function isLandmarkPoint(point) {
    return (
        point &&
        isFiniteNumber(point.x) &&
        isFiniteNumber(point.y)
    );
}

export class Posture {
    constructor(landmarks) {
        this.landmarks = Array.isArray(landmarks) ? landmarks : [];
    }

    hasRequiredLandmarks() {
        return REQUIRED_LANDMARK_INDICES.every((index) => isLandmarkPoint(this.landmarks[index]));
    }

    getPoint(index) {
        const point = this.landmarks[index];
        if (!isLandmarkPoint(point)) return null;
        return point;
    }

    getEyeDistance() {
        const leftEye = this.getPoint(2);
        const rightEye = this.getPoint(5);
        if (!leftEye || !rightEye) return null;
        return Math.sqrt(
            Math.pow(leftEye.x - rightEye.x, 2) + 
            Math.pow(leftEye.y - rightEye.y, 2)
        );
    }

    getTorsoHeight() {
        const nose = this.getPoint(0);
        const leftShoulder = this.getPoint(11);
        const rightShoulder = this.getPoint(12);
        if (!nose || !leftShoulder || !rightShoulder) return null;
        const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
        return Math.abs(shoulderMidY - nose.y);
    }

    getNoseEarYDiff() {
        const nose = this.getPoint(0);
        const leftEar = this.getPoint(7);
        const rightEar = this.getPoint(8);
        if (!nose || !leftEar || !rightEar) return null;
        const earMidY = (leftEar.y + rightEar.y) / 2;
        return nose.y - earMidY;
    }
}
