import { MonitorService } from '../application/MonitorService.js';
import { MediaPipeAdapter } from '../infrastructure/MediaPipeAdapter.js';
import { CameraAdapter } from '../infrastructure/CameraAdapter.js';
import { AudioAdapter } from '../infrastructure/AudioAdapter.js';
import { Evaluator } from '../domain/Evaluator.js';
import { SOUND_CONFIG } from '../config/constants.js';
import {
    detectRendererDefaultLanguage,
    getText,
    normalizeLanguage
} from './i18n/index.js';

const SETTINGS_STORAGE_KEY = 'pg_settings_v1';
const ONBOARDING_STORAGE_KEY = 'pg_onboarding_seen_v1';
const DEFAULT_SENSITIVITY = 50;
const DEFAULT_SHOW_CAMERA = false;
const DEFAULT_POWER_SAVE = false;
const DEFAULT_VISUAL_ALERT = true;
const DEFAULT_SOUND_ALERT = false;
const DEFAULT_VOLUME = 0;
const DEFAULT_LANGUAGE = detectRendererDefaultLanguage();
let currentLanguage = DEFAULT_LANGUAGE;
const DEFAULT_SETTINGS = {
    showCamera: DEFAULT_SHOW_CAMERA,
    visualAlert: DEFAULT_VISUAL_ALERT,
    soundAlert: DEFAULT_SOUND_ALERT,
    sensitivity: DEFAULT_SENSITIVITY,
    powerSave: DEFAULT_POWER_SAVE,
    volume: DEFAULT_VOLUME,
    language: DEFAULT_LANGUAGE
};

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
const headerSubtitle = document.getElementById('header-subtitle');
const videoTip = document.getElementById('video-tip');
const settingsTitle = document.getElementById('settings-title');
const settingsNote = document.getElementById('settings-note');
const labelLanguage = document.getElementById('label-language');
const labelShowCamera = document.getElementById('label-show-camera');
const labelVisualAlert = document.getElementById('label-visual-alert');
const labelSoundAlert = document.getElementById('label-sound-alert');
const labelPowerSave = document.getElementById('label-power-save');
const labelSensText = document.getElementById('label-sens-text');
const labelVolumeText = document.getElementById('label-volume-text');
const labelTurtle = document.getElementById('label-turtle');
const labelSlouch = document.getElementById('label-slouch');
const labelTextNeck = document.getElementById('label-text-neck');
const onboardingKicker = document.getElementById('onboarding-kicker');
const onboardingTitle = document.getElementById('onboarding-title');
const onboardingBody = document.getElementById('onboarding-body');
const onboardingItem1Title = document.getElementById('onboarding-item-1-title');
const onboardingItem1Body = document.getElementById('onboarding-item-1-body');
const onboardingItem2Title = document.getElementById('onboarding-item-2-title');
const onboardingItem2Body = document.getElementById('onboarding-item-2-body');
const onboardingItem3Title = document.getElementById('onboarding-item-3-title');
const onboardingItem3Body = document.getElementById('onboarding-item-3-body');

// Settings Elements
const inputLanguage = document.getElementById('input-language');
const inputShowCamera = document.getElementById('input-show-camera');
const inputVisualAlert = document.getElementById('input-visual-alert');
const inputSoundAlert = document.getElementById('input-sound-alert');
const inputSens = document.getElementById('input-sens');
const labelSens = document.getElementById('label-sens');
const inputPowerSave = document.getElementById('input-power-save');
const inputVolume = document.getElementById('input-volume');
const labelVolume = document.getElementById('label-volume');
const onboardingModal = document.getElementById('onboarding-modal');
const btnOnboardingConfirm = document.getElementById('btn-onboarding-confirm');
const helpTips = Array.from(document.querySelectorAll('.help-tip'));
const helpLanguage = document.getElementById('help-language');
const helpShowCamera = document.getElementById('help-show-camera');
const helpVisualAlert = document.getElementById('help-visual-alert');
const helpSoundAlert = document.getElementById('help-sound-alert');
const helpPowerSave = document.getElementById('help-power-save');
const helpSensitivity = document.getElementById('help-sensitivity');
const helpVolume = document.getElementById('help-volume');

