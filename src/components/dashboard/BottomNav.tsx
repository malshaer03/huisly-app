"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={active ? "#7c6dfa" : "none"}
        stroke={active ? "#7c6dfa" : "#5a5a6e"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="Home"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#7c6dfa" : "#5a5a6e"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="Analytics"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: "/dashboard/transfers",
    label: "Transfers",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#7c6dfa" : "#5a5a6e"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="Transfers"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
        <polyline points="19 5 12 12 5 5" opacity="0.4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#7c6dfa" : "#5a5a6e"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="Profile"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-[#0a0a0f]/92 backdrop-blur-[20px] border-t border-white/[0.06]">
      <div className="flex justify-between items-center px-4 pt-3 pb-6">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1.5 flex-1 transition-opacity ${active ? "opacity-100" : "opacity-40"}`}
            >
              {tab.icon(active)}
              <span
                className={`text-[10px] tracking-wider font-syne ${active ? "text-accent" : "text-muted"}`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
