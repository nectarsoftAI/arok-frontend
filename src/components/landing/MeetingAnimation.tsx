import { useState, useEffect, useRef } from "react";

import avatarFemale from "../../assets/avatars/avatar_female.webp";
import avatarMale from "../../assets/avatars/avatar_male.webp";
import avatarFemaleCasual from "../../assets/avatars/avatar_female_casual.webp";
import avatarMaleGlasses from "../../assets/avatars/avatar_male_glasses.webp";

const PARTICIPANTS = [
  { img: avatarFemale, line: "오늘 회의 안건부터 확인해볼까요?" },
  { img: avatarMale, line: "지난주 대비 진행률이 꽤 올랐네요." },
  { img: avatarFemaleCasual, line: "다음 주까지 마무리하는 걸로 하시죠." },
  { img: avatarMaleGlasses, line: "네, 좋습니다. 바로 반영할게요." },
];

const STAGGER = 1100; // 각 참여자가 등장하는 간격 (ms)
const BUBBLE_DELAY = 380; // 아바타 등장 후 말풍선까지 (ms)
const HOLD = 2000; // 4명 모두 등장한 뒤 유지 (ms)
const FADE_OUT = 600; // 페이드아웃 (ms)
const TOTAL_CYCLE = STAGGER * PARTICIPANTS.length + HOLD + FADE_OUT + 400;

const ALL_HIDDEN = PARTICIPANTS.map(() => false);

/** 실시간 인식 데모 — 아바타와 말풍선이 순차 등장했다가 사라지길 반복 */
export function MeetingAnimation() {
  const [fading, setFading] = useState(false);
  const [avatarVisible, setAvatarVisible] = useState(ALL_HIDDEN);
  const [bubbleVisible, setBubbleVisible] = useState(ALL_HIDDEN);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let timers: ReturnType<typeof setTimeout>[] = [];

    const reveal = (setter: typeof setAvatarVisible, i: number) =>
      setter((prev) => prev.map((v, idx) => (idx === i ? true : v)));

    const runCycle = () => {
      timers.forEach(clearTimeout);
      timers = [];

      setFading(false);
      setAvatarVisible(ALL_HIDDEN);
      setBubbleVisible(ALL_HIDDEN);

      PARTICIPANTS.forEach((_, i) => {
        timers.push(
          setTimeout(() => reveal(setAvatarVisible, i), i * STAGGER),
          setTimeout(() => reveal(setBubbleVisible, i), i * STAGGER + BUBBLE_DELAY),
        );
      });

      timers.push(
        setTimeout(() => setFading(true), STAGGER * PARTICIPANTS.length + HOLD),
        setTimeout(runCycle, TOTAL_CYCLE),
      );
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          runCycle();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      aria-hidden
      className="flex flex-col gap-4 max-w-lg mx-auto w-full"
      style={{ transition: `opacity ${FADE_OUT}ms ease`, opacity: fading ? 0 : 1 }}
    >
      {PARTICIPANTS.map((p, i) => {
        const isRight = i >= 2;
        return (
          <div
            key={p.line}
            className={`flex items-center gap-2.5 w-full justify-start ${isRight ? "flex-row-reverse" : "flex-row"}`}
            style={{
              transition: "opacity 400ms ease, transform 400ms ease",
              opacity: avatarVisible[i] ? 1 : 0,
              transform: avatarVisible[i] ? "translateY(0)" : "translateY(10px)",
            }}
          >
            <div className="w-[72px] h-[72px] rounded-full overflow-hidden flex-shrink-0">
              <img
                src={p.img}
                alt=""
                className="w-full h-full object-cover"
                style={!isRight ? { transform: "scaleX(-1)" } : undefined}
              />
            </div>

            {/* 말풍선 — 꼬리는 테두리색 삼각형 위에 흰색 삼각형을 겹쳐 표현 */}
            <div
              className="relative"
              style={{
                transition: "opacity 350ms ease, transform 350ms ease",
                opacity: bubbleVisible[i] ? 1 : 0,
                transform: bubbleVisible[i] ? "scale(1)" : "scale(0.85)",
                transformOrigin: isRight ? "right center" : "left center",
              }}
            >
              <span
                className="absolute block w-0 h-0 border-solid"
                style={
                  isRight
                    ? { bottom: 9, right: -4, borderWidth: "3px 0 3px 5px", borderColor: "transparent transparent transparent #E5E7EB" }
                    : { bottom: 9, left: -4, borderWidth: "3px 5px 3px 0", borderColor: "transparent #E5E7EB transparent transparent" }
                }
              />
              <span
                className="absolute block w-0 h-0 border-solid"
                style={
                  isRight
                    ? { bottom: 10, right: -3, borderWidth: "2.5px 0 2.5px 4px", borderColor: "transparent transparent transparent #ffffff" }
                    : { bottom: 10, left: -3, borderWidth: "2.5px 4px 2.5px 0", borderColor: "transparent #ffffff transparent transparent" }
                }
              />
              <div className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A1D2E] leading-relaxed whitespace-nowrap">
                {p.line}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
