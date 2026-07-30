import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Square } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SpeakerAvatar } from "../common/SpeakerAvatar";
import { Badge } from "../common/Badge";
import { DreamBlob } from "./DreamBlob";

import avatarFemale from "../../assets/avatars/avatar_female.webp";
import avatarMale from "../../assets/avatars/avatar_male.webp";
import avatarFemaleCasual from "../../assets/avatars/avatar_female_casual.webp";
import avatarMaleGlasses from "../../assets/avatars/avatar_male_glasses.webp";

type Phase = "collecting" | "processing" | "result";

// 화자 색상은 실제 상세 페이지와 동일한 SPEAKER_PALETTE 순서를 따른다.
const PEOPLE = [
  { img: avatarFemale, color: "#5B5FF5", name: "이수연", line: "오늘 회의 안건부터 확인해볼까요?" },
  { img: avatarMale, color: "#22D3EE", name: "김민준", line: "지난주 대비 진행률이 꽤 올랐네요." },
  { img: avatarFemaleCasual, color: "#F59E0B", name: "최유나", line: "다음 주까지 마무리하는 걸로 하시죠." },
  { img: avatarMaleGlasses, color: "#EC4899", name: "박지훈", line: "네, 좋습니다. 바로 반영할게요." },
];

// 실제 SummaryDisplay 의 섹션 구조(주요 내용 / 결정 사항 / 후속 조치 / 키워드)를 그대로 재현
const SUMMARY_BLOCKS = [
  {
    title: "주요 내용",
    render: () => (
      <ul className="space-y-2">
        {["지난주 대비 프로젝트 진행률이 상승했습니다.", "다음 주까지 현재 안건을 마무리하기로 했습니다."].map((t) => (
          <li key={t} className="flex gap-2 text-sm text-[#1A1D2E]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5B5FF5] mt-1.5 flex-shrink-0" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "결정 사항",
    render: () => (
      <ul className="space-y-2">
        <li className="flex gap-2 text-sm text-[#1A1D2E]">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
          <span>안건 마감일을 다음 주로 확정</span>
        </li>
      </ul>
    ),
  },
  {
    title: "후속 조치",
    render: () => (
      <ul className="space-y-2">
        <li className="flex items-start gap-2 text-sm">
          <Square className="w-4 h-4 text-[#6B7280] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-[#1A1D2E]">논의 내용 반영 및 업데이트</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="primary">박지훈</Badge>
              <Badge variant="warning">다음 주</Badge>
            </div>
          </div>
        </li>
      </ul>
    ),
  },
  {
    title: "키워드",
    render: () => (
      <div className="flex flex-wrap gap-2">
        {["진행률", "마감일", "안건"].map((k) => (
          <Badge key={k} variant="primary" size="md">
            {k}
          </Badge>
        ))}
      </div>
    ),
  },
];

// ── 타이밍 (ms) ──────────────────────────────────────────
const STAGGER = 900; // 참여자 등장 간격
const BUBBLE_DELAY = 320; // 아바타 → 말풍선
const COLLECT_HOLD = 700; // 마지막 말풍선 후 대기
const PROCESS_MS = 1700; // AI 처리 연출 시간
const TX_STAGGER = 180; // 결과: transcript 행 등장 간격
const SUM_START = 600; // 결과: 요약 블록 등장 시작 지연
const SUM_STAGGER = 340; // 결과: 요약 블록 등장 간격
const RESULT_HOLD = 3400; // 결과 유지 후 루프

const ALL_HIDDEN = PEOPLE.map(() => false);
const ALL_SHOWN = PEOPLE.map(() => true);

const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * 랜딩용 파이프라인 데모.
 * 대화 수집(collecting) → AI 처리(processing) → 회의록 완성(result) 을 자동 재생·루프한다.
 * 결과 화면은 실제 MeetingDetailScreen 의 좌(대화)/우(요약) 2단 구조를 그대로 본떠 렌더한다.
 */
export function PipelineAnimation() {
  // 모션 최소화 설정 시: 애니메이션 없이 최종 결과 화면만 정적으로 노출 (초기값으로 결정)
  const [reduceMotion] = useState(prefersReducedMotion);
  const [phase, setPhase] = useState<Phase>(reduceMotion ? "result" : "collecting");
  const [avatarVisible, setAvatarVisible] = useState(reduceMotion ? ALL_SHOWN : ALL_HIDDEN);
  const [bubbleVisible, setBubbleVisible] = useState(reduceMotion ? ALL_SHOWN : ALL_HIDDEN);
  const [txShown, setTxShown] = useState(reduceMotion ? PEOPLE.length : 0); // 등장한 transcript 행 수
  const [sumShown, setSumShown] = useState(reduceMotion ? SUMMARY_BLOCKS.length : 0); // 등장한 요약 블록 수
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduceMotion) return;

    let timers: ReturnType<typeof setTimeout>[] = [];
    const revealAt = (setter: typeof setAvatarVisible, i: number) =>
      setter((prev) => prev.map((v, idx) => (idx === i ? true : v)));

    const run = () => {
      timers.forEach(clearTimeout);
      timers = [];

      setPhase("collecting");
      setAvatarVisible(ALL_HIDDEN);
      setBubbleVisible(ALL_HIDDEN);
      setTxShown(0);
      setSumShown(0);

      PEOPLE.forEach((_, i) => {
        timers.push(
          setTimeout(() => revealAt(setAvatarVisible, i), i * STAGGER),
          setTimeout(() => revealAt(setBubbleVisible, i), i * STAGGER + BUBBLE_DELAY),
        );
      });

      const collectEnd = PEOPLE.length * STAGGER + COLLECT_HOLD;
      timers.push(setTimeout(() => setPhase("processing"), collectEnd));

      const resultStart = collectEnd + PROCESS_MS;
      timers.push(setTimeout(() => setPhase("result"), resultStart));
      PEOPLE.forEach((_, i) => timers.push(setTimeout(() => setTxShown(i + 1), resultStart + i * TX_STAGGER)));
      SUMMARY_BLOCKS.forEach((_, j) =>
        timers.push(setTimeout(() => setSumShown(j + 1), resultStart + SUM_START + j * SUM_STAGGER)),
      );

      timers.push(setTimeout(run, resultStart + RESULT_HOLD));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [reduceMotion]);

  const processing = phase === "processing";

  return (
    <div ref={sectionRef} aria-hidden className="relative w-full max-w-3xl mx-auto">
      {/* 높이 기준: 결과 카드는 항상 렌더되어 stage 높이를 '가장 큰 단계'로 고정한다.
          단계가 바뀌어도 컨테이너 높이가 변하지 않아 아래 콘텐츠가 밀리지 않는다. */}
      <motion.div
        className="w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-xl shadow-black/5 overflow-hidden text-left"
        style={{ pointerEvents: "none" }}
        animate={{ opacity: phase === "result" ? 1 : 0, y: phase === "result" ? 0 : 12 }}
        transition={{ duration: 0.5 }}
      >
        <div className="px-5 py-3 border-b border-[#E5E7EB]">
          <span className="font-semibold text-sm text-[#1A1D2E]">주간 진행 상황 회의</span>
        </div>

        <div className="grid md:grid-cols-[1fr_0.8fr]">
          {/* 좌: 대화 내용 */}
          <div className="p-4 space-y-3 md:border-r border-[#E5E7EB]">
            <p className="text-xs font-semibold text-[#6B7280] mb-4">대화 내용</p>
            {PEOPLE.map((p, i) => (
              <div
                key={p.name}
                className="flex gap-2.5"
                style={{
                  transition: "opacity 300ms ease, transform 300ms ease",
                  opacity: i < txShown ? 1 : 0,
                  transform: i < txShown ? "translateY(0)" : "translateY(6px)",
                }}
              >
                <SpeakerAvatar letter={p.name.charAt(0)} color={p.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#6B7280] mb-0.5">{p.name}</div>
                  <div className="bg-[#F3F4F6] rounded-xl px-3 py-2 text-sm text-[#1A1D2E] leading-relaxed">{p.line}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 우: AI 요약 */}
          <div className="p-4 space-y-4 bg-[#5B5FF5]/[0.02]">
            <p className="text-xs font-semibold text-[#6B7280]">AI 요약</p>
            {SUMMARY_BLOCKS.map((block, j) => (
              <div
                key={block.title}
                className={`space-y-2 ${j > 0 ? "pt-3 border-t border-[#E5E7EB]" : ""}`}
                style={{
                  transition: "opacity 350ms ease, transform 350ms ease",
                  opacity: j < sumShown ? 1 : 0,
                  transform: j < sumShown ? "translateY(0)" : "translateY(8px)",
                }}
              >
                <h4 className="font-semibold text-[#1A1D2E] text-sm">{block.title}</h4>
                {block.render()}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 대화 수집 + AI 처리 단계 — absolute 로 결과 카드 위에 겹쳐 stage 높이에 영향 주지 않음 */}
      <AnimatePresence>
        {phase !== "result" && (
          <motion.div
            key="chat"
            className="absolute inset-0 flex items-center justify-center px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative w-full flex flex-col gap-4 max-w-lg mx-auto">
              <div
                className="flex flex-col gap-4"
                style={{
                  transition: "opacity 500ms ease, transform 500ms ease, filter 500ms ease",
                  opacity: processing ? 0.1 : 1,
                  transform: processing ? "scale(0.9)" : "scale(1)",
                  filter: processing ? "blur(4px)" : "none",
                }}
              >
                {PEOPLE.map((p, i) => {
                  const isRight = i >= 2;
                  return (
                    <div
                      key={p.name}
                      className={`flex items-center gap-2.5 w-full justify-start ${isRight ? "flex-row-reverse" : "flex-row"}`}
                      style={{
                        transition: "opacity 400ms ease, transform 400ms ease",
                        opacity: avatarVisible[i] ? 1 : 0,
                        transform: avatarVisible[i] ? "translateY(0)" : "translateY(10px)",
                      }}
                    >
                      <div className="w-[64px] h-[64px] rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={p.img}
                          alt=""
                          className="w-full h-full object-cover"
                          style={!isRight ? { transform: "scaleX(-1)" } : undefined}
                        />
                      </div>
                      <div
                        className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A1D2E] leading-relaxed max-w-[240px] shadow-sm"
                        style={{
                          transition: "opacity 350ms ease, transform 350ms ease",
                          opacity: bubbleVisible[i] ? 1 : 0,
                          transform: bubbleVisible[i] ? "scale(1)" : "scale(0.85)",
                          transformOrigin: isRight ? "right center" : "left center",
                        }}
                      >
                        {p.line}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI 처리 연출 */}
              <AnimatePresence>
                {processing && (
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <DreamBlob size={150} />
                    <p className="-mt-2 text-sm font-medium text-[#4F53E8]">AI가 회의록을 정리하고 있어요…</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
