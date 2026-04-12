"use client";

import {
  ArrowLeftRight,
  LayoutDashboard,
  Settings2,
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

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-surface/90 backdrop-blur-2xl border-t border-white/10 pb-7 pt-3 flex justify-around">
      {tabs.map((tab) => {
        const active = isActive(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 transition-all ${
              active ? "opacity-100" : "opacity-35"
            }`}
          >
            <div
              className={`w-11 h-7 rounded-[14px] flex items-center justify-center transition-colors ${
                active ? "bg-surface2" : "bg-transparent"
              }`}
            >
              <Icon size={18} className="text-foreground" />
            </div>
            <span className="text-[10px] font-semibold text-foreground">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
