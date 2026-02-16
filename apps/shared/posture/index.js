export const REQUIRED_LANDMARK_INDICES = [0, 2, 5, 7, 8, 11, 12];

export const DEFAULT_THRESHOLDS = {
  TURTLE_NECK: 1.3,
  SLOUCHING: 0.8,
  TEXT_NECK: 0.05
};

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

export function isLandmark(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y)
  );
}

export function getLandmark(landmarks, index) {
  if (!Array.isArray(landmarks)) return null;
  const point = landmarks[index];
  return isLandmark(point) ? point : null;
}

export function extractPostureSample(landmarks) {
  if (!Array.isArray(landmarks)) return null;

  const hasAllPoints = REQUIRED_LANDMARK_INDICES.every((index) => {
    return getLandmark(landmarks, index) !== null;
  });
  if (!hasAllPoints) return null;

  const leftEye = getLandmark(landmarks, 2);
  const rightEye = getLandmark(landmarks, 5);
  const nose = getLandmark(landmarks, 0);
  const leftShoulder = getLandmark(landmarks, 11);
  const rightShoulder = getLandmark(landmarks, 12);
  const leftEar = getLandmark(landmarks, 7);
  const rightEar = getLandmark(landmarks, 8);

  if (!leftEye || !rightEye || !nose || !leftShoulder || !rightShoulder || !leftEar || !rightEar) {
    return null;
  }

  const zoom = Math.sqrt(
    Math.pow(leftEye.x - rightEye.x, 2) +
    Math.pow(leftEye.y - rightEye.y, 2)
  );
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
  const height = Math.abs(shoulderMidY - nose.y);
  const earMidY = (leftEar.y + rightEar.y) / 2;
  const pitch = nose.y - earMidY;

  if (!isFiniteNumber(zoom) || !isFiniteNumber(height) || !isFiniteNumber(pitch)) {
    return null;
  }

  return { zoom, height, pitch };
}

function defaultThresholds(overrides) {
  if (!overrides) {
    return DEFAULT_THRESHOLDS;
  }
  return {
    TURTLE_NECK:
      typeof overrides.TURTLE_NECK === "number" ? overrides.TURTLE_NECK : DEFAULT_THRESHOLDS.TURTLE_NECK,
    SLOUCHING:
      typeof overrides.SLOUCHING === "number" ? overrides.SLOUCHING : DEFAULT_THRESHOLDS.SLOUCHING,
    TEXT_NECK:
      typeof overrides.TEXT_NECK === "number" ? overrides.TEXT_NECK : DEFAULT_THRESHOLDS.TEXT_NECK
  };
}

export function evaluatePosture({
  baseline,
  current,
  sensitivity = 50,
  thresholds
}) {
  const DEFAULT_EVALUATION = {
    status: "NORMAL",
    results: {
      isTurtleNeck: false,
      isSlouching: false,
      isTextNeck: false,
      metrics: { zoomRatio: 0, heightRatio: 0, pitchDiff: 0 }
    }
  };

  if (!baseline || !current) return DEFAULT_EVALUATION;
  if (!isFiniteNumber(baseline.zoom) || !isFiniteNumber(baseline.height) || !isFiniteNumber(baseline.pitch)) return DEFAULT_EVALUATION;
  if (!isFiniteNumber(current.zoom) || !isFiniteNumber(current.height) || !isFiniteNumber(current.pitch)) return DEFAULT_EVALUATION;
  if (baseline.height === 0) return DEFAULT_EVALUATION;

  const factor = sensitivity / 100;
  const normalizedThresholds = defaultThresholds(thresholds);

  const zoomRatio = current.zoom / baseline.zoom;
  const heightRatio = current.height / baseline.height;
  const pitchDiff = current.pitch - baseline.pitch;

  const thZoom = normalizedThresholds.TURTLE_NECK - 0.2 * factor;
  const thHeight = normalizedThresholds.SLOUCHING + 0.15 * factor;
  const thPitch = normalizedThresholds.TEXT_NECK - 0.04 * factor;

  const isTurtleNeck = zoomRatio > thZoom;
  const isSlouching = heightRatio < thHeight;
  const isTextNeck = pitchDiff > thPitch;
  const isBad = isTurtleNeck || isSlouching || isTextNeck;

  return {
    status: isBad ? "BAD" : "NORMAL",
    results: {
      isTurtleNeck,
      isSlouching,
      isTextNeck,
      metrics: { zoomRatio, heightRatio, pitchDiff }
    }
  };
}
