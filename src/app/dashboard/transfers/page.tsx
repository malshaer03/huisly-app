const RECENT_TRANSFERS = [
  {
    icon: "💳",
    name: "To Revolut",
    meta: "Apr 10 · Internal",
    amount: "−€200",
    positive: false,
    status: "Completed",
  },
  {
    icon: "👤",
    name: "From Sarah K.",
    meta: "Apr 8 · iDEAL",
    amount: "+€75",
    positive: true,
    status: "Completed",
  },
  {
    icon: "🏠",
    name: "Rent — Jan B.",
    meta: "Apr 1 · Bank transfer",
    amount: "−€1,050",
    positive: false,
    status: "Completed",
  },
  {
    icon: "💸",
    name: "To Binance",
    meta: "Mar 28 · Crypto",
    amount: "−€500",
    positive: false,
    status: "Completed",
  },
];

const QUICK_ACTIONS = [
  { icon: "↑", label: "Send", color: "text-accent bg-accent/[0.15]" },
  { icon: "↓", label: "Receive", color: "text-accent2 bg-accent2/[0.15]" },
  { icon: "⟳", label: "Exchange", color: "text-gold bg-gold/[0.15]" },
  { icon: "◈", label: "Crypto", color: "text-[#a78bfa] bg-[#a78bfa]/[0.15]" },
];

export default function TransfersPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <p className="font-display text-[12px] text-muted uppercase tracking-[0.1em] mb-1">
          Transfers
        </p>
        <h1 className="font-display font-bold text-2xl tracking-[-0.02em] text-foreground">
          Move Money
        </h1>
      </div>

      {/* Quick actions */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              type="button"
              key={action.label}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-surface border border-white/[0.06] cursor-pointer active:opacity-70 transition-opacity"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${action.color}`}
              >
                {action.icon}
              </div>
              <p className="font-display text-[11px] text-foreground/80">
                {action.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* New transfer form */}
      <div className="px-6 mb-6">
        <div className="bg-surface border border-white/[0.06] rounded-[20px] p-[18px]">
          <p className="font-display font-semibold text-sm text-foreground mb-4">
            New Transfer
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <p className="font-display text-[11px] text-muted uppercase tracking-[0.08em] mb-2">
                Recipient
              </p>
              <div className="w-full px-4 py-3 rounded-xl bg-surface2 border border-white/[0.06] text-[13px] text-muted">
                Name, IBAN, or email…
              </div>
            </div>
            <div>
              <p className="font-display text-[11px] text-muted uppercase tracking-[0.08em] mb-2">
                Amount
              </p>
              <div className="w-full px-4 py-3 rounded-xl bg-surface2 border border-white/[0.06] text-[13px] text-muted">
                €0.00
              </div>
            </div>
            <button
              type="button"
              className="w-full mt-1 py-3.5 rounded-xl bg-gradient-to-r from-accent to-[#a78bfa] font-display font-semibold text-sm text-white border-0 cursor-pointer active:opacity-80 transition-opacity"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>

      {/* Recent transfers */}
      <p className="px-6 mb-3 text-[11px] font-display uppercase tracking-[0.12em] text-muted">
        Recent
      </p>
      <div className="px-6 mb-6">
        {RECENT_TRANSFERS.map((tx, i) => (
          <div
            key={`${tx.name}-${i}`}
            className={`flex items-center gap-3 py-3 ${i < RECENT_TRANSFERS.length - 1 ? "border-b border-white/[0.06]" : ""}`}
          >
            <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center text-base shrink-0">
              {tx.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground">
                {tx.name}
              </p>
              <p className="text-[11px] text-muted mt-0.5">{tx.meta}</p>
            </div>
            <div className="text-right shrink-0">
              <p
                className={`font-display font-semibold text-sm ${tx.positive ? "text-accent2" : "text-danger"}`}
              >
                {tx.amount}
              </p>
              <p className="text-[10px] text-muted mt-0.5">{tx.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
