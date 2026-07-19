type ScreenshotProps = {
  src: string;
  alt: string;
  /** light: 밝은 배경 위 / dark: 어두운 배경 위 (그림자 강도 차이) */
  variant?: "light" | "dark";
  className?: string;
};

const SHADOW = {
  light: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
  dark: "0 24px 64px rgba(0,0,0,0.4)",
} as const;

/** 브라우저 프레임 없는 제품 스크린샷 카드 */
export function Screenshot({ src, alt, variant = "light", className = "" }: ScreenshotProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`w-full rounded-2xl object-contain ${className}`}
      style={{ boxShadow: SHADOW[variant] }}
    />
  );
}
