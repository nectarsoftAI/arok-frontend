const data = [
  { day: "월", meetings: 4 },
  { day: "화", meetings: 6 },
  { day: "수", meetings: 3 },
  { day: "목", meetings: 5 },
  { day: "금", meetings: 6 },
];

export function WeeklyChart() {
  const max = Math.max(...data.map((d) => d.meetings));
  const chartH = 180;
  const barW = 40;
  const gap = 20;
  const totalW = data.length * (barW + gap) - gap;

  return (
    <div className="w-full">
      <svg width="100%" viewBox={`0 0 ${totalW + 40} ${chartH + 40}`} preserveAspectRatio="xMidYMid meet">
        {/* Y gridlines */}
        {[0, 2, 4, 6].map((v) => {
          const y = chartH - (v / max) * chartH;
          return (
            <g key={`grid-${v}`}>
              <line x1={20} y1={y} x2={totalW + 20} y2={y} stroke="#E5E7EB" strokeDasharray="4 3" />
              <text x={14} y={y + 4} fontSize={10} fill="#9CA3AF" textAnchor="end">{v}</text>
            </g>
          );
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.meetings / max) * chartH;
          const x = 20 + i * (barW + gap);
          const y = chartH - barH;
          return (
            <g key={`bar-${i}`}>
              <rect x={x} y={y} width={barW} height={barH} fill="#5B5FF5" rx={6} ry={6} />
              <text x={x + barW / 2} y={chartH + 16} fontSize={11} fill="#6B7280" textAnchor="middle">{d.day}</text>
              <text x={x + barW / 2} y={y - 6} fontSize={11} fill="#5B5FF5" textAnchor="middle">{d.meetings}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
