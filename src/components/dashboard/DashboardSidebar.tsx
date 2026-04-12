"use client";

import {
  ArrowLeftRight,
  LayoutDashboard,
  Settings2,
  Sparkles,
  Wallet as WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/dashboard",
    label: "Home",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/accounts",
    label: "Accounts",
    icon: WalletIcon,
  },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    icon: ArrowLeftRight,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings2,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col w-[260px] h-screen sticky top-0 bg-surface border-r border-white/5 p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
          <Sparkles size={18} className="text-bg" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-foreground">
          miru
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active
                  ? "bg-accent/10 text-accent font-semibold"
                  : "text-muted hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="p-4 rounded-2xl bg-surface2 border border-white/5">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
            Miru Pro
          </p>
          <p className="text-xs text-foreground/70 mb-3 leading-relaxed">
            Get advanced analytics and unlimited bank sync.
          </p>
          <button
            type="button"
            className="w-full py-2 rounded-lg bg-accent text-bg text-[13px] font-bold active:scale-95 transition-transform"
          >
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}