// Initialize Adapters
const cameraAdapter = new CameraAdapter(videoElement);
const mediaPipeAdapter = new MediaPipeAdapter();
const audioAdapter = new AudioAdapter({
    volume: DEFAULT_VOLUME / 100,
    cooldownMs: SOUND_CONFIG.COOLDOWN_MS
});
const evaluator = new Evaluator(null);

let isPowerSaving = false;
let isMonitoring = false;
let lastStatusKey = 'status.ready';
let lastStatusColor = 'gray';
let lastCalibrationMessageKey = 'status.calibrating';

function resolveStatusColor(color) {
    return color === 'green'
        ? '#4caf50'
        : color === 'red'
            ? '#f44336'
            : color === 'blue'
                ? '#2196f3'
                : '#757575';
}

function t(key) {
    return getText(currentLanguage, key);
}

function setElementText(element, value) {
    if (!element) return;
    element.textContent = value;
}

function setHelpCopy(element, labelKey, helpKey) {
    if (!element) return;
    element.setAttribute('aria-label', t(labelKey));
    element.setAttribute('data-help', t(helpKey));
}

function applyLanguageToUi() {
    document.documentElement.lang = currentLanguage;
    setElementText(headerSubtitle, t('headerSubtitle'));
    setElementText(videoTip, t('videoTip'));

    setElementText(settingsTitle, t('settings.title'));
    setElementText(settingsNote, t('settings.note'));
    setElementText(labelLanguage, t('settings.language'));
    setElementText(labelShowCamera, t('settings.showCamera'));
    setElementText(labelVisualAlert, t('settings.visualAlert'));
    setElementText(labelSoundAlert, t('settings.soundAlert'));
    setElementText(labelPowerSave, t('settings.powerSave'));
    setElementText(labelSensText, t('settings.sensitivity'));
    setElementText(labelVolumeText, t('settings.volume'));
    setElementText(labelTurtle, t('stats.turtleNeck'));
    setElementText(labelSlouch, t('stats.slouching'));
    setElementText(labelTextNeck, t('stats.textNeck'));

    setElementText(onboardingKicker, t('onboarding.kicker'));
    setElementText(onboardingTitle, t('onboarding.title'));
    setElementText(onboardingBody, t('onboarding.body'));
    setElementText(onboardingItem1Title, t('onboarding.item1Title'));
    setElementText(onboardingItem1Body, t('onboarding.item1Body'));
    setElementText(onboardingItem2Title, t('onboarding.item2Title'));
    setElementText(onboardingItem2Body, t('onboarding.item2Body'));
    setElementText(onboardingItem3Title, t('onboarding.item3Title'));
    setElementText(onboardingItem3Body, t('onboarding.item3Body'));
    setElementText(btnOnboardingConfirm, t('onboarding.confirm'));
    setElementText(btnCalibrate, t('controls.recalibrateBaseline'));

    if (inputLanguage) {
        const koOption = inputLanguage.querySelector('option[value="ko"]');
        const enOption = inputLanguage.querySelector('option[value="en"]');
        if (koOption) {
            koOption.textContent = t('settings.languageOptionKo');
        }
        if (enOption) {
            enOption.textContent = t('settings.languageOptionEn');
        }
    }

    setHelpCopy(helpLanguage, 'settings.helpLanguageLabel', 'settings.helpLanguage');
    setHelpCopy(helpShowCamera, 'settings.helpShowCameraLabel', 'settings.helpShowCamera');
    setHelpCopy(helpVisualAlert, 'settings.helpVisualAlertLabel', 'settings.helpVisualAlert');
    setHelpCopy(helpSoundAlert, 'settings.helpSoundAlertLabel', 'settings.helpSoundAlert');
    setHelpCopy(helpPowerSave, 'settings.helpPowerSaveLabel', 'settings.helpPowerSave');
    setHelpCopy(helpSensitivity, 'settings.helpSensitivityLabel', 'settings.helpSensitivity');
    setHelpCopy(helpVolume, 'settings.helpVolumeLabel', 'settings.helpVolume');

    setMonitorUi(isMonitoring);
    toggleSettingsPanel(!advancedSettings.hidden);
    statusText.textContent = t(lastStatusKey);
    statusIndicator.style.backgroundColor = resolveStatusColor(lastStatusColor);

    if (!calibrationStatus.hidden) {
        const percent = clampInt(calibrationPercent.textContent, 0, 100, 0);
        calibrationLabel.textContent = t(lastCalibrationMessageKey);
        calibrationPercent.textContent = `${percent}%`;
    } else {
        clearCalibrationProgress();
    }
}

