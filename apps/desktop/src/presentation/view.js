import { MonitorService } from '../application/MonitorService.js';
import { MediaPipeAdapter } from '../infrastructure/MediaPipeAdapter.js';
import { CameraAdapter } from '../infrastructure/CameraAdapter.js';
import { AudioAdapter } from '../infrastructure/AudioAdapter.js';
import { Evaluator } from '../domain/Evaluator.js';
import { SOUND_CONFIG } from '../config/constants.js';

const DEFAULT_MANNER_MODE = true;
const DEFAULT_VOLUME = 0;

// DOM Elements
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

const btnMonitorToggle = document.getElementById('btn-monitor-toggle');
const btnSettingsToggle = document.getElementById('btn-settings-toggle');
const btnCalibrate = document.getElementById('btn-calibrate');
const advancedSettings = document.getElementById('advanced-settings');

const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const valTurtle = document.getElementById('val-turtle');
const valSlouch = document.getElementById('val-slouch');
const valText = document.getElementById('val-text');
const calibrationStatus = document.getElementById('calibration-status');
const calibrationLabel = document.getElementById('calibration-label');
const calibrationPercent = document.getElementById('calibration-percent');
const calibrationFill = document.getElementById('calibration-fill');

// Settings Elements
const inputShowCamera = document.getElementById('input-show-camera');
const inputMannerMode = document.getElementById('input-manner-mode');
const inputSens = document.getElementById('input-sens');
const labelSens = document.getElementById('label-sens');
const inputPowerSave = document.getElementById('input-power-save');
const inputVolume = document.getElementById('input-volume');
const labelVolume = document.getElementById('label-volume');
const onboardingModal = document.getElementById('onboarding-modal');
const btnOnboardingConfirm = document.getElementById('btn-onboarding-confirm');

// Initialize Adapters
const cameraAdapter = new CameraAdapter(videoElement);
const mediaPipeAdapter = new MediaPipeAdapter();
const audioAdapter = new AudioAdapter({
    volume: DEFAULT_VOLUME / 100,
    cooldownMs: SOUND_CONFIG.COOLDOWN_MS
});
const evaluator = new Evaluator(null);
const ONBOARDING_STORAGE_KEY = 'pg_onboarding_seen_v1';

let isPowerSaving = false;
let isMannerMode = DEFAULT_MANNER_MODE;
let isMonitoring = false;

function triggerMannerAlert() {
    if (window.desktopOverlay && typeof window.desktopOverlay.trigger === 'function') {
        window.desktopOverlay.trigger();
    }
}

function clearMannerAlert() {
    if (window.desktopOverlay && typeof window.desktopOverlay.clear === 'function') {
        window.desktopOverlay.clear();
    }
}

function resetStatItem(element) {
    element.textContent = '--';
    element.style.color = '#9e9e9e';
}

function resetStats() {
    resetStatItem(valTurtle);
    resetStatItem(valSlouch);
    resetStatItem(valText);
}

function updateStatItem(element, isBad) {
    if (typeof isBad !== 'boolean') {
        resetStatItem(element);
        return;
    }

    if (isBad) {
        element.textContent = 'WARNING';
        element.style.color = '#f44336';
    } else {
        element.textContent = 'Good';
        element.style.color = '#4caf50';
    }
}

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
        setCameraVisibility(inputShowCamera.checked);
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

function setMonitorUi(active) {
    isMonitoring = active;
    btnMonitorToggle.textContent = active ? 'Stop Monitoring' : 'Start Monitoring';
    btnMonitorToggle.classList.toggle('is-stop', active);
    btnCalibrate.disabled = !active;
}

function toggleSettingsPanel(forceOpen) {
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : advancedSettings.hidden;
    advancedSettings.hidden = !shouldOpen;
    btnSettingsToggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    btnSettingsToggle.textContent = shouldOpen ? 'Hide Settings' : 'Settings';
}

function setCalibrationProgress(progress, message) {
    if (!calibrationStatus || !calibrationLabel || !calibrationPercent || !calibrationFill) {
        return;
    }

    const normalized = Math.max(0, Math.min(100, Math.round(progress)));
    calibrationStatus.hidden = false;
    calibrationLabel.textContent = message || 'Calibrating...';
    calibrationPercent.textContent = `${normalized}%`;
    calibrationFill.style.width = `${normalized}%`;
}

function clearCalibrationProgress() {
    if (!calibrationStatus || !calibrationLabel || !calibrationPercent || !calibrationFill) {
        return;
    }

    calibrationStatus.hidden = true;
    calibrationLabel.textContent = 'Calibrating...';
    calibrationPercent.textContent = '0%';
    calibrationFill.style.width = '0%';
}

