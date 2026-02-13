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
    privacyTitle: string;
    privacyBody: string;
  };
  footer: string;
  pages: {
    demo: { title: string; body: string };
    download: { title: string; body: string; mac: string; win: string };
    how: { title: string; body: string };
    faq: { title: string };
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
      "프레임 처리 간격을 제어해 불필요한 연산을 줄이고, 경고는 디바운스로 억제해 조용하지만 확실하게 동작합니다.",
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
      win: "Windows 다운로드"
    },
    how: {
      title: "작동 원리",
      body: "눈/어깨/코/귀 랜드마크 변화량을 기반으로 자세를 평가합니다."
    },
    faq: { title: "자주 묻는 질문" },
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
      "A throttled processing loop reduces unnecessary compute, while debounce logic avoids noisy alerts.",
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
      win: "Download for Windows"
    },
    how: {
      title: "How it works",
      body: "Posture is evaluated from the relative changes of eye/shoulder/nose/ear landmarks."
    },
    faq: { title: "Frequently Asked Questions" },
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