function setLanguage(value) {
    const normalized = normalizeLanguage(value, DEFAULT_LANGUAGE);
    currentLanguage = normalized;
    if (inputLanguage) {
        inputLanguage.value = normalized;
    }
    applyLanguageToUi();
}

function clampInt(value, min, max, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
}

function normalizeSettings(settings) {
    const source = settings && typeof settings === 'object' ? settings : {};
    const hasLegacyMannerMode = typeof source.mannerMode === 'boolean';
    const legacyVisualAlert = hasLegacyMannerMode
        ? source.mannerMode
        : DEFAULT_VISUAL_ALERT;
    return {
        showCamera: typeof source.showCamera === 'boolean'
            ? source.showCamera
            : DEFAULT_SHOW_CAMERA,
        visualAlert: typeof source.visualAlert === 'boolean'
            ? source.visualAlert
            : legacyVisualAlert,
        soundAlert: typeof source.soundAlert === 'boolean'
            ? source.soundAlert
            : hasLegacyMannerMode
                ? !source.mannerMode
                : DEFAULT_SOUND_ALERT,
        language: normalizeLanguage(source.language, DEFAULT_LANGUAGE),
        sensitivity: clampInt(source.sensitivity, 0, 100, DEFAULT_SENSITIVITY),
        powerSave: typeof source.powerSave === 'boolean'
            ? source.powerSave
            : DEFAULT_POWER_SAVE,
        volume: clampInt(source.volume, 0, 100, DEFAULT_VOLUME)
    };
}