function hasSeenOnboarding() {
    try {
        return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

function markOnboardingSeen() {
    try {
        window.localStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
    } catch {
        // Ignore storage errors.
    }
}

function closeOnboarding() {
    if (!onboardingModal) return;
    markOnboardingSeen();
    onboardingModal.hidden = true;
    document.body.classList.remove('onboarding-open');
    if (btnMonitorToggle && typeof btnMonitorToggle.focus === 'function') {
        btnMonitorToggle.focus();
    }
}

function openOnboarding() {
    if (!onboardingModal) return;
    onboardingModal.hidden = false;
    document.body.classList.add('onboarding-open');
}

function initializeOnboarding() {
    if (!onboardingModal || !btnOnboardingConfirm) return;

    const dismissOnboarding = () => closeOnboarding();
    btnOnboardingConfirm.addEventListener('click', dismissOnboarding);
    btnOnboardingConfirm.addEventListener('pointerup', dismissOnboarding);

    onboardingModal.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        if (target.id === 'btn-onboarding-confirm' || target.closest('#btn-onboarding-confirm')) {
            closeOnboarding();
            return;
        }
        if (target === onboardingModal) {
            closeOnboarding();
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !onboardingModal.hidden) {
            closeOnboarding();
        }
    });

    if (hasSeenOnboarding()) {
        onboardingModal.hidden = true;
        document.body.classList.remove('onboarding-open');
        return;
    }

    openOnboarding();
}

// View Object
const view = {
    updateStatus: (text, color) => {
        statusText.textContent = text;
        statusIndicator.style.backgroundColor = color === 'green'
            ? '#4caf50'
            : color === 'red'
                ? '#f44336'
                : color === 'blue'
                    ? '#2196f3'
                    : '#757575';
    },

    render: (posture, evaluation) => {
        const shouldDraw = !document.hidden && !isPowerSaving;
        const hasLandmarks = Boolean(
            posture &&
            Array.isArray(posture.landmarks) &&
            posture.landmarks.length > 0
        );

        if (shouldDraw) {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            if (hasLandmarks && window.drawConnectors && window.drawLandmarks) {
                window.drawConnectors(canvasCtx, posture.landmarks, window.POSE_CONNECTIONS, {
                    color: '#00FF00',
                    lineWidth: 2
                });
                window.drawLandmarks(canvasCtx, posture.landmarks, {
                    color: '#FF0000',
                    lineWidth: 1,
                    radius: 3
                });
            }

            canvasCtx.restore();
        }

        if (!hasLandmarks || !evaluation?.results) {
            resetStats();
            return;
        }

        updateStatItem(valTurtle, evaluation.results.isTurtleNeck);
        updateStatItem(valSlouch, evaluation.results.isSlouching);
        updateStatItem(valText, evaluation.results.isTextNeck);
    },

    updateCalibrationProgress: (progress, message) => {
        setCalibrationProgress(progress, message);
    },
    clearCalibrationProgress,
    triggerMannerAlert,
    clearMannerAlert
};

// Initialize Service
const monitorService = new MonitorService(
    cameraAdapter,
    mediaPipeAdapter,
    audioAdapter,
    evaluator,
    view
);

// Event Listeners
btnMonitorToggle.addEventListener('click', async () => {
    btnMonitorToggle.disabled = true;

    try {
        if (isMonitoring) {
            monitorService.stop();
            setMonitorUi(false);
            clearCalibrationProgress();
            resetStats();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        } else {
            if (!window.Pose) {
                view.updateStatus('MediaPipe not loaded', 'red');
                throw new Error('MediaPipe is not available');
            }

            await monitorService.start();
            setMonitorUi(true);
            syncCanvasSizeToVideo();
        }
    } catch (error) {
        console.error('Failed to toggle monitoring:', error);
        view.updateStatus('Camera Error', 'red');
        setMonitorUi(false);
    } finally {
        btnMonitorToggle.disabled = false;
    }
});

btnSettingsToggle.addEventListener('click', () => {
    toggleSettingsPanel();
});

btnCalibrate.addEventListener('click', () => {
    monitorService.setBaseline();
});

// Settings Events
inputShowCamera.addEventListener('change', (e) => {
    if (isPowerSaving) return;
    setCameraVisibility(e.target.checked);
});

inputMannerMode.addEventListener('change', (e) => {
    isMannerMode = e.target.checked;
    monitorService.setMannerMode(isMannerMode);
    if (!isMannerMode) {
        clearMannerAlert();
    }
});

inputSens.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    labelSens.textContent = val;
    evaluator.setSensitivity(val);
});

inputPowerSave.addEventListener('change', (e) => {
    setPowerSaving(e.target.checked);
});

inputVolume.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    labelVolume.textContent = `${val}%`;
    audioAdapter.setVolume(val / 100);
});

// Handle window resize if needed
window.addEventListener('resize', () => {
    syncCanvasSizeToVideo();
});

// Initialize defaults
inputVolume.value = DEFAULT_VOLUME;
labelVolume.textContent = `${DEFAULT_VOLUME}%`;
inputShowCamera.checked = false;
inputMannerMode.checked = DEFAULT_MANNER_MODE;
inputPowerSave.checked = false;

setPowerSaving(false);
setCameraVisibility(false);
monitorService.setMannerMode(DEFAULT_MANNER_MODE);
setMonitorUi(false);
resetStats();
toggleSettingsPanel(false);
clearCalibrationProgress();
view.updateStatus('Ready', 'gray');
initializeOnboarding();
