import { useEffect, useState } from "react";
import { Calendar, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { MeetingFrequencyChart } from "../charts/MeetingFrequencyChart";
import { KeywordChart } from "../charts/KeywordChart";
import { dashboardApi, type DashboardCards } from "../../api/dashboard";

export function InsightsScreen() {
  const [cards, setCards] = useState<DashboardCards | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    dashboardApi
      .getCards(controller.signal)
      .then(setCards)
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error("대시보드 통계 조회 실패", err);
      });

    return () => controller.abort();
  }, []);

  const kpis = [
    { label: "이번 달 회의 수", value: cards ? `${cards.meetingsThisMonth}` : "-", icon: Calendar, color: "#5B5FF5" },
    { label: "평균 회의 시간", value: cards ? `${Math.round(cards.avgDurationMin)}분` : "-", icon: Clock, color: "#22D3EE" },
    { label: "AI 요약 완료", value: cards ? `${Math.round(cards.aiCompletedRate)}%` : "-", icon: TrendingUp, color: "#10B981" },
    { label: "후속 조치 완료율", value: "67%", icon: CheckCircle, color: "#F59E0B" },
  ];

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-[22px] font-semibold text-[#1A1D2E] mb-6">회의 인사이트</h1>

        <div className="grid grid-cols-4 gap-5 mb-6">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${kpi.color}20` }}
              >
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <div className="text-[32px] font-bold mb-1" style={{ color: kpi.color }}>
                {kpi.value}
              </div>
              <div className="text-sm text-[#6B7280]">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-[#1A1D2E] mb-5">회의 빈도</h3>
          <MeetingFrequencyChart />
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5">
          <h3 className="font-semibold text-[#1A1D2E] mb-4">자주 언급된 키워드</h3>
          <KeywordChart />
        </div>
      </div>
    </div>
  );
}