function loadPersistedSettings() {
    try {
        const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!raw) return { ...DEFAULT_SETTINGS };
        return normalizeSettings(JSON.parse(raw));
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

function persistSettings(settings) {
    try {
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
        // Ignore storage errors.
    }
}

function getCurrentSettings() {
    return normalizeSettings({
        language: inputLanguage?.value,
        showCamera: inputShowCamera.checked,
        visualAlert: inputVisualAlert.checked,
        soundAlert: inputSoundAlert.checked,
        sensitivity: inputSens.value,
        powerSave: inputPowerSave.checked,
        volume: inputVolume.value
    });
}

function saveCurrentSettings() {
    persistSettings(getCurrentSettings());
}

function triggerVisualAlert() {
    if (window.desktopOverlay && typeof window.desktopOverlay.trigger === 'function') {
        window.desktopOverlay.trigger();
    }
}

function clearVisualAlert() {
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
        element.textContent = t('stats.warning');
        element.style.color = '#f44336';
    } else {
        element.textContent = t('stats.good');
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

function setSensitivity(value) {
    const normalized = clampInt(value, 0, 100, DEFAULT_SENSITIVITY);
    inputSens.value = String(normalized);
    labelSens.textContent = String(normalized);
    evaluator.setSensitivity(normalized);
}

function setVolume(value) {
    const normalized = clampInt(value, 0, 100, DEFAULT_VOLUME);
    inputVolume.value = String(normalized);
    labelVolume.textContent = `${normalized}%`;
    audioAdapter.setVolume(normalized / 100);
}

function setShowCamera(visible) {
    const normalized = Boolean(visible);
    inputShowCamera.checked = normalized;
    setCameraVisibility(normalized);
}

function setVisualAlertEnabled(enabled) {
    const normalized = Boolean(enabled);
    inputVisualAlert.checked = normalized;
    monitorService.setVisualAlertEnabled(normalized);
    if (!normalized) {
        clearVisualAlert();
    }
}

function setSoundAlertEnabled(enabled) {
    const normalized = Boolean(enabled);
    inputSoundAlert.checked = normalized;
    inputVolume.disabled = !normalized;
    monitorService.setSoundAlertEnabled(normalized);
}

function setPowerSave(enabled) {
    const normalized = Boolean(enabled);
    inputPowerSave.checked = normalized;
    setPowerSaving(normalized);
}

function applyInitialSettings() {
    const settings = loadPersistedSettings();
    setLanguage(settings.language);
    setSensitivity(settings.sensitivity);
    setVolume(settings.volume);
    setShowCamera(settings.showCamera);
    setVisualAlertEnabled(settings.visualAlert);
    setSoundAlertEnabled(settings.soundAlert);
    setPowerSave(settings.powerSave);
}

function closeHelpTips() {
    for (const helpTip of helpTips) {
        helpTip.classList.remove('is-open');
        helpTip.setAttribute('aria-expanded', 'false');
    }
}

function initializeHelpTips() {
    if (!helpTips.length) return;

    for (const helpTip of helpTips) {
        helpTip.setAttribute('aria-expanded', 'false');
        helpTip.addEventListener('click', (event) => {
            event.stopPropagation();
            const shouldOpen = !helpTip.classList.contains('is-open');
            closeHelpTips();
            if (shouldOpen) {
                helpTip.classList.add('is-open');
                helpTip.setAttribute('aria-expanded', 'true');
            }
        });
    }

    document.addEventListener('click', () => {
        closeHelpTips();
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeHelpTips();
        }
    });
}

function syncCanvasSizeToVideo() {
    if (!videoElement.videoWidth || !videoElement.videoHeight) return;
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
}

function setMonitorUi(active) {
    isMonitoring = active;
    btnMonitorToggle.textContent = active
        ? t('controls.stopMonitoring')
        : t('controls.startMonitoring');
    btnMonitorToggle.classList.toggle('is-stop', active);
    btnCalibrate.disabled = !active;
}

function toggleSettingsPanel(forceOpen) {
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : advancedSettings.hidden;
    advancedSettings.hidden = !shouldOpen;
    btnSettingsToggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    btnSettingsToggle.textContent = shouldOpen
        ? t('controls.hideSettings')
        : t('controls.settings');
    if (!shouldOpen) {
        closeHelpTips();
    }
}

function setCalibrationProgress(progress, message) {
    if (!calibrationStatus || !calibrationLabel || !calibrationPercent || !calibrationFill) {
        return;
    }

    const normalized = Math.max(0, Math.min(100, Math.round(progress)));
    calibrationStatus.hidden = false;
    lastCalibrationMessageKey = message || 'status.calibrating';
    calibrationLabel.textContent = t(message || 'status.calibrating');
    calibrationPercent.textContent = `${normalized}%`;
    calibrationFill.style.width = `${normalized}%`;
}

function clearCalibrationProgress() {
    if (!calibrationStatus || !calibrationLabel || !calibrationPercent || !calibrationFill) {
        return;
    }

    calibrationStatus.hidden = true;
    lastCalibrationMessageKey = 'status.calibrating';
    calibrationLabel.textContent = t('status.calibrating');
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
        lastStatusKey = text;
        lastStatusColor = color;
        statusText.textContent = t(text);
        statusIndicator.style.backgroundColor = resolveStatusColor(color);
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
    triggerVisualAlert,
    clearVisualAlert
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
                view.updateStatus('status.mediaPipeNotLoaded', 'red');
                throw new Error('MediaPipe is not available');
            }

            await monitorService.start();
            setMonitorUi(true);
            syncCanvasSizeToVideo();
        }
    } catch (error) {
        console.error('Failed to toggle monitoring:', error);
        view.updateStatus('status.cameraError', 'red');
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
inputLanguage.addEventListener('change', (e) => {
    setLanguage(e.target.value);
    saveCurrentSettings();
});

inputShowCamera.addEventListener('change', (e) => {
    if (isPowerSaving) return;
    setShowCamera(e.target.checked);
    saveCurrentSettings();
});

inputVisualAlert.addEventListener('change', (e) => {
    setVisualAlertEnabled(e.target.checked);
    saveCurrentSettings();
});

inputSoundAlert.addEventListener('change', (e) => {
    setSoundAlertEnabled(e.target.checked);
    saveCurrentSettings();
});

inputSens.addEventListener('input', (e) => {
    setSensitivity(e.target.value);
    saveCurrentSettings();
});

inputPowerSave.addEventListener('change', (e) => {
    setPowerSave(e.target.checked);
    saveCurrentSettings();
});

inputVolume.addEventListener('input', (e) => {
    setVolume(e.target.value);
    saveCurrentSettings();
});

// Handle window resize if needed
window.addEventListener('resize', () => {
    syncCanvasSizeToVideo();
});

// Initialize defaults
setMonitorUi(false);
resetStats();
toggleSettingsPanel(false);
clearCalibrationProgress();
applyInitialSettings();
initializeHelpTips();
view.updateStatus('status.ready', 'gray');
initializeOnboarding();
