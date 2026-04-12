"use client";

import {
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  Building2,
  Calendar,
  Car,
  ChevronDown,
  ChevronRight,
  Coffee,
  CreditCard,
  Eye,
  EyeOff,
  LayoutDashboard,
  Plus,
  PlusCircle,
  Settings,
  Settings2,
  ShoppingCart,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Train,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  Wallet as WalletIcon,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChatStore } from "@/lib/store";

/* ─── Data ────────────────────────────────────────────────────── */

const NET_WORTH = {
  total: "36,285.84",
  change: "+€834",
  changePct: "+2.3%",
};

const ACCOUNTS = [
  {
    id: "ing",
    name: "ING",
    sub: "Checking · Auto-synced",
    balance: "€10,871",
    decimal: ".41",
    change: "No change",
    changeDir: "flat",
    color: "#ff6200",
    logoBg: "rgba(255,98,0,0.12)",
    icon: Building2,
    badge: "€",
    chain: "ETH",
  },
  {
    id: "metamask",
    name: "Eth · MetaMask",
    sub: "0x3f2a…b4d1 · Zerion",
    balance: "$14,375",
    decimal: ".00",
    change: "+4.10%",
    changeDir: "up",
    color: "#f5841f",
    logoBg: "rgba(245,132,31,0.12)",
    icon: Wallet,
    badge: "Ξ",
    chain: "ETH",
  },
  {
    id: "revolut",
    name: "Revolut",
    sub: "Current · Auto-synced",
    balance: "€193",
    decimal: ".27",
    change: "−1.20%",
    changeDir: "down",
    color: "#7c6dfa",
    logoBg: "rgba(124,109,250,0.12)",
    icon: CreditCard,
    badge: "€",
    chain: "EUR",
  },
  {
    id: "binance",
    name: "Binance",
    sub: "CEX · Read-only API",
    balance: "$1,949",
    decimal: ".00",
    change: "+2.80%",
    changeDir: "up",
    color: "#f3ba2f",
    logoBg: "rgba(243,186,47,0.12)",
    icon: CreditCard,
    badge: "B",
    chain: "BSC",
  },
];

const CATEGORIES = [
  {
    icon: UtensilsCrossed,
    name: "Food & Dining",
    amount: "€312",
    pct: 78,
    color: "#f06a6a",
  },
  {
    icon: Car,
    name: "Transport",
    amount: "€187",
    pct: 47,
    color: "#f5c542",
  },
  {
    icon: ShoppingCart,
    name: "Groceries",
    amount: "€156",
    pct: 39,
    color: "#7c6dfa",
  },
  {
    icon: Smartphone,
    name: "Subscriptions",
    amount: "€89",
    pct: 22,
    color: "#4fd1a5",
  },
];

const TRANSACTIONS = [
  {
    icon: Coffee,
    name: "Starbucks",
    meta: "Today · Food",
    amount: "−€6.40",
    positive: false,
  },
  {
    icon: TrendingUp,
    name: "ETH received",
    meta: "Yesterday · MetaMask",
    amount: "+$240",
    positive: true,
  },
  {
    icon: Train,
    name: "NS Treinkaart",
    meta: "Apr 9 · Transport",
    amount: "−€49.00",
    positive: false,
  },
];

const SPENDING = {
  total: "€1,243",
  decimal: ".00",
  budget: "€2,000",
  daysLeft: 18,
  dates: "Mar 25 – Apr 24",
  spent: "€1,243",
  budgetTotal: "€2,000",
  left: "€757",
};

/* ─── Sparkline ────────────���──────────────────────────────────── */

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

/* ─── ChatSheet ────────────────────────────────────────────────── */

