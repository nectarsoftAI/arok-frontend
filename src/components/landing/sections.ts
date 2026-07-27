// 랜딩 페이지 섹션 id — 헤더 네비/푸터 링크의 스크롤 타깃으로 공용 사용
export const SECTION_IDS = {
  features: "features",
  howItWorks: "how-it-works",
  showcase: "showcase",
  faq: "faq",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

/** 고정 헤더에 가리지 않도록 각 섹션에 scroll-margin-top 을 준 뒤 부드럽게 이동 */
export function scrollToSection(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export const NAV_ITEMS: { label: string; target: SectionId }[] = [
  { label: "기능", target: SECTION_IDS.features },
  { label: "사용 방법", target: SECTION_IDS.howItWorks },
  { label: "문의", target: SECTION_IDS.faq },
];
