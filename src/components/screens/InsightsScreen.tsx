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
    { label: "이번 달 회의 수", value: "24", icon: Calendar, color: "#5B5FF5" },
    { label: "평균 회의 시간", value: "42분", icon: Clock, color: "#22D3EE" },
    { label: "AI 처리 완료", value: "98%", icon: TrendingUp, color: "#10B981" },
    { label: "이번 달 회의 수", value: cards ? `${cards.meetingsThisMonth}` : "-", icon: Calendar, color: "#5B5FF5" },
    { label: "평균 회의 시간", value: cards ? `${Math.round(cards.avgDurationMin)}분` : "-", icon: Clock, color: "#22D3EE" },
    { label: "AI 처리 완료", value: cards ? `${Math.round(cards.aiCompletedRate)}%` : "-", icon: TrendingUp, color: "#10B981" },
    { label: "후속 조치 완료율", value: "67%", icon: CheckCircle, color: "#F59E0B" },
  ];
