import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router";
import {
  Zap,
  CheckCircle,
  ArrowRight,
  Twitter,
  Linkedin,
  Youtube,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { FadeIn } from "../landing/FadeIn";
import { Screenshot } from "../landing/Screenshot";
import { PipelineAnimation } from "../landing/PipelineAnimation";
import { FAQItem } from "../landing/FAQItem";
import { SECTION_IDS, NAV_ITEMS, scrollToSection, type SectionId } from "../landing/sections";

import logoArok from "../../assets/logo_arok.webp";
import meetingListShot from "../../assets/images/meeting_list_screenshot.webp";
import meetingDetailShot from "../../assets/images/meeting_detail_screenshot.webp";
import iconClock from "../../assets/icons/clock_icon.webp";
import iconTarget from "../../assets/icons/target_icon.webp";
import iconLayers from "../../assets/icons/layers_icon.webp";
import iconLanguage from "../../assets/icons/language_icon.webp";
import iconPlay from "../../assets/icons/play_icon.webp";
import iconMic from "../../assets/icons/mic_icon.webp";
import iconLighting from "../../assets/icons/lighting_icon.webp";
import iconCheck from "../../assets/icons/check_icon.webp";
import iconRecordingLive from "../../assets/icons/recoding_live_icon.webp";
import iconPersonGroup from "../../assets/icons/person_group_icon.webp";
import iconAudioFile from "../../assets/icons/audio_file_icon.webp";

const stats = [
  { value: "3초", label: "평균 요약 생성 시간", img: iconClock },
  { value: "98%", label: "화자 분리 정확도", img: iconTarget },
  { value: "3가지", label: "지원 회의 방식", img: iconLayers },
  { value: "15+", label: "지원 언어", img: iconLanguage },
];

const features = [
  {
    img: iconRecordingLive,
    title: "실시간 녹음",
    desc: "마이크를 통해 회의를 실시간으로 녹음하고 즉시 텍스트로 변환합니다. 회의가 진행되는 동안 대화 내용이 실시간으로 기록됩니다.",
    tags: ["실시간 전송", "화자 분리", "자동 저장"],
    cardBg: "bg-[#EEF2FF]",
    badgeBg: "#5B5FF5",
    badgeText: "#ffffff",
  },
  {
    img: iconPersonGroup,
    title: "온라인 그룹 회의",
    desc: "여러 참여자가 동시에 온라인으로 접속해 회의를 진행할 수 있습니다. 방장이 종료하면 모든 참여자에게 회의록이 공유됩니다.",
    tags: ["다인 참여", "역할 구분", "실시간 공유"],
    cardBg: "bg-[#ECFEFF]",
    badgeBg: "#0891B2",
    badgeText: "#ffffff",
  },
  {
    img: iconAudioFile,
    title: "녹음 파일 업로드",
    desc: "이미 녹음된 오디오 파일을 업로드하면 AI가 자동으로 분석해 화자를 분리하고 회의록을 생성합니다.",
    tags: ["MP3/WAV 지원", "화자 식별", "배치 처리"],
    cardBg: "bg-[#F5F3FF]",
    badgeBg: "#6D4FBB",
    badgeText: "#ffffff",
  },
];

const steps = [
  {
    n: "01",
    title: "회의 방식 선택",
    desc: "실시간 녹음, 그룹 회의, 파일 업로드 중 원하는 방식을 선택하세요.",
    iconImg: iconPlay,
  },
  {
    n: "02",
    title: "회의 시작",
    desc: "AI가 실시간으로 음성을 텍스트로 변환하고 화자를 자동으로 구분합니다.",
    iconImg: iconMic,
  },
  {
    n: "03",
    title: "AI 요약 생성",
    desc: "회의 종료 후 주요 내용, 결정 사항, 후속 조치를 자동으로 정리합니다.",
    iconImg: iconLighting,
  },
  {
    n: "04",
    title: "확인 및 공유",
    desc: "생성된 회의록을 검토하고 팀과 공유하거나 문서로 내보내세요.",
    iconImg: iconCheck,
  },
];

const faqs = [
  {
    question: "회의 데이터는 안전하게 보관되나요?",
    answer:
      "모든 회의 데이터는 AES-256 암호화로 보호되며, ISO 27001 인증 데이터센터에 저장됩니다. 사용자의 명시적 동의 없이는 어떠한 데이터도 제3자와 공유되지 않습니다. 언제든지 데이터 삭제를 요청할 수 있습니다.",
  },
  {
    question: "온라인 그룹 회의는 몇 명까지 참여 가능한가요?",
    answer:
      "현재 최대 50명까지 동시 참여가 가능합니다. 대규모 행사나 기업 단위 사용이 필요하시면 문의해주세요.",
  },
  {
    question: "AI 요약 정확도는 어느 정도인가요?",
    answer:
      "Arok의 AI는 한국어 특화 모델을 사용하여 평균 95% 이상의 전사 정확도를 제공합니다. 화자 분리 정확도는 98%이며, AI 요약은 회의 내용의 핵심을 빠짐없이 정리합니다. 사용자가 직접 내용을 수정할 수도 있습니다.",
  },
  {
    question: "어떤 파일 형식을 지원하나요?",
    answer:
      "MP3, WAV, M4A, AAC, OGG 등 주요 오디오 형식과 MP4, MOV, AVI 등 영상 파일도 지원합니다. 파일 크기는 최대 2GB까지 업로드 가능하며, 4시간 이내의 녹음을 지원합니다.",
  },
];

// 푸터 링크 — target 이 있는 항목만 클릭 가능한 버튼으로 렌더 (나머지는 준비 중)
const footerColumns: { title: string; links: { label: string; target?: SectionId }[] }[] = [
  {
    title: "제품",
    links: [
      { label: "기능 소개", target: SECTION_IDS.features },
      { label: "사용 방법", target: SECTION_IDS.howItWorks },
      { label: "화면 미리보기", target: SECTION_IDS.showcase },
    ],
  },
  {
    title: "회사",
    links: [
      { label: "블로그" },
      { label: "채용" },
      { label: "문의하기", target: SECTION_IDS.faq },
    ],
  },
  {
    title: "법적 고지",
    links: [
      { label: "이용약관" },
      { label: "개인정보처리방침" },
      { label: "쿠키 정책" },
      { label: "보안", target: SECTION_IDS.faq },
    ],
  },
];

export function LandingScreen() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const goToLogin = () => navigate("/login");
  const goToSignup = () => navigate("/signup");

  const handleNavClick = (target: SectionId) => {
    setMobileMenuOpen(false);
    scrollToSection(target);
  };

  return (
    <div className="min-h-screen bg-white" style={{ overflowX: "hidden" }}>
      {/* ── 1. 고정 헤더 ────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E5E7EB]" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 flex-1">
            <img src={logoArok} alt="Arok" className="h-10 w-auto" />
            <span className="font-bold text-xl text-[#1A1D2E]">Arok</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.target}
                type="button"
                onClick={() => handleNavClick(item.target)}
                className="text-sm text-[#6B7280] hover:text-[#1A1D2E] transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
            <button
              type="button"
              onClick={goToLogin}
              className="text-sm font-medium text-[#6B7280] hover:text-[#1A1D2E] transition-colors px-3 py-2"
            >
              로그인
            </button>
            <button
              type="button"
              onClick={goToSignup}
              className="text-sm font-semibold bg-[#5B5FF5] hover:bg-[#4F53E8] text-white px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-[#5B5FF5]/20"
            >
              계정 생성
            </button>
          </div>

          <button
            type="button"
            aria-label="메뉴 열기"
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="w-5 h-0.5 bg-[#1A1D2E] mb-1.5" />
            <div className="w-5 h-0.5 bg-[#1A1D2E] mb-1.5" />
            <div className="w-5 h-0.5 bg-[#1A1D2E]" />
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-t border-[#E5E7EB] overflow-hidden"
            >
              <div className="px-6 py-4 space-y-3">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.target}
                    type="button"
                    onClick={() => handleNavClick(item.target)}
                    className="block text-sm text-[#6B7280] font-medium py-1 w-full text-left"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-2 border-t border-[#E5E7EB] flex flex-col gap-2">
                  <button type="button" onClick={goToLogin} className="text-sm font-medium text-[#6B7280] py-2 text-left">
                    로그인
                  </button>
                  <button type="button" onClick={goToSignup} className="text-sm font-semibold bg-[#5B5FF5] text-white px-4 py-2.5 rounded-xl">
                    계정 생성
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── 2. 히어로 ───────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EEF2FF] via-white to-white pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-[#5B5FF5]/8 to-[#818CF8]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#EEF2FF] text-[#5B5FF5] text-xs font-semibold px-4 py-2 rounded-full mb-6">
                <Zap className="w-3.5 h-3.5" />
                AI 기반 회의록 자동화 서비스
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-[#1A1D2E] leading-[1.2] tracking-tight mb-6">
                회의가 끝나기 전에,
                <br />
                <span className="text-[#5B5FF5]">회의록은 이미</span>
                <br />
                완성되어 있습니다
              </h1>
              <p className="text-lg text-[#6B7280] leading-relaxed mb-8 max-w-2xl mx-auto">
                실시간 온라인 회의부터 녹음 파일 업로드까지, AI가 자동으로 회의록을 만들고 요약해주는 서비스입니다. 화자를 자동으로 구분하고 핵심 내용만 정리해드립니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={goToSignup}
                  className="flex items-center justify-center gap-2 bg-[#5B5FF5] hover:bg-[#4F53E8] text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-[#5B5FF5]/25 hover:shadow-xl hover:shadow-[#5B5FF5]/30 hover:-translate-y-0.5"
                >
                  지금 시작하기
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* 대화 → AI → 회의록 파이프라인 데모 */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16"
            >
              <PipelineAnimation />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3. 지표 ─────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-[#E5E7EB] bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="flex items-center justify-center mx-auto mb-3">
                    <img src={s.img} alt="" className="w-16 h-16 object-contain" />
                  </div>
                  <div className="text-3xl font-bold text-[#1A1D2E] mb-1">{s.value}</div>
                  <div className="text-sm text-[#6B7280]">{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 5. 핵심 기능 ────────────────────────────────── */}
      <section id={SECTION_IDS.features} className="scroll-mt-20 py-24 px-6 bg-[#F8F9FC]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white text-[#5B5FF5] text-xs font-semibold px-4 py-2 rounded-full border border-[#E5E7EB] mb-4">
              핵심 기능
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1D2E] mb-4">3가지 회의 방식을 모두 지원</h2>
            <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">어떤 형태의 회의든 Arok이 자동으로 기록하고 요약합니다.</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.1}>
                <div className={`${f.cardBg} rounded-2xl p-8 border border-[#E5E7EB] hover:shadow-lg transition-all h-full`}>
                  <img src={f.img} alt="" className="w-20 h-20 object-contain mb-5" />
                  <h3 className="font-bold text-xl text-[#1A1D2E] mb-3">{f.title}</h3>
                  <p className="text-[#4B5563] text-sm leading-relaxed mb-5">{f.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {f.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ backgroundColor: f.badgeBg, color: f.badgeText }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. 사용 방법 ────────────────────────────────── */}
      <section id={SECTION_IDS.howItWorks} className="scroll-mt-20 py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#EEF2FF] text-[#5B5FF5] text-xs font-semibold px-4 py-2 rounded-full mb-4">
              사용 방식
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1D2E] mb-4">단 4단계로 끝</h2>
            <p className="text-[#6B7280] text-lg">복잡한 설정 없이 바로 시작할 수 있습니다.</p>
          </FadeIn>

          {/* 데스크톱: 단계 사이 점선 커넥터 */}
          <div className="hidden md:flex items-start">
            {steps.map((step, i) => (
              <Fragment key={step.n}>
                <FadeIn delay={i * 0.12} className="flex-1">
                  <StepCard {...step} />
                </FadeIn>
                {i < steps.length - 1 && (
                  <div
                    className="flex-shrink-0 self-start"
                    style={{ width: "48px", borderTop: "2px dashed #C7C9F9", marginTop: "72px" }}
                  />
                )}
              </Fragment>
            ))}
          </div>

          {/* 모바일: 세로 스택 */}
          <div className="flex md:hidden flex-col gap-10">
            {steps.map((step, i) => (
              <FadeIn key={step.n} delay={i * 0.12}>
                <StepCard {...step} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. 제품 화면 소개 ───────────────────────────── */}
      <section id={SECTION_IDS.showcase} className="scroll-mt-20 py-24 px-6 bg-[#0F1624] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-4 py-2 rounded-full mb-4">
              제품 소개
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">한눈에 보는 회의록</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">대화 내용과 AI 요약이 나란히 정리되어 회의 흐름을 한번에 파악할 수 있습니다.</p>
          </FadeIn>

          <div className="space-y-20">
            <FadeIn delay={0.1}>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="md:order-2">
                  <div
                    className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
                    style={{ backgroundColor: "#5B5FF520", color: "#5B5FF5" }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    핵심 기능
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">회의록 관리 및 검색</h3>
                  <p className="text-white/50 leading-relaxed mb-6">모든 회의록이 한 곳에 정리됩니다. 날짜, 참여자, 키워드로 빠르게 검색하고 원하는 회의록을 찾아보세요.</p>
                  <ul className="space-y-2.5">
                    {["날짜별 정렬", "키워드 검색", "원클릭 삭제"].map((pt) => (
                      <li key={pt} className="flex items-center gap-3 text-white/70 text-sm">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#5B5FF530" }}>
                          <CheckCircle className="w-3 h-3 text-[#5B5FF5]" />
                        </div>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:order-1">
                  <Screenshot src={meetingListShot} alt="회의록 목록 화면" variant="dark" />
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div
                    className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
                    style={{ backgroundColor: "#818CF820", color: "#818CF8" }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    AI 요약
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">AI 회의록 상세 보기</h3>
                  <p className="text-white/50 leading-relaxed mb-6">AI가 자동 생성한 요약과 전체 대화 내용을 한 화면에서 확인하세요. 화자별 발언과 핵심 액션 아이템이 깔끔하게 정리됩니다.</p>
                  <ul className="space-y-2.5">
                    {["AI 자동 요약", "화자별 발언 정리", "액션 아이템 추출"].map((pt) => (
                      <li key={pt} className="flex items-center gap-3 text-white/70 text-sm">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#818CF830" }}>
                          <CheckCircle className="w-3 h-3 text-[#818CF8]" />
                        </div>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Screenshot src={meetingDetailShot} alt="회의록 상세 화면" variant="dark" />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section id={SECTION_IDS.faq} className="scroll-mt-20 py-24 px-6 bg-[#F8F9FC]">
        <div className="max-w-3xl mx-auto">
          <FadeIn className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white text-[#5B5FF5] text-xs font-semibold px-4 py-2 rounded-full border border-[#E5E7EB] mb-4">
              자주 묻는 질문
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1D2E] mb-4">FAQ</h2>
            <p className="text-[#6B7280]">궁금한 점이 있으시면 언제든지 문의해주세요.</p>
          </FadeIn>

          <FadeIn>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 10. 최종 CTA ────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#5B5FF5] to-[#818CF8] relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -right-10 w-80 h-80 bg-white/5 rounded-full" />

        <FadeIn className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            지금 바로
            <br />
            회의록 걱정 끝내기
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">지금 바로 Arok을 시작하고 회의록 작성에서 해방되세요.</p>
          <button
            type="button"
            onClick={goToSignup}
            className="inline-flex items-center gap-2 bg-white text-[#5B5FF5] font-bold px-8 py-4 rounded-xl hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-base"
          >
            계정 생성
            <ArrowRight className="w-5 h-5" />
          </button>
        </FadeIn>
      </section>

      {/* ── 11. 푸터 ────────────────────────────────────── */}
      <footer className="bg-[#0F1624] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src={logoArok} alt="Arok" className="h-8 w-auto" />
                <span className="font-bold text-xl">Arok</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed mb-5">
                AI가 자동으로 회의록을 만들고 요약해주는 스마트한 회의 관리 서비스입니다.
              </p>
              <div className="flex items-center gap-3">
                {[Twitter, Linkedin, Youtube].map((Icon, i) => (
                  <span key={i} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white/60" />
                  </span>
                ))}
              </div>
            </div>

            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm mb-4 text-white">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.target ? (
                        <button
                          type="button"
                          onClick={() => handleNavClick(link.target!)}
                          className="text-sm text-white/40 hover:text-white/70 transition-colors text-left"
                        >
                          {link.label}
                        </button>
                      ) : (
                        <span className="text-sm text-white/25">{link.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/30">© 2026 Arok Inc. All rights reserved.</p>
            <p className="text-sm text-white/30">대한민국 서울특별시 강남구 테헤란로 123</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ n, title, desc, iconImg }: (typeof steps)[number]) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-36 h-36 rounded-full bg-[#5B5FF5]/8 flex items-center justify-center mb-4">
        <img src={iconImg} alt="" className="w-28 h-28 object-contain" />
      </div>
      <div className="text-xs font-bold text-[#5B5FF5] mb-2 tracking-wider">{n}</div>
      <h3 className="font-bold text-[#1A1D2E] mb-2">{title}</h3>
      <p className="text-sm text-[#6B7280] leading-relaxed">{desc}</p>
    </div>
  );
}
