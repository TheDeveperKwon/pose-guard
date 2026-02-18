import { MonitorService } from '../application/MonitorService.js';
import { MediaPipeAdapter } from '../infrastructure/MediaPipeAdapter.js';
import { CameraAdapter } from '../infrastructure/CameraAdapter.js';
import { AudioAdapter } from '../infrastructure/AudioAdapter.js';
import { Evaluator } from '../domain/Evaluator.js';
import { SOUND_CONFIG } from '../config/constants.js';

// DOM Elements
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnCalibrate = document.getElementById('btn-calibrate');

const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const valTurtle = document.getElementById('val-turtle');
const valSlouch = document.getElementById('val-slouch');
const valText = document.getElementById('val-text');

// Settings Elements
const inputShowCamera = document.getElementById('input-show-camera');
const inputSens = document.getElementById('input-sens');
const labelSens = document.getElementById('label-sens');
const inputPowerSave = document.getElementById('input-power-save');
const inputVolume = document.getElementById('input-volume');
const labelVolume = document.getElementById('label-volume');

// Initialize Adapters
const cameraAdapter = new CameraAdapter(videoElement);
const mediaPipeAdapter = new MediaPipeAdapter();
const audioAdapter = new AudioAdapter({
    volume: SOUND_CONFIG.VOLUME / 100,
    cooldownMs: SOUND_CONFIG.COOLDOWN_MS
});
const evaluator = new Evaluator(null);

// View Object
const view = {
    updateStatus: (text, color) => {
        statusText.textContent = text;
        statusIndicator.style.backgroundColor = color === 'green' ? '#4caf50' : 
                                              color === 'red' ? '#f44336' : 
                                              color === 'blue' ? '#2196f3' : '#757575';
    },

    render: (posture, evaluation) => {
        const shouldDraw = !document.hidden && !isPowerSaving;

        if (shouldDraw) {
            // Draw on canvas
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            
            // Only draw if we have landmarks
            if (posture.landmarks && posture.landmarks.length > 0) {
                // Check if global drawing utils are available
                if (window.drawConnectors && window.drawLandmarks) {
                    window.drawConnectors(canvasCtx, posture.landmarks, window.POSE_CONNECTIONS,
                        { color: '#00FF00', lineWidth: 2 });
                    window.drawLandmarks(canvasCtx, posture.landmarks,
                        { color: '#FF0000', lineWidth: 1, radius: 3 });
                }
            }
            canvasCtx.restore();
        }

        // Update Stats
        if (evaluation.results) {
            updateStatItem(valTurtle, evaluation.results.isTurtleNeck);
            updateStatItem(valSlouch, evaluation.results.isSlouching);
            updateStatItem(valText, evaluation.results.isTextNeck);
        }
    }
};

function updateStatItem(element, isBad) {
    if (isBad) {
        element.textContent = "WARNING";
        element.style.color = "#f44336";
    } else {
        element.textContent = "Good";
        element.style.color = "#4caf50";
    }
}

// Initialize Service
const monitorService = new MonitorService(
    cameraAdapter, mediaPipeAdapter, audioAdapter, evaluator, view
);

let isPowerSaving = false;

function setPowerSaving(enabled) {
    isPowerSaving = enabled;
    document.body.classList.toggle('power-saving', enabled);

    if (enabled) {
        videoElement.style.opacity = 0;
        canvasElement.style.opacity = 0;
        inputShowCamera.disabled = true;
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    } else {
        inputShowCamera.disabled = false;
        const visible = inputShowCamera.checked;
        videoElement.style.opacity = visible ? 1 : 0;
        canvasElement.style.opacity = 1;
    }
}

function setCameraVisibility(visible) {
    if (isPowerSaving) return;
    videoElement.style.opacity = visible ? 1 : 0;
    canvasElement.style.opacity = 1;
}

function syncCanvasSizeToVideo() {
    if (!videoElement.videoWidth || !videoElement.videoHeight) return;
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
}

// Event Listeners
btnStart.addEventListener('click', async () => {
    btnStart.disabled = true;
    try {
        if (!window.Pose) {
            view.updateStatus('MediaPipe not loaded', 'red');
            throw new Error('MediaPipe is not available');
        }

        await monitorService.start();
        btnStop.disabled = false;
        btnCalibrate.disabled = false;
        syncCanvasSizeToVideo();
    } catch (error) {
        console.error('Failed to start monitoring:', error);
        view.updateStatus('Camera Error', 'red');
        btnStart.disabled = false;
    }
});

btnStop.addEventListener('click', () => {
    monitorService.stop();
    btnStart.disabled = false;
    btnStop.disabled = true;
    btnCalibrate.disabled = true;
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
});

btnCalibrate.addEventListener('click', () => {
    monitorService.setBaseline();
});

// Settings Events
inputShowCamera.addEventListener('change', (e) => {
    if (isPowerSaving) return;
    setCameraVisibility(e.target.checked);
});

inputSens.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    labelSens.textContent = val;
    evaluator.setSensitivity(val);
});

inputPowerSave.addEventListener('change', (e) => {
    setPowerSaving(e.target.checked);
});

inputVolume.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    labelVolume.textContent = `${val}%`;
    audioAdapter.setVolume(val / 100);
});


// Handle window resize if needed
window.addEventListener('resize', () => {
    syncCanvasSizeToVideo();
});

// Initialize sound UI defaults
inputVolume.value = SOUND_CONFIG.VOLUME;
labelVolume.textContent = `${SOUND_CONFIG.VOLUME}%`;

// Initialize camera visibility UI
setCameraVisibility(inputShowCamera.checked);
