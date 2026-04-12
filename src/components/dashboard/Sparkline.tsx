import type { SparklineProps } from "@/types/dashboard/ui";

export function Sparkline({ data }: SparklineProps) {
  if (!data || data.length < 2) {
    return (
      <div className="mt-4 h-14 flex items-center justify-center bg-white/[0.02] rounded-lg border border-dashed border-white/10">
        <p className="text-[10px] text-muted">No trend data yet</p>
      </div>
    );
  }

  // Basic normalization for the SVG viewbox (342x56)
  const min = Math.min(...data.map((d) => d.value));
  const max = Math.max(...data.map((d) => d.value));
  const range = max - min || 1;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 342;
      const y = 56 - ((d.value - min) / range) * 40 - 8; // Leave some padding
      return `${x},${y}`;
    })
    .join(" ");

  const fillPoints = `${points} 342,56 0,56 Z`;

  return (
    <div className="mt-4 h-14">
      <svg
        viewBox="0 0 342 56"
        fill="none"
        preserveAspectRatio="none"
        className="w-full h-full"
        role="img"
        aria-label="Net worth trend chart"
      >
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c6dfa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7c6dfa" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          stroke="#7c6dfa"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`M ${fillPoints.replace(/ /g, " L ")}`}
          fill="url(#sparkGrad)"
        />
      </svg>
    </div>
  );
}
