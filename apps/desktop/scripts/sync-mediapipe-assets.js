const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const vendorRoot = path.join(projectRoot, 'src', 'presentation', 'vendor', 'mediapipe');
const poseSourceDir = path.join(projectRoot, 'node_modules', '@mediapipe', 'pose');
const drawingUtilsSourceDir = path.join(projectRoot, 'node_modules', '@mediapipe', 'drawing_utils');

const poseFiles = [
    'pose.js',
    'pose_solution_packed_assets_loader.js',
    'pose_solution_packed_assets.data',
    'pose_solution_simd_wasm_bin.data',
    'pose_solution_simd_wasm_bin.js',
    'pose_solution_simd_wasm_bin.wasm',
    'pose_solution_wasm_bin.js',
    'pose_solution_wasm_bin.wasm',
    'pose_web.binarypb',
    'pose_landmark_full.tflite',
    'pose_landmark_lite.tflite',
    'pose_landmark_heavy.tflite'
];

function ensureSourceExists(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing required MediaPipe asset: ${filePath}`);
    }
}

function copyFile(sourcePath, targetPath) {
    ensureSourceExists(sourcePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
}

function syncPoseFiles() {
    const poseTargetDir = path.join(vendorRoot, 'pose');
    fs.mkdirSync(poseTargetDir, { recursive: true });

    for (const fileName of poseFiles) {
        copyFile(
            path.join(poseSourceDir, fileName),
            path.join(poseTargetDir, fileName)
        );
    }
}

function syncDrawingUtils() {
    copyFile(
        path.join(drawingUtilsSourceDir, 'drawing_utils.js'),
        path.join(vendorRoot, 'drawing_utils', 'drawing_utils.js')
    );
}

function main() {
    if (!fs.existsSync(poseSourceDir) || !fs.existsSync(drawingUtilsSourceDir)) {
        throw new Error('MediaPipe packages are not installed. Run `npm install` first.');
    }

    fs.rmSync(vendorRoot, { recursive: true, force: true });
    syncPoseFiles();
    syncDrawingUtils();
    console.log('MediaPipe assets synced to src/presentation/vendor/mediapipe');
}

main();
