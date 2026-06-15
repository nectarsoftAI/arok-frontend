const data = [
  { name: "화자 A", value: 45, color: "#5B5FF5" },
  { name: "화자 B", value: 35, color: "#22D3EE" },
  { name: "화자 C", value: 20, color: "#818CF8" },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export function SpeakerChart() {
  const cx = 90;
  const cy = 90;
  const outerR = 80;
  const innerR = 52;
  const total = data.reduce((s, d) => s + d.value, 0);
  let angle = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={180} height={180}>
        {data.map((d, i) => {
          const sweep = (d.value / total) * 360 - 2;
          const start = angle;
          const end = angle + sweep;
          angle += sweep + 2;

          const outerPath = arcPath(cx, cy, outerR, start, end);
          const innerPath = arcPath(cx, cy, innerR, end, start);
          const s = polarToCartesian(cx, cy, outerR, start);
          const e = polarToCartesian(cx, cy, innerR, start);
          const s2 = polarToCartesian(cx, cy, outerR, end);
          const e2 = polarToCartesian(cx, cy, innerR, end);

          return (
            <path
              key={`slice-${i}`}
              d={`M ${s.x} ${s.y} ${outerPath.slice(outerPath.indexOf('A'))} L ${e2.x} ${e2.y} ${innerPath.slice(innerPath.indexOf('A'))} L ${s.x} ${s.y} Z`}
              fill={d.color}
            />
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={12} fill="#6B7280">총 발언</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={16} fill="#1A1D2E" fontWeight="bold">100%</text>
      </svg>
      <div className="flex flex-col gap-3">
        {data.map((d, i) => (
          <div key={`legend-${i}`} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-sm text-[#1A1D2E]">{d.name}</span>
            <span className="text-sm font-semibold ml-1" style={{ color: d.color }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
