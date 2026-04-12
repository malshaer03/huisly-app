const MONTHLY_SPEND = [
  { month: "Nov", amount: 1820 },
  { month: "Dec", amount: 2340 },
  { month: "Jan", amount: 1650 },
  { month: "Feb", amount: 1980 },
  { month: "Mar", amount: 2150 },
  { month: "Apr", amount: 1243 },
];

const CATEGORY_BREAKDOWN = [
  {
    name: "Food & Dining",
    amount: "€312",
    pct: 25,
    color: "#f06a6a",
    icon: "🍔",
  },
  { name: "Housing", amount: "€850", pct: 68, color: "#7c6dfa", icon: "🏠" },
  { name: "Transport", amount: "€187", pct: 15, color: "#f0c96a", icon: "🚗" },
  { name: "Groceries", amount: "€156", pct: 13, color: "#4fd1a5", icon: "🛒" },
  {
    name: "Subscriptions",
    amount: "€89",
    pct: 7,
    color: "#a78bfa",
    icon: "📱",
  },
  { name: "Other", amount: "€61", pct: 5, color: "#5a5a6e", icon: "💼" },
];

const maxSpend = Math.max(...MONTHLY_SPEND.map((m) => m.amount));

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <p className="font-display text-[12px] text-muted uppercase tracking-[0.1em] mb-1">
          Analytics
        </p>
        <h1 className="font-display font-bold text-2xl tracking-[-0.02em] text-foreground">
          Spending Overview
        </h1>
      </div>

      {/* Monthly bar chart */}
      <div className="px-6 mb-6">
        <div className="bg-surface border border-white/[0.06] rounded-[20px] p-[18px]">
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="font-display font-semibold text-sm text-foreground">
                Monthly Spend
              </p>
              <p className="text-[11px] text-muted mt-0.5">Last 6 months</p>
            </div>
            <span className="font-display text-xs text-accent px-3 py-1 rounded-full bg-accent/[0.12] border border-accent/20">
              −8.3% vs avg
            </span>
          </div>

          {/* Bars */}
          <div className="flex items-end gap-2 h-28">
            {MONTHLY_SPEND.map((m, i) => {
              const isLast = i === MONTHLY_SPEND.length - 1;
              const barPct = Math.max(
                4,
                Math.round((m.amount / maxSpend) * 100),
              );
              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col items-center gap-2 h-full"
                >
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className={`w-full rounded-t-[4px] ${isLast ? "bg-gradient-to-b from-accent to-[#a78bfa]" : "bg-white/[0.07]"}`}
                      style={{ height: `${barPct}%`, minHeight: 4 }}
                    />
                  </div>
                  <p
                    className={`font-display text-[10px] shrink-0 ${isLast ? "text-accent" : "text-muted"}`}
                  >
                    {m.month}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <p className="px-6 mb-3 text-[11px] font-display uppercase tracking-[0.12em] text-muted">
        By Category
      </p>
      <div className="px-6 mb-6">
        <div className="bg-surface border border-white/[0.06] rounded-[20px] p-[18px] flex flex-col gap-4">
          {CATEGORY_BREAKDOWN.map((cat) => (
            <div key={cat.name} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface2 flex items-center justify-center text-base shrink-0">
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-[13px] text-foreground">{cat.name}</p>
                  <p className="font-display font-semibold text-[13px] text-foreground shrink-0">
                    {cat.amount}
                  </p>
                </div>
                <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${cat.pct}%`, background: cat.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insight card */}
      <div className="px-6 mb-6">
        <div className="bg-accent/[0.08] border border-accent/20 rounded-[20px] p-[18px] flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-[#a78bfa] flex items-center justify-center shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              aria-label="Miru insight star"
            >
              <path
                d="M12 2L13.5 9L20 10L13.5 11L12 18L10.5 11L4 10L10.5 9L12 2Z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <p className="font-display font-semibold text-sm text-foreground mb-1.5">
              Miru Insight
            </p>
            <p className="text-[13px] leading-relaxed text-foreground/70">
              You spent{" "}
              <strong className="text-foreground">€48 more on food</strong> this
              cycle than last. Your grocery bills are steady, but dining out is
              up 18%. Consider cooking at home 2× more per week to save ~€80.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
