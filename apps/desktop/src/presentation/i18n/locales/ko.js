export default {
    headerSubtitle: '방해 없이 자세를 모니터링하세요',
    videoTip: '카메라 미리보기는 기본적으로 숨김입니다.',
    controls: {
        startMonitoring: '모니터링 시작',
        stopMonitoring: '모니터링 중지',
        settings: '설정',
        hideSettings: '설정 숨기기',
        recalibrateBaseline: '기준 자세 다시 설정'
    },
    status: {
        ready: '준비됨',
        calibrating: '기준 자세 설정 중...',
        cameraError: '카메라 오류',
        stopped: '중지됨',
        noUserDetected: '사용자 감지 안 됨',
        monitoring: '모니터링 중',
        mediaPipeNotLoaded: 'MediaPipe를 불러오지 못했습니다'
    },
    calibration: {
        keepShouldersFace: '어깨와 얼굴이 화면에 보이도록 유지해 주세요',
        recalibratingHold: '다시 기준 설정 중... 잠시 자세를 유지해 주세요',
        noUserKeepShoulders: '사용자가 감지되지 않습니다. 어깨가 보이도록 정면을 바라봐 주세요',
        keepFullFaceShoulders: '얼굴과 어깨가 모두 화면에 보이도록 해 주세요',
        holdPosture: '기준 자세 설정 중... 자세를 유지해 주세요',
        applyingBaseline: '기준 자세를 적용하는 중...',
        failedRetry: '기준 설정에 실패했습니다. 어깨를 보이게 하고 다시 시도해 주세요'
    },
    settings: {
        title: '고급 설정',
        note: '? 아이콘을 클릭하거나 올리면 설명을 볼 수 있습니다.',
        language: '언어',
        showCamera: '카메라 표시',
        visualAlert: '시각 알림',
        soundAlert: '소리 알림',
        powerSave: '절전 모드',
        sensitivity: '민감도',
        volume: '알림 음량',
        helpLanguageLabel: '언어 도움말',
        helpLanguage: '앱 표시 언어를 선택합니다.',
        helpShowCameraLabel: '카메라 표시 도움말',
        helpShowCamera: '끄면 얼굴은 보이지 않고 자세 오버레이만 표시됩니다.',
        helpVisualAlertLabel: '시각 알림 도움말',
        helpVisualAlert: '나쁜 자세가 지속되면 화면 가장자리에 시각 알림이 표시됩니다.',
        helpSoundAlertLabel: '소리 알림 도움말',
        helpSoundAlert: '나쁜 자세가 지속되면 짧은 경고음을 재생합니다.',
        helpPowerSaveLabel: '절전 모드 도움말',
        helpPowerSave: '미리보기 렌더링을 숨겨 CPU/GPU 사용량을 줄입니다.',
        helpSensitivityLabel: '민감도 도움말',
        helpSensitivity: '값이 높을수록 자세 변화에 더 빠르게 반응합니다.',
        helpVolumeLabel: '알림 음량 도움말',
        helpVolume: '소리 알림을 켰을 때 적용됩니다.',
        languageOptionKo: '한국어',
        languageOptionEn: 'English'
    },
    stats: {
        turtleNeck: '거북목:',
        slouching: '구부정한 자세:',
        textNeck: '텍스트 넥:',
        warning: '경고',
        good: '정상'
    },
    onboarding: {
        kicker: '환영합니다',
        title: 'PoseGuard Lite 시작 전에 확인하세요',
        body: '첫 사용자는 아래 3가지만 알면 바로 시작할 수 있습니다.',
        item1Title: '카메라 미리보기는 기본 OFF',
        item1Body: '화면에는 사용자가 바로 노출되지 않고, 판정 결과만 먼저 보입니다.',
        item2Title: '모니터링 시작을 누르면 자동 기준 자세 설정',
        item2Body: '처음 몇 초 동안 정면 자세를 잡으면 기준이 자동으로 캘리브레이션됩니다.',
        item3Title: '세부 설정은 필요할 때만',
        item3Body: '기본 사용은 시작/중지 버튼만으로 충분하고, 나머지는 설정에서 조정할 수 있습니다.',
        confirm: '확인하고 시작'
    }
};
