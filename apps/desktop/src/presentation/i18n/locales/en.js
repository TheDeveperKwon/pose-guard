export default {
    headerSubtitle: 'Monitor posture with minimal distractions',
    videoTip: 'Camera preview is hidden by default.',
    controls: {
        startMonitoring: 'Start Monitoring',
        stopMonitoring: 'Stop Monitoring',
        settings: 'Settings',
        hideSettings: 'Hide Settings',
        recalibrateBaseline: 'Recalibrate Baseline'
    },
    status: {
        ready: 'Ready',
        calibrating: 'Calibrating...',
        cameraError: 'Camera Error',
        stopped: 'Stopped',
        noUserDetected: 'No User Detected',
        monitoring: 'Monitoring',
        mediaPipeNotLoaded: 'MediaPipe not loaded'
    },
    calibration: {
        keepShouldersFace: 'Keep your shoulders and face in frame',
        recalibratingHold: 'Recalibrating... hold steady for a moment',
        noUserKeepShoulders: 'No user detected. Face the camera with shoulders visible',
        keepFullFaceShoulders: 'Keep your full face and shoulders in frame',
        holdPosture: 'Calibrating... hold your posture',
        applyingBaseline: 'Applying baseline...',
        failedRetry: 'Calibration failed. Keep shoulders visible and retry'
    },
    settings: {
        title: 'Advanced Settings',
        note: 'Click or hover the ? icons for explanations.',
        language: 'Language',
        showCamera: 'Show Camera',
        visualAlert: 'Visual Alert',
        soundAlert: 'Sound Alert',
        powerSave: 'Power Saving Mode',
        sensitivity: 'Overall Sensitivity',
        volume: 'Sound Volume',
        helpLanguageLabel: 'Language help',
        helpLanguage: 'Choose the app display language.',
        helpShowCameraLabel: 'Show Camera help',
        helpShowCamera: 'When off, your face is hidden and only posture overlay is shown.',
        helpVisualAlertLabel: 'Visual Alert help',
        helpVisualAlert: 'Shows a fullscreen edge glow when bad posture continues.',
        helpSoundAlertLabel: 'Sound Alert help',
        helpSoundAlert: 'Plays a short alert tone when bad posture continues.',
        helpPowerSaveLabel: 'Power Saving Mode help',
        helpPowerSave: 'Hides preview rendering to reduce CPU and GPU usage.',
        helpSensitivityLabel: 'Overall Sensitivity help',
        helpSensitivity: 'Higher sensitivity reacts faster to posture changes.',
        helpVolumeLabel: 'Sound Volume help',
        helpVolume: 'Used when Sound Alert is enabled.',
        languageOptionKo: '한국어',
        languageOptionEn: 'English'
    },
    stats: {
        turtleNeck: 'Turtle Neck:',
        slouching: 'Slouching:',
        textNeck: 'Text Neck:',
        warning: 'WARNING',
        good: 'Good'
    },
    onboarding: {
        kicker: 'WELCOME',
        title: 'Before starting PoseGuard Lite',
        body: 'First-time users can start immediately with these 3 points.',
        item1Title: 'Camera preview is OFF by default',
        item1Body: 'Your face is not shown right away. You first see posture detection results.',
        item2Title: 'Baseline is set automatically when you start monitoring',
        item2Body: 'Hold a front-facing posture for a few seconds to calibrate baseline.',
        item3Title: 'Use advanced settings only when needed',
        item3Body: 'Start/stop buttons are enough for basic use. Adjust the rest in Settings.',
        confirm: 'Start'
    }
};
