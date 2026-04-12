"use client";

import { useState } from "react";

/* ─── Data ────────────────────────────────────────────────────── */

const ACCOUNTS = [
  {
    id: "ing",
    name: "ING",
    balance: "€10,884",
    change: "+0.0%",
    positive: true,
    emoji: "🏦",
    logoBg: "rgba(255,98,0,0.15)",
    cardBg: "linear-gradient(145deg,#1a1a28,#111118)",
    hasDot: true,
  },
  {
    id: "revolut",
    name: "Revolut",
    balance: "€193",
    change: "−1.2%",
    positive: false,
    emoji: "💳",
    logoBg: "rgba(124,109,250,0.15)",
    cardBg: "linear-gradient(145deg,#1a1a28,#111118)",
    hasDot: false,
  },
  {
    id: "metamask",
    name: "MetaMask",
    balance: "$14,375",
    change: "+4.1%",
    positive: true,
    emoji: "🦊",
    logoBg: "rgba(240,165,0,0.15)",
    cardBg: "linear-gradient(145deg,#1e1a12,#111118)",
    hasDot: false,
  },
  {
    id: "binance",
    name: "Binance",
    balance: "$1,949",
    change: "+2.8%",
    positive: true,
    emoji: "★",
    logoBg: "rgba(243,186,47,0.15)",
    cardBg: "linear-gradient(145deg,#1a1c12,#111118)",
    hasDot: false,
  },
];

const CATEGORIES = [
  {
    icon: "🍔",
    name: "Food & Dining",
    amount: "€312",
    pct: 72,
    color: "#f06a6a",
  },
  { icon: "🚗", name: "Transport", amount: "€187", pct: 45, color: "#f0c96a" },
  { icon: "🛒", name: "Groceries", amount: "€156", pct: 38, color: "#7c6dfa" },
  {
    icon: "📱",
    name: "Subscriptions",
    amount: "€89",
    pct: 22,
    color: "#4fd1a5",
  },
];

const TRANSACTIONS = [
  {
    icon: "☕",
    name: "Starbucks",
    meta: "Today · Food",
    amount: "−€6.40",
    positive: false,
  },
  {
    icon: "⬆️",
    name: "ETH received",
    meta: "Yesterday · MetaMask",
    amount: "+$240",
    positive: true,
  },
  {
    icon: "🚇",
    name: "NS Treinkaart",
    meta: "Apr 9 · Transport",
    amount: "−€49.00",
    positive: false,
  },
];

const CHAT_MESSAGES = [
  {
    role: "ai" as const,
    text: "Hey Mo! Your net worth is up €834 today 📈 — mostly driven by ETH. Anything you want to know?",
    time: "just now",
    chip: "↑ ETH +4.1% today",
  },
  {
    role: "user" as const,
    text: "How much did I spend on eating out last month?",
  },
  {
    role: "ai" as const,
    text: "Last pay cycle you spent €312 on food & dining across 23 transactions. That's €48 more than the previous cycle. Your top spots were Albert Heijn (€89), Thuisbezorgd (€67), and Starbucks (€44).",
    time: "just now",
  },
];

const SUGGESTIONS = [
  "Am I on track? 📊",
  "Biggest expense 💸",
  "Crypto overview 🔗",
  "Net worth 💰",
];

