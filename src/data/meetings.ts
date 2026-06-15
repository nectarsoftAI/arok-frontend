export interface Meeting {
  id: number;
  date: string;
  title: string;
  participants: string[];
  duration: string;
  keywords: string[];
  messages: Array<{ speaker: string; text: string; time: string }>;
}

export const meetings: Meeting[] = [
  {
    id: 1,
    date: "2026-06-03",
    title: "프로젝트 진행 상황 회의",
    participants: ["A", "B"],
    duration: "42분",
    keywords: ["프로젝트", "진행 상황", "개발"],
    messages: [
      { speaker: "A", text: "프로젝트 진행 상황을 먼저 논의해볼까요?", time: "10:23" },
      { speaker: "B", text: "네, 좋습니다. 현재 개발 진행률은 약 70% 정도입니다.", time: "10:24" },
      { speaker: "A", text: "생각보다 빠르게 진행되고 있네요. 마케팅 계획은 어떤가요?", time: "10:25" },
      { speaker: "B", text: "마케팅팀과 협의 중입니다. 다음 주까지 초안을 완료할 예정입니다.", time: "10:26" },
      { speaker: "A", text: "좋습니다. 예산 관련해서 추가 논의가 필요할 것 같은데요.", time: "10:27" },
      { speaker: "B", text: "네, 예산 세부 내용은 별도 문서로 공유하겠습니다.", time: "10:28" },
    ],
  },
  {
    id: 2,
    date: "2026-06-02",
    title: "마케팅 전략 논의",
    participants: ["A", "B", "C"],
    duration: "35분",
    keywords: ["마케팅", "전략", "캠페인"],
    messages: [
      { speaker: "A", text: "이번 분기 마케팅 전략에 대해 논의하겠습니다.", time: "14:00" },
      { speaker: "B", text: "소셜 미디어 캠페인을 강화하는 것이 좋을 것 같습니다.", time: "14:02" },
      { speaker: "C", text: "동의합니다. 타겟 고객층 분석도 필요합니다.", time: "14:05" },
    ],
  },
  {
    id: 3,
    date: "2026-06-01",
    title: "Q2 예산 검토 미팅",
    participants: ["A", "B"],
    duration: "28분",
    keywords: ["예산", "재무", "계획"],
    messages: [
      { speaker: "A", text: "2분기 예산 현황을 점검하겠습니다.", time: "11:00" },
      { speaker: "B", text: "마케팅 부문 예산이 예상보다 초과되었습니다.", time: "11:05" },
      { speaker: "A", text: "조정 계획을 다음 주까지 준비해주세요.", time: "11:20" },
    ],
  },
  {
    id: 4,
    date: "2026-05-31",
    title: "제품 로드맵 회의",
    participants: ["A", "C"],
    duration: "51분",
    keywords: ["제품", "로드맵", "기능"],
    messages: [
      { speaker: "A", text: "하반기 제품 로드맵을 확정해야 합니다.", time: "15:00" },
      { speaker: "C", text: "AI 기능 추가를 우선순위로 두면 좋겠습니다.", time: "15:10" },
      { speaker: "A", text: "좋습니다. 세부 일정을 작성해주세요.", time: "15:40" },
    ],
  },
  {
    id: 5,
    date: "2026-05-30",
    title: "개발팀 스프린트 리뷰",
    participants: ["B", "C"],
    duration: "38분",
    keywords: ["개발", "스프린트", "리뷰"],
    messages: [
      { speaker: "B", text: "이번 스프린트 완료 항목을 리뷰하겠습니다.", time: "16:00" },
      { speaker: "C", text: "계획된 작업의 90%를 완료했습니다.", time: "16:10" },
      { speaker: "B", text: "훌륭합니다. 다음 스프린트 계획을 세웁시다.", time: "16:30" },
    ],
  },
  {
    id: 6,
    date: "2026-05-29",
    title: "고객 피드백 분석",
    participants: ["A", "B", "C"],
    duration: "44분",
    keywords: ["고객", "피드백", "분석"],
    messages: [
      { speaker: "A", text: "최근 고객 피드백을 분석한 결과를 공유합니다.", time: "13:00" },
      { speaker: "B", text: "UI/UX 개선 요청이 가장 많았습니다.", time: "13:15" },
      { speaker: "C", text: "다음 버전에 반영하도록 하겠습니다.", time: "13:35" },
    ],
  },
];

export function getMeetingById(id: string): Meeting | undefined {
  return meetings.find((m) => m.id === parseInt(id, 10));
}
