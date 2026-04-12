"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/accounts", label: "Accounts" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/transfers", label: "Transfers" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function TopNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="hidden md:flex bg-background top-0 z-50">
      <div className="mx-auto w-full max-w-[1200px] flex items-center justify-between px-6 py-3">
        {/* Logo + Dashboard tab */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-accent to-[#a78bfa] flex items-center justify-center text-xl" />
          </Link>
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${active ? "bg-accent/15 text-accent" : "text-muted hover:text-foreground"}`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side: User profile */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            <span>+</span> Record
          </button>
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-[10px] bg-white/5 cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-sm">
              👤
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-medium text-foreground">
                Unknown
              </span>
              <span className="text-[10px] text-muted">Premium</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
