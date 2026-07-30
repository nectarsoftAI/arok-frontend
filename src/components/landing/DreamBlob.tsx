import { useEffect } from "react";

const css = `
  @keyframes morphDream {
    0%   { border-radius: 62% 38% 46% 54% / 60% 44% 56% 40%; transform: rotate(0deg) scale(1); }
    20%  { border-radius: 40% 60% 54% 46% / 48% 62% 38% 52%; transform: rotate(18deg) scale(1.04); }
    40%  { border-radius: 54% 46% 38% 62% / 56% 34% 66% 44%; transform: rotate(-8deg) scale(0.97); }
    60%  { border-radius: 38% 62% 60% 40% / 40% 56% 44% 60%; transform: rotate(12deg) scale(1.03); }
    80%  { border-radius: 56% 44% 48% 52% / 62% 40% 60% 38%; transform: rotate(-4deg) scale(0.99); }
    100% { border-radius: 62% 38% 46% 54% / 60% 44% 56% 40%; transform: rotate(0deg) scale(1); }
  }

  @keyframes floatDream {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }

  @keyframes hueRotate {
    0%   { filter: hue-rotate(0deg) blur(0px); }
    50%  { filter: hue-rotate(30deg) blur(0.5px); }
    100% { filter: hue-rotate(0deg) blur(0px); }
  }

  @keyframes innerSwirl {
    0%   { transform: rotate(0deg) scale(1); opacity: 0.6; }
    50%  { transform: rotate(180deg) scale(1.1); opacity: 0.9; }
    100% { transform: rotate(360deg) scale(1); opacity: 0.6; }
  }

  @keyframes glowPulse {
    0%   { opacity: 0.3; transform: scale(0.9); }
    50%  { opacity: 0.6; transform: scale(1.05); }
    100% { opacity: 0.3; transform: scale(0.9); }
  }

  @media (prefers-reduced-motion: reduce) {
    .dream-blob, .dream-inner-1, .dream-inner-2, .dream-float, .dream-glow { animation: none !important; }
  }

  .dream-scene {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .dream-float {
    animation: floatDream 6s ease-in-out infinite;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dream-glow {
    position: absolute;
    inset: -30%;
    border-radius: 50%;
    background: radial-gradient(circle,
      rgba(167, 139, 250, 0.18) 0%,
      rgba(34, 211, 238, 0.10) 40%,
      transparent 70%
    );
    animation: glowPulse 5s ease-in-out infinite;
    filter: blur(8px);
  }

  .dream-blob {
    position: relative;
    border-radius: 62% 38% 46% 54% / 60% 44% 56% 40%;
    animation:
      morphDream 10s ease-in-out infinite,
      hueRotate 8s ease-in-out infinite;
    overflow: hidden;
  }

  .dream-inner-1 {
    position: absolute;
    inset: 8%;
    border-radius: 50%;
    background: conic-gradient(
      from 200deg,
      rgba(34, 211, 238, 0.55),
      rgba(148, 163, 250, 0.45),
      rgba(216, 180, 254, 0.40),
      rgba(167, 243, 208, 0.30),
      rgba(91, 95, 245, 0.50),
      rgba(34, 211, 238, 0.55)
    );
    filter: blur(6px);
    animation: innerSwirl 12s linear infinite;
  }

  .dream-inner-2 {
    position: absolute;
    inset: 18%;
    border-radius: 50%;
    background: radial-gradient(circle at 38% 35%,
      rgba(255, 255, 255, 0.75) 0%,
      rgba(255, 255, 255, 0.2) 40%,
      rgba(167, 139, 250, 0.1) 70%,
      transparent 100%
    );
    animation: innerSwirl 16s linear infinite reverse;
    filter: blur(2px);
  }

  .dream-surface {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background:
      radial-gradient(ellipse at 30% 25%,
        rgba(255,255,255,0.55) 0%,
        rgba(255,255,255,0.0) 55%
      ),
      radial-gradient(ellipse at 70% 75%,
        rgba(91,95,245,0.08) 0%,
        transparent 60%
      );
    pointer-events: none;
  }
`;

type DreamBlobProps = {
  /** 블롭 지름(px). 실제 컨테이너는 이 값의 1.6배 (글로우 여백 포함) */
  size?: number;
  className?: string;
};

/** 몽환적으로 모핑하며 떠다니는 그라디언트 블롭 */
export function DreamBlob({ size = 180, className = "" }: DreamBlobProps) {
  // keyframes 는 전역 <style> 로 1회만 주입 (반복 마운트에도 재주입하지 않음)
  useEffect(() => {
    if (document.getElementById("dream-blob-css")) return;
    const el = document.createElement("style");
    el.id = "dream-blob-css";
    el.textContent = css;
    document.head.appendChild(el);
  }, []);

  const blobStyle: React.CSSProperties = {
    width: size,
    height: size,
    background: `
      radial-gradient(ellipse at 45% 40%,
        rgba(199, 210, 254, 0.85) 0%,
        rgba(147, 197, 253, 0.60) 30%,
        rgba(91, 95, 245, 0.35) 60%,
        rgba(34, 211, 238, 0.20) 80%,
        transparent 100%
      )
    `,
    boxShadow: `
      inset 0 0 ${size * 0.2}px rgba(255,255,255,0.6),
      inset 0 0 ${size * 0.4}px rgba(167,139,250,0.15),
      0 ${size * 0.04}px ${size * 0.2}px rgba(91,95,245,0.12),
      0 ${size * 0.08}px ${size * 0.35}px rgba(34,211,238,0.08)
    `,
  };

  return (
    <div className={`dream-scene ${className}`} style={{ width: size * 1.6, height: size * 1.6 }}>
      <div className="dream-float">
        <div className="dream-glow" />
        <div className="dream-blob" style={blobStyle}>
          <div className="dream-inner-1" />
          <div className="dream-inner-2" />
          <div className="dream-surface" />
        </div>
      </div>
    </div>
  );
}
