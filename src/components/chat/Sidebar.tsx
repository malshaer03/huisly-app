"use client";

import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

export function Sidebar() {
  const { user } = useChatStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName: string = user?.user_metadata?.name ?? "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
  }

  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (!userName) return null;

  return (
    <aside
      className="w-[260px] h-full bg-[var(--bg-sidebar)] flex flex-col flex-shrink-0"
      ref={menuRef}
    >
      <div className="p-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
          <span className="text-sm font-bold text-white">M</span>
        </div>
        <span className="text-[18px] font-bold text-white">Miru</span>
      </div>

      <div className="flex-1" />

      <div className="p-4 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {initials || userName[0]?.toUpperCase()}
            </span>
          </div>
          <span className="text-[13px] font-medium text-white truncate">
            {userName}
          </span>
        </button>

        {menuOpen && (
          <div className="mt-1 rounded-xl bg-[#2a2a2a] border border-[var(--border)] shadow-2xl overflow-hidden">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:bg-white/5 transition-colors"
            >
              <LogOut
                size={15}
                strokeWidth={1.8}
                className="text-[var(--text-muted)]"
              />
              Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
