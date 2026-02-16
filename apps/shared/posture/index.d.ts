export type PoseLandmark = { x: number; y: number };

export interface PostureSample {
  zoom: number;
  height: number;
  pitch: number;
}

export interface PostureThresholds {
  TURTLE_NECK: number;
  SLOUCHING: number;
  TEXT_NECK: number;
}

export type PostureStatus = "NORMAL" | "BAD";

export interface PostureEvaluationResult {
  isTurtleNeck: boolean;
  isSlouching: boolean;
  isTextNeck: boolean;
  metrics: {
    zoomRatio: number;
    heightRatio: number;
    pitchDiff: number;
  };
}

export interface PostureEvaluation {
  status: PostureStatus;
  results: PostureEvaluationResult;
}

export interface EvaluatePostureArgs {
  baseline: PostureSample | null | undefined;
  current: PostureSample | null | undefined;
  sensitivity?: number;
  thresholds?: PostureThresholds;
}

export const REQUIRED_LANDMARK_INDICES: readonly number[];
export const DEFAULT_THRESHOLDS: PostureThresholds;

export function isLandmark(value: unknown): value is PoseLandmark;
export function getLandmark(landmarks: unknown, index: number): PoseLandmark | null;
export function extractPostureSample(landmarks: unknown): PostureSample | null;
export function evaluatePosture(args: EvaluatePostureArgs): PostureEvaluation;