/* ─── Shared ──────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-6 mb-3 text-[11px] font-display uppercase tracking-[0.12em] text-muted">
      {children}
    </p>
  );
}

function Sparkline() {
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
        <path
          d="M0,40 C20,38 40,44 60,36 C80,28 100,20 120,22 C140,24 160,10 180,8 C200,6 220,14 240,18 C260,22 280,30 300,24 C320,18 330,20 342,16"
          stroke="#7c6dfa"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M0,40 C20,38 40,44 60,36 C80,28 100,20 120,22 C140,24 160,10 180,8 C200,6 220,14 240,18 C260,22 280,30 300,24 C320,18 330,20 342,16 L342,56 L0,56 Z"
          fill="url(#sparkGrad)"
        />
        <circle cx="342" cy="16" r="3" fill="#7c6dfa" />
        <circle cx="342" cy="16" r="6" fill="#7c6dfa" opacity="0.2" />
      </svg>
    </div>
  );
}

function SparkleIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="Sparkle icon"
    >
      <path
        d="M12 2L13.5 9L20 10L13.5 11L12 18L10.5 11L4 10L10.5 9L12 2Z"
        fill="white"
      />
      <path
        d="M20 2L20.8 5L24 6L20.8 7L20 10L19.2 7L16 6L19.2 5L20 2Z"
        fill="white"
        opacity="0.6"
      />
      <path
        d="M5 15L5.5 17L8 18L5.5 19L5 21L4.5 19L2 18L4.5 17L5 15Z"
        fill="white"
        opacity="0.5"
      />
    </svg>
  );
}

/* ─── Chat sheet ──────────────────────────────────────────────── */

