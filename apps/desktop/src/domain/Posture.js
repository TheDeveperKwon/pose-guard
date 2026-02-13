export class Posture {
    constructor(landmarks) {
        this.landmarks = landmarks;
    }

    getEyeDistance() {
        // MediaPipe Pose landmarks for eyes: 2 (left eye), 5 (right eye)
        const leftEye = this.landmarks[2];
        const rightEye = this.landmarks[5];
        return Math.sqrt(
            Math.pow(leftEye.x - rightEye.x, 2) + 
            Math.pow(leftEye.y - rightEye.y, 2)
        );
    }

    getTorsoHeight() {
        // MediaPipe Pose landmarks: 0 (nose), 11 (left shoulder), 12 (right shoulder)
        const nose = this.landmarks[0];
        const shoulderMidY = (this.landmarks[11].y + this.landmarks[12].y) / 2;
        return Math.abs(shoulderMidY - nose.y);
    }

    getNoseEarYDiff() {
        // MediaPipe Pose landmarks: 0 (nose), 7 (left ear), 8 (right ear)
        const nose = this.landmarks[0];
        const earMidY = (this.landmarks[7].y + this.landmarks[8].y) / 2;
        return nose.y - earMidY;
    }
}