function ChatSheet({ onClose }: { onClose: () => void }) {
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
          <div className="w-9 h-9 rounded-[12px] bg-accent2 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-bg" />
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-sm text-foreground">
              Miru AI
            </p>
            <p className="text-[10px] text-accent2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent2 animate-pulse" />
              Watching your money
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-[8px] bg-surface2 border border-white/[0.06] flex items-center justify-center text-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col items-start">
            <p className="text-[10px] text-muted mb-1 pl-1">just now</p>
            <div className="bg-surface2 border border-white/[0.07] rounded-[16px_16px_16px_4px] px-4 py-2.5 text-[13px] leading-relaxed text-foreground">
              Hey! Portfolio is up €834 today — ETH leading the charge. 18 days
              left in your pay cycle and you&apos;re on track. What do you want
              to know?
            </div>
            <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-accent2/10 border border-accent2/20 text-[11px] text-accent2">
              ↑ ETH +4.1% · MetaMask
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="bg-accent2 rounded-[16px_16px_4px_16px] px-4 py-2.5 text-[13px] leading-relaxed text-bg font-medium">
              How much did I spend on eating out?
            </div>
          </div>

          <div className="flex flex-col items-start">
            <p className="text-[10px] text-muted mb-1 pl-1">just now</p>
            <div className="bg-surface2 border border-white/[0.07] rounded-[16px_16px_16px_4px] px-4 py-2.5 text-[13px] leading-relaxed text-foreground">
              €312 on food & dining this cycle — 23 transactions, €48 more than
              last cycle. Top spots: Albert Heijn €89, Thuisbezorgd €67,
              Starbucks €44.
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 py-2 overflow-x-auto hide-scrollbar shrink-0">
          {[
            "On track? 📊",
            "Subscriptions 📱",
            "Crypto 🔗",
            "Net worth 💰",
            "Top expense 💸",
          ].map((s) => (
            <button
              type="button"
              key={s}
              className="shrink-0 px-3 py-1.5 rounded-full bg-surface2 border border-white/[0.08] text-[11px] text-muted whitespace-nowrap hover:text-foreground hover:bg-accent2 hover:text-bg transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 px-4 pt-2.5 pb-7 border-t border-white/[0.06] shrink-0">
          <input
            placeholder="Ask anything about your money..."
            className="flex-1 min-w-0 bg-surface2 border border-white/[0.08] rounded-[22px] px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted outline-none focus:border-accent transition-colors"
          />
          <button
            type="button"
            className="w-10 h-10 rounded-[13px] bg-accent2 flex items-center justify-center text-bg text-lg shrink-0 active:scale-90 transition-transform"
            aria-label="Send message"
          >
            <ArrowUpRight size={18} />
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { user } = useAuth();
  const { setLoginModalOpen } = useChatStore();
  const [chatOpen, setChatOpen] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  return (
    <div className="min-h-screen pb-32 max-w-[430px] md:max-w-none mx-auto">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="animate-fade-up px-5 pt-6 flex items-center justify-between md:hidden">
        <p className="font-display font-bold text-2xl tracking-tight text-foreground">
          miru
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-surface border border-white/[0.1] flex items-center justify-center text-foreground relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger" />
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-surface border border-white/[0.1] flex items-center justify-center text-foreground"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Desktop Header Actions (Hidden on Mobile) */}
      <div className="hidden md:flex items-center justify-end gap-3 px-5 pt-8 mb-4">
        <button
          type="button"
          className="w-10 h-10 rounded-xl bg-surface border border-white/5 flex items-center justify-center text-foreground relative hover:bg-surface2 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-danger border-2 border-surface" />
        </button>
        {user ? (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-surface border border-white/5">
            <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center text-xs">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata?.full_name || user.email}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                "👤"
              )}
            </div>
            <span className="text-[13px] font-medium text-foreground">
              {user.user_metadata?.full_name?.split(" ")[0] ||
                user.email?.split("@")[0] ||
                "User"}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setLoginModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-accent text-white text-[13px] font-semibold hover:bg-accent/90 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>

      <div className="flex flex-col gap-0 md:gap-8">
        <div className="w-full">
          {/* Portfolio Hero */}
          <div className="animate-fade-up delay-100 bg-surface border border-white/[0.06] rounded-[22px] p-5 mx-5 md:mx-0 mt-6 md:mt-0">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-sm text-muted">Portfolio Value</p>
              <button
                type="button"
                onClick={() => setHideBalance(!hideBalance)}
                className="text-muted hover:text-foreground transition-colors"
                aria-label={hideBalance ? "Show balance" : "Hide balance"}
              >
                {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex items-baseline">
              <span className="font-display font-extrabold text-[44px] md:text-[56px] tracking-[-2px] text-foreground">
                {hideBalance ? "••••••" : NET_WORTH.total.split(".")[0]}
              </span>
              {!hideBalance && (
                <span className="font-display font-extrabold text-[44px] md:text-[56px] tracking-[-2px] text-muted">
                  .{NET_WORTH.total.split(".")[1]}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-accent2 text-sm font-medium">
              <TrendingUp size={14} />
              <span>
                {NET_WORTH.change} · {NET_WORTH.changePct}
              </span>
            </div>
            <Sparkline />
          </div>

          {/* Action Pills */}
          <div className="animate-fade-up delay-200 px-5 md:px-0 mt-6 flex gap-3">
            <button
              type="button"
              className="flex-1 h-12 rounded-2xl bg-surface2 border border-white/[0.1] flex items-center justify-center gap-2 text-sm font-semibold text-foreground hover:bg-surface transition-colors"
            >
              <PlusCircle size={18} />
              Add Money
            </button>
            <button
              type="button"
              className="flex-1 h-12 rounded-2xl bg-surface2 border border-white/[0.1] flex items-center justify-center gap-2 text-sm font-semibold text-foreground hover:bg-surface transition-colors"
            >
              <ArrowUpRight size={18} />
              Transfer
            </button>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="flex-1 h-12 rounded-2xl bg-foreground text-bg font-bold flex items-center justify-center gap-2 text-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <Sparkles size={18} />
              Ask Miru
            </button>
          </div>
        </div>
        {/* Accounts Section */}
        <div className="animate-fade-up delay-500 px-5 md:px-0 mt-10 md:mt-0">
          <div className="flex items-center justify-between mb-5">
            <p className="text-lg font-bold text-foreground">
              Connected Accounts
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                className="text-muted hover:text-foreground"
                aria-label="Filter"
              >
                <SlidersHorizontal size={20} />
              </button>
              <button
                type="button"
                className="text-muted hover:text-foreground"
                aria-label="Add account"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {ACCOUNTS.map((acc) => (
              <div
                key={acc.id}
                className="bg-surface border border-white/[0.06] rounded-[22px] px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-white/20 transition-colors"
              >
                <div
                  className="w-[4px] h-12 rounded-full"
                  style={{ background: acc.color }}
                />
                <div
                  className="w-12 h-12 rounded-[16px] flex items-center justify-center relative"
                  style={{ background: acc.logoBg }}
                >
                  <acc.icon size={22} className="text-foreground" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-[8px] bg-surface border-2 border-bg text-[9px] flex items-center justify-center text-foreground font-bold">
                    {acc.chain}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-foreground">
                    {acc.name}
                  </p>
                  <p className="text-[13px] text-muted">{acc.sub}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-0">
                    <span className="text-base font-bold text-foreground">
                      {hideBalance ? "••••" : acc.balance}
                    </span>
                    {!hideBalance && (
                      <span className="text-sm text-muted">
                        .{acc.decimal.split(".")[1]}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[12px] font-medium ${
                      acc.changeDir === "up"
                        ? "text-accent2"
                        : acc.changeDir === "down"
                          ? "text-danger"
                          : "text-muted"
                    }`}
                  >
                    {acc.change}
                  </p>
                </div>
                <ChevronRight size={16} className="text-muted shrink-0" />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="h-12 rounded-2xl bg-surface border border-white/[0.1] text-sm font-semibold text-muted w-full flex items-center justify-center gap-2 mt-4 hover:text-foreground transition-colors"
          >
            See all accounts
            <ChevronDown size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:mt-0">
          {/* This Pay Cycle (Spending) Section */}
          <div className="animate-fade-up delay-300 px-5 md:px-0 mt-10 md:mt-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-lg font-bold text-foreground">Pay Cycle</p>
              <button
                type="button"
                className="text-muted hover:text-foreground"
                aria-label="Calendar"
              >
                <Calendar size={20} />
              </button>
            </div>
            <div className="bg-surface border border-white/[0.06] rounded-[24px] overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <p className="text-base font-bold text-foreground">
                      Cycle Spending
                    </p>
                    <p className="text-[12px] text-muted mt-1">
                      {SPENDING.daysLeft} days remaining
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-0">
                      <span className="text-2xl font-bold text-foreground">
                        {hideBalance ? "••••" : SPENDING.total}
                      </span>
                      {!hideBalance && (
                        <span className="text-base font-medium text-muted">
                          .{SPENDING.decimal.split(".")[1]}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-muted mt-1">
                      of {SPENDING.budget}
                    </p>
                  </div>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden mb-6 bg-surface2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: "25%", background: "#f06a6a" }}
                  />
                  <div className="w-0.5 bg-surface" />
                  <div
                    className="h-full rounded-full"
                    style={{ width: "15%", background: "#f5c542" }}
                  />
                  <div className="w-0.5 bg-surface" />
                  <div
                    className="h-full rounded-full"
                    style={{ width: "13%", background: "#7c6dfa" }}
                  />
                  <div className="w-0.5 bg-surface" />
                  <div
                    className="h-full rounded-full"
                    style={{ width: "7%", background: "#4fd1a5" }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  {CATEGORIES.map((cat, i) => (
                    <div
                      key={cat.name}
                      className="flex items-center gap-4 py-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center shrink-0">
                        <cat.icon size={18} className="text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1.5">
                          <p className="text-[14px] font-medium text-foreground">
                            {cat.name}
                          </p>
                          <p
                            className="font-display font-semibold text-[14px]"
                            style={{ color: cat.color }}
                          >
                            {cat.amount}
                          </p>
                        </div>
                        <div className="h-[4px] rounded-full bg-surface2 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${cat.pct}%`,
                              background: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 border-t border-white/[0.06]">
                <div className="py-4 text-center border-r border-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1">
                    Spent
                  </p>
                  <p className="text-base font-bold text-danger">
                    {SPENDING.spent}
                  </p>
                </div>
                <div className="py-4 text-center border-r border-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1">
                    Limit
                  </p>
                  <p className="text-base font-bold text-foreground">
                    {SPENDING.budgetTotal}
                  </p>
                </div>
                <div className="py-4 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1">
                    Free
                  </p>
                  <p className="text-base font-bold text-accent2">
                    {SPENDING.left}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="animate-fade-up delay-400 px-5 md:px-0 mt-2 lg:mt-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-lg font-bold text-foreground">
                Recent Activity
              </p>
              <button
                type="button"
                className="text-accent text-sm font-semibold hover:underline"
              >
                View all
              </button>
            </div>
            <div className="bg-surface border border-white/[0.06] rounded-[24px] p-2 flex flex-col">
              {TRANSACTIONS.map((tx, i) => (
                <div
                  key={`${tx.name}-${i}`}
                  className={`flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/[0.02] transition-colors ${
                    i < TRANSACTIONS.length - 1
                      ? "border-b border-white/[0.04]"
                      : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-[14px] bg-surface2 flex items-center justify-center shrink-0">
                    <tx.icon size={20} className="text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-foreground">
                      {tx.name}
                    </p>
                    <p className="text-[12px] text-muted mt-0.5">{tx.meta}</p>
                  </div>
                  <p
                    className={`font-display font-semibold text-sm shrink-0 flex items-center gap-1 ${
                      tx.positive ? "text-accent2" : "text-danger"
                    }`}
                  >
                    {tx.amount}
                    <ChevronRight size={14} className="text-muted" />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat overlay */}
      {chatOpen && <ChatSheet onClose={() => setChatOpen(false)} />}

      {/* FAB */}
      {!chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="fixed bottom-[92px] md:bottom-10 right-5 md:right-10 z-[55] w-[56px] h-[56px] rounded-[18px] bg-accent2 flex items-center justify-center shadow-[0_8px_32px_rgba(79,209,165,0.35)] cursor-pointer active:scale-95 transition-all hover:scale-110"
        >
          <Sparkles size={24} className="text-bg" />
        </button>
      )}
    </div>
  );
}