function ChatSheet({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close chat"
      />

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[72%] bg-surface rounded-t-[28px] border border-white/[0.08] border-b-0 z-[70] flex flex-col overflow-hidden">
        <div className="w-9 h-1 rounded-full bg-white/10 mx-auto mt-3.5 shrink-0" />

        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-[#a78bfa] flex items-center justify-center shrink-0">
            <SparkleIcon size={16} />
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-sm text-foreground">
              Miru AI
            </p>
            <p className="text-[10px] text-accent2">● Online</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground text-xl leading-none px-1 transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-4 flex flex-col gap-4">
          {CHAT_MESSAGES.map((msg, i) => (
            <div
              key={`${msg.role}-${i}`}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[78%]">
                {msg.role === "ai" && "time" in msg && msg.time && (
                  <p className="text-[10px] text-muted mb-1 pl-1">{msg.time}</p>
                )}
                <div
                  className={
                    msg.role === "ai"
                      ? "bg-surface2 border border-white/[0.07] rounded-[16px_16px_16px_4px] px-4 py-2.5 text-[13px] leading-relaxed text-foreground"
                      : "bg-gradient-to-br from-accent to-[#a78bfa] rounded-[16px_16px_4px_16px] px-4 py-2.5 text-[13px] leading-relaxed text-white"
                  }
                >
                  {msg.text}
                </div>
                {"chip" in msg && msg.chip && (
                  <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-accent2/10 border border-accent2/20 text-[11px] text-accent2">
                    {msg.chip}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 px-5 py-2 overflow-x-auto hide-scrollbar shrink-0">
          {SUGGESTIONS.map((s) => (
            <button
              type="button"
              key={s}
              className="shrink-0 px-3 py-1.5 rounded-full bg-surface2 border border-white/[0.08] text-[11px] text-muted whitespace-nowrap hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 px-4 pt-2.5 pb-7 border-t border-white/[0.06] shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your money..."
            className="flex-1 min-w-0 bg-surface2 border border-white/[0.08] rounded-[22px] px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted outline-none focus:border-accent transition-colors"
          />
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-[#a78bfa] flex items-center justify-center text-white text-lg shrink-0 active:scale-90 transition-transform"
            aria-label="Send message"
          >
            ↑
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="animate-fade-up flex items-center justify-between px-6 pt-6">
        <p className="font-display text-[12px] text-muted uppercase tracking-[0.1em]">
          Good morning, Mo
        </p>
        <div className="flex gap-2.5">
          {["🔔", "⚙️"].map((icon) => (
            <button
              type="button"
              key={icon}
              className="w-9 h-9 rounded-full bg-surface border border-white/[0.06] flex items-center justify-center text-[15px]"
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Net worth hero */}
      <div className="animate-fade-up delay-100 px-6 pt-4 pb-6">
        <p className="font-display text-[11px] text-muted uppercase tracking-[0.1em] mb-1.5">
          Total Net Worth
        </p>
        <p className="font-display font-extrabold text-[42px] leading-none tracking-[-0.03em] bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
          €36,841
        </p>
        <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-accent2/[0.12] border border-accent2/20 text-[12px] text-accent2 font-medium">
          ↑ +2.3% · €834 today
        </div>
        <Sparkline />
      </div>

      {/* Accounts */}
      <SectionLabel>Accounts</SectionLabel>
      <div className="animate-fade-up delay-200 flex gap-3 overflow-x-auto hide-scrollbar px-6 pb-1 mb-7">
        {ACCOUNTS.map((acc) => (
          <div
            key={acc.id}
            className="shrink-0 w-[148px] h-[148px] rounded-[20px] p-4 relative border border-white/[0.06] active:scale-[0.97] transition-transform cursor-pointer"
            style={{ background: acc.cardBg }}
          >
            {acc.hasDot && (
              <span className="animate-pulse-dot absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full bg-accent2 shadow-[0_0_8px_#4fd1a5]" />
            )}
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center text-base mb-5"
              style={{ background: acc.logoBg }}
            >
              {acc.emoji}
            </div>
            <p className="font-display text-[10px] text-muted uppercase tracking-[0.1em] mb-1">
              {acc.name}
            </p>
            <p className="font-display font-bold text-[17px] tracking-[-0.02em] text-foreground">
              {acc.balance}
            </p>
            <p
              className={`absolute bottom-3.5 right-3.5 text-[10px] font-medium ${acc.positive ? "text-accent2" : "text-danger"}`}
            >
              {acc.change}
            </p>
          </div>
        ))}
      </div>

      {/* Pay cycle */}
      <SectionLabel>This Pay Cycle</SectionLabel>
      <div className="animate-fade-up delay-300 px-6 mb-6">
        <div className="bg-surface border border-white/[0.06] rounded-[20px] p-[18px]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-display font-semibold text-[13px] text-foreground">
                Spending
              </p>
              <p className="text-[10px] text-muted mt-0.5">
                Mar 25 – Apr 24 · 18 days left
              </p>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-xl tracking-[-0.02em] text-foreground">
                €1,243
              </p>
              <p className="text-[10px] text-muted mt-0.5">of €2,000</p>
            </div>
          </div>
          <div className="h-1 rounded-full bg-white/[0.05] mb-4 overflow-hidden">
            <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-accent to-accent2" />
          </div>
          <div className="flex flex-col gap-2.5">
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2.5">
                <span className="text-sm w-5 text-center shrink-0">
                  {cat.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground mb-1">{cat.name}</p>
                  <div className="h-[3px] rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cat.pct}%`, background: cat.color }}
                    />
                  </div>
                </div>
                <p className="font-display text-xs font-medium text-muted shrink-0 w-11 text-right">
                  {cat.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <SectionLabel>Recent</SectionLabel>
      <div className="animate-fade-up delay-400 px-6">
        {TRANSACTIONS.map((tx, i) => (
          <div
            key={`${tx.name}-${i}`}
            className={`flex items-center gap-3 py-3 ${i < TRANSACTIONS.length - 1 ? "border-b border-white/[0.06]" : ""}`}
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
            <p
              className={`font-display font-semibold text-sm shrink-0 ${tx.positive ? "text-accent2" : "text-danger"}`}
            >
              {tx.amount}
            </p>
          </div>
        ))}
      </div>

      {/* FAB */}
      {!chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="animate-fab-pulse fixed bottom-24 right-5 z-[55] w-[52px] h-[52px] rounded-full bg-gradient-to-br from-accent to-[#a78bfa] flex items-center justify-center border-0 cursor-pointer active:scale-95 transition-transform"
        >
          <SparkleIcon />
        </button>
      )}

      {chatOpen && <ChatSheet onClose={() => setChatOpen(false)} />}
    </div>
  );
}
