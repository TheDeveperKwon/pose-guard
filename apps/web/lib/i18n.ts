export const locales = ["ko", "en"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

type Copy = {
  brand: string;
  nav: {
    home: string;
    demo: string;
    download: string;
    howItWorks: string;
    faq: string;
    qna: string;
    sponsor: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaDownload: string;
    ctaDemo: string;
    chips: string[];
  };
  sections: {
    whyTitle: string;
    whyBody: string;
    featuresTitle: string;
    features: Array<{ title: string; body: string }>;
    usageTitle: string;
    usageSteps: Array<{ title: string; body: string }>;
    quickDownloadTitle: string;
    quickDownloadBody: string;
    privacyTitle: string;
    privacyBody: string;
  };
  footer: string;
  pages: {
    demo: { title: string; body: string };
    download: {
      title: string;
      body: string;
      mac: string;
      win: string;
      meta: {
        title: string;
        versionLabel: string;
        publishedLabel: string;
        releaseNotesLabel: string;
        windowsLabel: string;
      };
    };
    how: {
      title: string;
      body: string;
      steps: Array<{ title: string; body: string }>;
    };
    faq: {
      title: string;
      questions: Array<{ q: string; a: string }>;
    };
    changelog: { title: string };
    privacy: { title: string; body: string };
    qna: { title: string; body: string };
    sponsor: { title: string; body: string };
  };
};

const ko: Copy = {
  brand: "PoseGuard",
  nav: {
    home: "홈",
    demo: "데모",
    download: "다운로드",
    howItWorks: "작동 원리",
    faq: "FAQ",
    qna: "Q&A",
    sponsor: "스폰서"
  },
  hero: {
    title: "저전력, 고성능 자세 모니터링",
    subtitle:
      "PoseGuard는 실시간 자세 분석을 통해 거북목/구부정/텍스트넥을 감지하고 집중 흐름을 방해하지 않도록 조용하게 알려줍니다.",
    ctaDownload: "앱 다운로드",
    ctaDemo: "웹 데모 시작",
    chips: ["Real-time", "Low Power", "On-device", "KR/EN"]
  },
  sections: {
    whyTitle: "왜 PoseGuard인가",
    whyBody:
      "우리는 바른 자세를 의지가 아니라 시스템으로 만들고 싶었습니다. PoseGuard는 자세가 무너지는 순간을 AI로 포착해 조용하고 빠르게 알려줍니다. 그 한 번의 알림이 쌓여, 결국 건강한 습관이 됩니다.",
    featuresTitle: "핵심 기능",
    features: [
      {
        title: "실시간 포즈 추정",
        body: "MediaPipe Pose 기반의 랜드마크 추정과 시각화."
      },
      {
        title: "Baseline 기반 판정",
        body: "개인별 기준 자세를 캡처해 상대 변화로 판정."
      },
      {
        title: "저소음 경고 설계",
        body: "나쁜 자세가 일정 시간 유지될 때만 알림."
      }
    ],
    usageTitle: "프로그램 사용 방법",
    usageSteps: [
      {
        title: "1. 앱 실행 후 모니터링 시작",
        body: "Start Monitoring 버튼을 눌러 웹캠 기반 자세 추적을 시작합니다."
      },
      {
        title: "2. 기준 자세 설정",
        body: "자세를 바르게 한 상태에서 Set Baseline을 눌러 개인 기준을 저장합니다."
      },
      {
        title: "3. 경고 확인 및 민감도 조정",
        body: "거북목/구부정/텍스트넥 지표를 확인하고 민감도와 볼륨을 조절합니다."
      }
    ],
    quickDownloadTitle: "바로 시작하기",
    quickDownloadBody: "OS별 설치 파일을 바로 내려받아 1분 안에 자세 모니터링을 시작할 수 있습니다.",
    privacyTitle: "프라이버시 우선",
    privacyBody:
      "웹 데모는 브라우저에서 처리되며, 영상 업로드 없이 로컬에서 분석됩니다."
  },
  footer: "PoseGuard. Minimal posture intelligence.",
  pages: {
    demo: {
      title: "실시간 웹캠 데모",
      body: "브라우저 카메라 권한을 허용하면 자세 추정이 시작됩니다."
    },
    download: {
      title: "다운로드",
      body: "아래 버튼에서 OS별 설치 파일을 받으세요.",
      mac: "macOS 다운로드",
      win: "Windows 다운로드",
      meta: {
        title: "배포 메타데이터",
        versionLabel: "버전",
        publishedLabel: "배포일",
        releaseNotesLabel: "릴리스 노트",
        windowsLabel: "Windows"
      }
    },
    how: {
      title: "작동 원리",
      body: "눈/어깨/코/귀 랜드마크 변화량을 기반으로 자세를 평가합니다.",
      steps: [
        {
          title: "1. 랜드마크 추출",
          body: "카메라 프레임에서 MediaPipe Pose가 얼굴과 어깨 주변의 핵심 랜드마크를 추적합니다."
        },
        {
          title: "2. 기준선 비교",
          body: "첫 기준 자세와 현재 프레임을 비교해 경사·거리 변화 지표를 계산합니다."
        },
        {
          title: "3. 경고 판단",
          body: "지표가 임계값보다 오래 유지되면 경고 신호를 발생해 즉시 피드백을 보여줍니다."
        }
      ]
    },
    faq: {
      title: "자주 묻는 질문",
      questions: [
        {
          q: "웹캠 영상이 서버로 전송되나요?",
          a: "아니요. 분석은 브라우저에서 처리되며, 영상 파일은 업로드되지 않습니다."
        },
        {
          q: "컴퓨터가 느려지는 이유가 있나요?",
          a: "가능하면 720p 이하, FPS를 낮춰서 사용하면 부하가 더 줄어듭니다."
        },
        {
          q: "다운로드한 앱이 막혀 보이면 어떻게 하나요?",
          a: "웹의 다운로드 페이지에 있는 설치 안내를 따라 실행하세요."
        }
      ]
    },
    changelog: { title: "변경 이력" },
    privacy: {
      title: "개인정보 안내",
      body: "카메라 프레임은 브라우저 메모리에서만 처리됩니다."
    },
    qna: {
      title: "Q&A 게시판",
      body: "질문/답변 기능은 다음 단계에서 DB와 인증을 연동해 확장됩니다."
    },
    sponsor: {
      title: "스폰서",
      body: "파트너/스폰서 소개 섹션은 운영 요구에 맞게 확장 가능합니다."
    }
  }
};

const en: Copy = {
  brand: "PoseGuard",
  nav: {
    home: "Home",
    demo: "Demo",
    download: "Download",
    howItWorks: "How It Works",
    faq: "FAQ",
    qna: "Q&A",
    sponsor: "Sponsor"
  },
  hero: {
    title: "Low-power, high-performance posture monitoring",
    subtitle:
      "PoseGuard detects turtle neck, slouching, and text neck in real time, then alerts quietly without breaking your focus.",
    ctaDownload: "Download App",
    ctaDemo: "Try Web Demo",
    chips: ["Real-time", "Low Power", "On-device", "KR/EN"]
  },
  sections: {
    whyTitle: "Why PoseGuard",
    whyBody:
      "We believe good posture should be a system, not just willpower. PoseGuard catches posture breakdown the moment it happens and gives a quiet, immediate alert. Those small moments add up to lasting healthy habits.",
    featuresTitle: "Core Features",
    features: [
      {
        title: "Real-time pose estimation",
        body: "Landmark estimation and rendering powered by MediaPipe Pose."
      },
      {
        title: "Baseline-aware evaluation",
        body: "Capture your own baseline posture and score relative changes."
      },
      {
        title: "Quiet alert behavior",
        body: "Warn only after bad posture persists for a configured duration."
      }
    ],
    usageTitle: "How to use the app",
    usageSteps: [
      {
        title: "1. Start monitoring",
        body: "Click Start Monitoring to begin webcam-based posture tracking."
      },
      {
        title: "2. Set your baseline",
        body: "Sit upright and click Set Baseline to store your personal reference posture."
      },
      {
        title: "3. Tune and monitor alerts",
        body: "Watch turtle/slouch/text-neck indicators and adjust sensitivity and volume."
      }
    ],
    quickDownloadTitle: "Get started in under a minute",
    quickDownloadBody: "Download the app for your OS and start posture tracking immediately.",
    privacyTitle: "Privacy first",
    privacyBody:
      "The web demo runs in the browser. No video upload is required for analysis."
  },
  footer: "PoseGuard. Minimal posture intelligence.",
  pages: {
    demo: {
      title: "Live webcam demo",
      body: "Allow camera access in your browser to start real-time estimation."
    },
    download: {
      title: "Download",
      body: "Get OS-specific installers from the buttons below.",
      mac: "Download for macOS",
      win: "Download for Windows",
      meta: {
        title: "Release metadata",
        versionLabel: "Version",
        publishedLabel: "Published",
        releaseNotesLabel: "Release notes",
        windowsLabel: "Windows"
      }
    },
    how: {
      title: "How it works",
      body: "Posture is evaluated from the relative changes of eye/shoulder/nose/ear landmarks.",
      steps: [
        {
          title: "1. Landmark extraction",
          body: "MediaPipe Pose extracts key landmarks from your webcam frame continuously."
        },
        {
          title: "2. Relative comparison",
          body: "The current posture is compared with your baseline to measure tilt and drift."
        },
        {
          title: "3. Alert decision",
          body: "If posture risk stays high over time, the app triggers quiet feedback."
        }
      ]
    },
    faq: {
      title: "Frequently Asked Questions",
      questions: [
        {
          q: "Are webcam frames uploaded to a server?",
          a: "No. The demo processing runs in-browser and frames are not uploaded."
        },
        {
          q: "Can this affect performance?",
          a: "You can reduce workload by lowering lighting issues and running in a smaller resolution."
        },
        {
          q: "What if the downloaded app is blocked on first run?",
          a: "Follow the installation notice on the Download page."
        }
      ]
    },
    changelog: { title: "Changelog" },
    privacy: {
      title: "Privacy Notice",
      body: "Camera frames are processed in browser memory only."
    },
    qna: {
      title: "Q&A Board",
      body: "Question/answer features will be extended with DB and auth in the next phase."
    },
    sponsor: {
      title: "Sponsors",
      body: "Partner/sponsor sections can scale based on your operation model."
    }
  }
};

export function getCopy(locale: Locale): Copy {
  return locale === "ko" ? ko : en;
}
