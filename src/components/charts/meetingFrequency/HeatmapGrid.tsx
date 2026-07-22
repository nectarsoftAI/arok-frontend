import { useState } from "react";
import {
  CELL_GAP,
  CELL_SIZE,
  DAY_LABELS,
  DAY_LABEL_WIDTH,
  buildMonthLabels,
  formatKoreanDate,
  intensityColor,
  type HeatmapCell,
} from "./heatmap";

interface HeatmapGridProps {
  weeks: HeatmapCell[][];
  startDate: Date;
  endDate: Date;
  selectedDate: string | null;
  onSelect: (date: string | null) => void;
}

interface Tooltip {
  date: string;
  count: number;
  x: number;
  y: number;
}

export function HeatmapGrid({ weeks, startDate, endDate, selectedDate, onSelect }: HeatmapGridProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const monthLabels = buildMonthLabels(weeks, startDate, endDate);

  return (
    <div>
      {/* 셀 위에 띄우는 툴팁 — 카드가 overflow 를 잘라내지 않도록 fixed 로 붙인다. */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
        >
          <div className="relative mb-1.5 rounded-md bg-[#1A1D2E] px-2.5 py-1.5 text-[11px] text-white whitespace-nowrap shadow-lg">
            {formatKoreanDate(tooltip.date)}에 {tooltip.count}건의 회의
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: -5,
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid #1A1D2E",
              }}
            />
          </div>
        </div>
      )}

      {/* 월 라벨 — 각 열 너비에 맞춰 셀 격자와 정렬한다. */}
      <div className="mb-1 flex" style={{ paddingLeft: DAY_LABEL_WIDTH + CELL_GAP }}>
        {weeks.map((_, col) => {
          const label = monthLabels.find((m) => m.col === col);
          return (
            <div key={col} className="flex-shrink-0" style={{ width: CELL_SIZE, marginRight: CELL_GAP }}>
              {label && <span className="text-[10px] text-[#9CA3AF] whitespace-nowrap">{label.label}</span>}
            </div>
          );
        })}
      </div>

      <div className="flex" style={{ gap: CELL_GAP }}>
        {/* 요일 라벨 — 한 칸 건너 하나만 표기(월·수·금) */}
        <div className="flex flex-col" style={{ gap: CELL_GAP }}>
          {DAY_LABELS.map((day, i) => (
            <div
              key={day}
              className="flex items-center justify-end pr-1"
              style={{ height: CELL_SIZE, width: DAY_LABEL_WIDTH }}
            >
              {i % 2 === 1 && <span className="text-[10px] text-[#9CA3AF]">{day}</span>}
            </div>
          ))}
        </div>

        {weeks.map((week, col) => (
          <div key={col} className="flex flex-col" style={{ gap: CELL_GAP }}>
            {week.map((cell) => {
              const hidden = cell.count === -1;
              const isSelected = selectedDate === cell.date;
              const isHovered = hoveredDate === cell.date;

              return (
                <div
                  key={cell.date}
                  onClick={() => !hidden && onSelect(isSelected ? null : cell.date)}
                  onMouseEnter={(e) => {
                    if (hidden || cell.count === 0) return;
                    setHoveredDate(cell.date);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      date: cell.date,
                      count: cell.count,
                      x: rect.left + rect.width / 2,
                      y: rect.top - 2,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredDate(null);
                    setTooltip(null);
                  }}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    borderRadius: 3,
                    flexShrink: 0,
                    backgroundColor: hidden ? "transparent" : intensityColor(cell.count),
                    cursor: hidden ? "default" : "pointer",
                    outline: isSelected ? "2px solid #5B5FF5" : isHovered ? "2px solid #818CF8" : "none",
                    outlineOffset: 1,
                    transition: "outline 0.1s",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
