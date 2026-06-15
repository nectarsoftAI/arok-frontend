const data = [
  { keyword: "프로젝트", count: 18 },
  { keyword: "개발", count: 15 },
  { keyword: "마케팅", count: 12 },
  { keyword: "예산", count: 10 },
  { keyword: "일정", count: 8 },
  { keyword: "고객", count: 7 },
];

export function KeywordChart() {
  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => (
        <div key={`kw-${i}`} className="flex items-center gap-3">
          <span className="text-sm text-[#6B7280] w-16 text-right flex-shrink-0">{d.keyword}</span>
          <div className="flex-1 bg-[#F3F4F6] rounded-full h-6 overflow-hidden">
            <div
              className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
              style={{ width: `${(d.count / max) * 100}%`, backgroundColor: "#22D3EE" }}
            >
              <span className="text-xs text-white font-medium">{d.count}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
