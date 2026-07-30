import { useEffect } from "react";

const css = `
  @keyframes waveFlow1 {
    0%   { d: path("M-100,200 C100,120 300,280 500,180 C700,80 900,220 1100,160 C1300,100 1500,200 1700,150 L1700,600 L-100,600 Z"); }
    33%  { d: path("M-100,220 C150,100 350,260 550,200 C750,140 950,240 1150,140 C1350,40 1550,180 1700,130 L1700,600 L-100,600 Z"); }
    66%  { d: path("M-100,180 C50,140 250,300 450,160 C650,20 850,200 1050,180 C1250,160 1450,220 1700,170 L1700,600 L-100,600 Z"); }
    100% { d: path("M-100,200 C100,120 300,280 500,180 C700,80 900,220 1100,160 C1300,100 1500,200 1700,150 L1700,600 L-100,600 Z"); }
  }
  @keyframes waveFlow2 {
    0%   { d: path("M-100,280 C200,200 400,340 600,240 C800,140 1000,300 1200,220 C1400,140 1600,260 1700,210 L1700,600 L-100,600 Z"); }
    33%  { d: path("M-100,260 C100,180 300,360 500,260 C700,160 900,320 1100,200 C1300,80 1500,240 1700,190 L1700,600 L-100,600 Z"); }
    66%  { d: path("M-100,300 C150,220 350,320 550,220 C750,120 950,280 1150,240 C1350,200 1550,280 1700,230 L1700,600 L-100,600 Z"); }
    100% { d: path("M-100,280 C200,200 400,340 600,240 C800,140 1000,300 1200,220 C1400,140 1600,260 1700,210 L1700,600 L-100,600 Z"); }
  }
  @keyframes waveFlow3 {
    0%   { d: path("M-100,350 C150,280 350,400 550,310 C750,220 950,380 1150,290 C1350,200 1550,340 1700,280 L1700,600 L-100,600 Z"); }
    33%  { d: path("M-100,330 C200,260 400,380 600,290 C800,200 1000,360 1200,310 C1400,260 1600,360 1700,300 L1700,600 L-100,600 Z"); }
    66%  { d: path("M-100,370 C100,300 300,420 500,330 C700,240 900,400 1100,270 C1300,140 1500,320 1700,260 L1700,600 L-100,600 Z"); }
    100% { d: path("M-100,350 C150,280 350,400 550,310 C750,220 950,380 1150,290 C1350,200 1550,340 1700,280 L1700,600 L-100,600 Z"); }
  }

  @keyframes gradientDrift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes floatOrb1 {
    0%   { transform: translate(0px, 0px) scale(1); }
    33%  { transform: translate(30px, -20px) scale(1.05); }
    66%  { transform: translate(-20px, 15px) scale(0.97); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes floatOrb2 {
    0%   { transform: translate(0px, 0px) scale(1); }
    33%  { transform: translate(-25px, 20px) scale(0.95); }
    66%  { transform: translate(20px, -15px) scale(1.04); }
    100% { transform: translate(0px, 0px) scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .flowing-bg-wave, .flowing-bg-orb, .flowing-bg-gradient { animation: none !important; }
  }

  .flowing-bg-root {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .flowing-bg-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg,
      #f8faff 0%,
      #eef2ff 25%,
      #f0f7ff 50%,
      #f5f0ff 75%,
      #f8faff 100%
    );
    background-size: 400% 400%;
    animation: gradientDrift 18s ease-in-out infinite;
  }

  .flowing-bg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    pointer-events: none;
  }

  .flowing-bg-orb-1 {
    width: 45%;
    height: 55%;
    top: -10%;
    left: -5%;
    background: radial-gradient(circle,
      rgba(34, 211, 238, 0.20) 0%,
      rgba(147, 197, 253, 0.14) 50%,
      transparent 70%
    );
    animation: floatOrb1 14s ease-in-out infinite;
  }

  .flowing-bg-orb-2 {
    width: 50%;
    height: 60%;
    bottom: -15%;
    right: -10%;
    background: radial-gradient(circle,
      rgba(91, 95, 245, 0.18) 0%,
      rgba(167, 139, 250, 0.12) 50%,
      transparent 70%
    );
    animation: floatOrb2 16s ease-in-out infinite;
  }

  .flowing-bg-orb-3 {
    width: 30%;
    height: 35%;
    top: 30%;
    left: 35%;
    background: radial-gradient(circle,
      rgba(199, 210, 254, 0.15) 0%,
      rgba(224, 231, 255, 0.08) 50%,
      transparent 70%
    );
    animation: floatOrb1 20s ease-in-out infinite reverse;
  }

  .flowing-bg-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .flowing-bg-wave-1 { animation: waveFlow1 12s ease-in-out infinite; }
  .flowing-bg-wave-2 { animation: waveFlow2 15s ease-in-out infinite; }
  .flowing-bg-wave-3 { animation: waveFlow3 18s ease-in-out infinite; }

  .flowing-bg-content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
  }

  /* ── 다크(비비드 파스텔) 변형 ─────────────────── */
  .flowing-bg-dark .flowing-bg-gradient {
    background: linear-gradient(135deg,
      #6a6fe0 0%,
      #8478e6 28%,
      #7d8fe6 55%,
      #9585e6 80%,
      #6a6fe0 100%
    );
    background-size: 400% 400%;
  }
  .flowing-bg-dark .flowing-bg-orb-1 {
    background: radial-gradient(circle, rgba(34,211,238,0.28) 0%, rgba(147,197,253,0.16) 50%, transparent 70%);
  }
  .flowing-bg-dark .flowing-bg-orb-2 {
    background: radial-gradient(circle, rgba(129,140,248,0.30) 0%, rgba(167,139,250,0.16) 50%, transparent 70%);
  }
  .flowing-bg-dark .flowing-bg-orb-3 {
    background: radial-gradient(circle, rgba(199,210,254,0.22) 0%, rgba(167,139,250,0.12) 50%, transparent 70%);
  }
  .flowing-bg-dark .flowing-bg-wave-1 { fill: url(#wave-grad-1-dark); }
  .flowing-bg-dark .flowing-bg-wave-2 { fill: url(#wave-grad-2-dark); }
  .flowing-bg-dark .flowing-bg-wave-3 { fill: url(#wave-grad-3-dark); }
`;

type FlowingBackgroundProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** light: 밝은 파스텔(기본) / dark: 진한 인디고 (흰 글씨용) */
  variant?: "light" | "dark";
};

/** 흐르는 웨이브 + 떠다니는 광구가 있는 몽환적 배경 래퍼 */
export function FlowingBackground({ children, className = "", style, variant = "light" }: FlowingBackgroundProps) {
  // keyframes 는 전역 <style> 로 1회만 주입
  useEffect(() => {
    if (document.getElementById("flowing-bg-css")) return;
    const el = document.createElement("style");
    el.id = "flowing-bg-css";
    el.textContent = css;
    document.head.appendChild(el);
  }, []);

  return (
    <div className={`flowing-bg-root ${variant === "dark" ? "flowing-bg-dark" : ""} ${className}`} style={style}>
      {/* 베이스 그라디언트 */}
      <div className="flowing-bg-gradient" />

      {/* 떠다니는 광구 */}
      <div className="flowing-bg-orb flowing-bg-orb-1" />
      <div className="flowing-bg-orb flowing-bg-orb-2" />
      <div className="flowing-bg-orb flowing-bg-orb-3" />

      {/* 흐르는 웨이브 SVG */}
      <svg
        className="flowing-bg-svg"
        viewBox="0 0 1600 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="wave-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.20" />
            <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#5B5FF5" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="wave-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.24" />
            <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="wave-grad-3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5B5FF5" stopOpacity="0.16" />
            <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.14" />
          </linearGradient>

          {/* 다크(비비드 파스텔) 변형용 — 밝은 진주빛 물결 */}
          <linearGradient id="wave-grad-1-dark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.16" />
            <stop offset="50%" stopColor="#c7d2fe" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="wave-grad-2-dark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ede9fe" stopOpacity="0.20" />
            <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.17" />
            <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="wave-grad-3-dark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.16" />
            <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        <path
          className="flowing-bg-wave flowing-bg-wave-1"
          d="M-100,200 C100,120 300,280 500,180 C700,80 900,220 1100,160 C1300,100 1500,200 1700,150 L1700,600 L-100,600 Z"
          fill="url(#wave-grad-1)"
        />
        <path
          className="flowing-bg-wave flowing-bg-wave-2"
          d="M-100,280 C200,200 400,340 600,240 C800,140 1000,300 1200,220 C1400,140 1600,260 1700,210 L1700,600 L-100,600 Z"
          fill="url(#wave-grad-2)"
        />
        <path
          className="flowing-bg-wave flowing-bg-wave-3"
          d="M-100,350 C150,280 350,400 550,310 C750,220 950,380 1150,290 C1350,200 1550,340 1700,280 L1700,600 L-100,600 Z"
          fill="url(#wave-grad-3)"
        />
      </svg>

      {/* 콘텐츠 */}
      <div className="flowing-bg-content">{children}</div>
    </div>
  );
}
