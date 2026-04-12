const CONNECTED_ACCOUNTS = [
  {
    icon: "🏦",
    name: "ING Bank",
    detail: "NL91 ABNA •••• 1234",
    status: "Synced",
    ok: true,
  },
  {
    icon: "💳",
    name: "Revolut",
    detail: "Last sync 2h ago",
    status: "Synced",
    ok: true,
  },
  {
    icon: "🦊",
    name: "MetaMask",
    detail: "0x3f4a…b82c",
    status: "Synced",
    ok: true,
  },
  {
    icon: "◈",
    name: "Binance",
    detail: "API connected",
    status: "Synced",
    ok: true,
  },
];

const SUBSCRIPTION_ITEMS = [
  { icon: "🎵", name: "Spotify", amount: "€9.99/mo", next: "Apr 18" },
  { icon: "📺", name: "Netflix", amount: "€15.99/mo", next: "Apr 22" },
  { icon: "☁️", name: "iCloud 50GB", amount: "€0.99/mo", next: "Apr 30" },
  { icon: "🤖", name: "ChatGPT Plus", amount: "€20.00/mo", next: "May 2" },
];

const PROFILE_STATS = [
  { label: "Net Worth", value: "€36,841" },
  { label: "Accounts", value: "4" },
  { label: "This Month", value: "€1,243" },
];

const SETTINGS = [
  { icon: "🔔", label: "Notifications" },
  { icon: "🔒", label: "Privacy & Security" },
  { icon: "💬", label: "Chat with Miru" },
  { icon: "🚪", label: "Sign out", danger: true },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-6 mb-3 text-[11px] font-display uppercase tracking-[0.12em] text-muted">
      {children}
    </p>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen text-foreground">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <p className="font-display text-[12px] text-muted uppercase tracking-[0.1em] mb-1">
          Profile
        </p>
        <p className="font-display text-2xl font-bold tracking-[-0.02em]">
          Mohammed
        </p>
      </div>

      {/* Avatar card */}
      <div className="px-6 mb-6">
        <div className="bg-surface border border-white/[0.06] rounded-[20px] overflow-hidden p-[18px]">
          {/* Avatar row */}
          <div className="flex items-center gap-3.5 mb-[18px]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-[#a78bfa] flex items-center justify-center font-display text-[22px] font-bold text-white shrink-0">
              M
            </div>
            <div>
              <div className="font-display font-semibold text-[15px] text-foreground">
                Mohammed A.
              </div>
              <div className="text-xs text-muted mt-0.5">
                mohammed@example.com
              </div>
              <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-[20px] bg-accent2/[0.12] border border-accent2/20 text-[10px] text-accent2 font-display">
                ● Pro plan
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/[0.06]">
            {PROFILE_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-bold text-[15px] tracking-[-0.02em] text-foreground">
                  {stat.value}
                </div>
                <div className="text-[10px] text-muted mt-1 font-display uppercase tracking-[0.06em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connected accounts */}
      <SectionLabel>Connected Accounts</SectionLabel>
      <div className="px-6 mb-6">
        <div className="bg-surface border border-white/[0.06] rounded-[20px] overflow-hidden">
          {CONNECTED_ACCOUNTS.map((acc, i) => (
            <div
              key={acc.name}
              className={`flex items-center gap-3 px-[18px] py-3.5 ${i < CONNECTED_ACCOUNTS.length - 1 ? "border-b border-white/[0.06]" : ""}`}
            >
              <div className="w-9 h-9 rounded-xl bg-surface2 flex items-center justify-center text-base shrink-0">
                {acc.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-foreground">
                  {acc.name}
                </div>
                <div className="text-[11px] text-muted mt-0.5">
                  {acc.detail}
                </div>
              </div>
              <div
                className={`text-[11px] font-medium shrink-0 ${acc.ok ? "text-accent2" : "text-danger"}`}
              >
                {acc.status}
              </div>
            </div>
          ))}
          <div className="px-[18px] py-3">
            <button
              type="button"
              className="w-full py-3 rounded-xl bg-accent/10 border border-accent/20 text-[13px] font-display font-medium text-accent cursor-pointer"
            >
              + Add account
            </button>
          </div>
        </div>
      </div>

      {/* Subscriptions */}
      <SectionLabel>Subscriptions · €46.97/mo</SectionLabel>
      <div className="px-6 mb-6">
        <div className="bg-surface border border-white/[0.06] rounded-[20px] overflow-hidden">
          {SUBSCRIPTION_ITEMS.map((sub, i) => (
            <div
              key={sub.name}
              className={`flex items-center gap-3 px-[18px] py-3.5 ${i < SUBSCRIPTION_ITEMS.length - 1 ? "border-b border-white/[0.06]" : ""}`}
            >
              <div className="w-9 h-9 rounded-xl bg-surface2 flex items-center justify-center text-base shrink-0">
                {sub.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-foreground">
                  {sub.name}
                </div>
                <div className="text-[11px] text-muted mt-0.5">
                  Next: {sub.next}
                </div>
              </div>
              <div className="font-display text-[13px] font-semibold text-foreground shrink-0">
                {sub.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="px-6 mb-6">
        <div className="bg-surface border border-white/[0.06] rounded-[20px] overflow-hidden">
          {SETTINGS.map((item, i) => (
            <button
              key={item.label}
              type="button"
              className={`w-full flex items-center gap-3 px-[18px] py-3.5 bg-transparent border-0 cursor-pointer text-left ${i < SETTINGS.length - 1 ? "border-b border-white/[0.06]" : ""}`}
            >
              <span className="text-base w-5 text-center shrink-0">
                {item.icon}
              </span>
              <span
                className={`text-[13px] flex-1 ${item.danger ? "text-danger" : "text-foreground"}`}
              >
                {item.label}
              </span>
              <span className="text-lg text-muted">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
