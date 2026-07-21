import { useEffect, useState } from "react";
import { Calendar, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { WeeklyChart } from "../charts/WeeklyChart";
import { SpeakerChart } from "../charts/SpeakerChart";
import { KeywordChart } from "../charts/KeywordChart";
import supabaseClient from "../../api/supabaseClient";

// get_dashboard_stats RPC의 cards 부분만 — 나머지 필드는 대응 UI가 없어 다루지 않음
interface DashboardCards {
  meetingsThisMonth: number;
  avgDurationMin: number;
  aiCompletedRate: number;
}

export function InsightsScreen() {
  const [cards, setCards] = useState<DashboardCards | null>(null);

  useEffect(() => {
    supabaseClient
      .post("/rpc/get_dashboard_stats", {})
      .then(({ data }) => setCards(data.cards))
      .catch((err) => console.error("대시보드 통계 조회 실패", err));
  }, []);

  const kpis = [
    { label: "이번 달 회의 수", value: cards ? `${cards.meetingsThisMonth}` : "-", icon: Calendar, color: "#5B5FF5" },
    { label: "평균 회의 시간", value: cards ? `${Math.round(cards.avgDurationMin)}분` : "-", icon: Clock, color: "#22D3EE" },
    { label: "AI 처리 완료", value: cards ? `${Math.round(cards.aiCompletedRate)}%` : "-", icon: TrendingUp, color: "#10B981" },
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

        <div className="grid grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5">
            <h3 className="font-semibold text-[#1A1D2E] mb-4">주간 회의 빈도</h3>
            <WeeklyChart />
          </div>
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5">
            <h3 className="font-semibold text-[#1A1D2E] mb-4">화자별 발언 비율</h3>
            <SpeakerChart />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5">
          <h3 className="font-semibold text-[#1A1D2E] mb-4">자주 언급된 키워드</h3>
          <KeywordChart />
        </div>
      </div>
    </div>
  );
}
