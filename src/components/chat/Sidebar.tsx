"use client";

import {
  ChevronRight,
  HelpCircle,
  LogOut,
  Plus,
  Settings,
  Sliders,
  UserPlus,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

interface SidebarProps {
  onNewChat: () => void;
}

export function Sidebar({ onNewChat }: SidebarProps) {
  const { history, setActiveChat, user } = useChatStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName: string = user?.user_metadata?.name ?? "";
  const trialDaysLeft: number | undefined = undefined; // TODO: derive from user subscription

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

  return (
    <aside className="w-[260px] h-full bg-[var(--bg-sidebar)] flex flex-col flex-shrink-0">
      {/* Logo + New Chat */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="text-[18px] font-bold text-white">alless</span>
        </div>

        <button
          type="button"
          onClick={onNewChat}
          className="w-full h-9 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--border)] transition-colors flex items-center gap-2 px-4 text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        >
          <Plus size={14} strokeWidth={2.5} />
          New chat
        </button>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 flex flex-col gap-0.5">
        {history.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveChat(item.id)}
            className={`w-full h-9 rounded-md px-3 text-left text-[13px] truncate transition-colors ${
              item.active
                ? "bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>

      {/* User row */}
      {!!userName && (
        <div
          className="p-4 border-t border-[var(--border)] relative"
          ref={menuRef}
        >
          {/* Popover menu */}
          {menuOpen && (
            <div className="absolute bottom-full left-2 right-2 mb-2 rounded-xl bg-[#2a2a2a] border border-[var(--border)] shadow-2xl overflow-hidden z-50">
              {/* User header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">
                    {initials || userName[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-white truncate">
                    {userName}
                  </div>
                  {trialDaysLeft !== undefined && (
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Pro Trial
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[var(--border)] mx-2" />

              {/* Add account */}
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:bg-white/5 transition-colors"
              >
                <UserPlus
                  size={15}
                  strokeWidth={1.8}
                  className="text-[var(--text-muted)]"
                />
                Add an account
              </button>

              <div className="border-t border-[var(--border)] mx-2" />

              {/* Upgrade plan */}
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:bg-white/5 transition-colors"
              >
                <Zap
                  size={15}
                  strokeWidth={1.8}
                  className="text-[var(--text-muted)]"
                />
                Upgrade plan
              </button>

              {/* Personalization */}
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:bg-white/5 transition-colors"
              >
                <Sliders
                  size={15}
                  strokeWidth={1.8}
                  className="text-[var(--text-muted)]"
                />
                Personalization
              </button>

              {/* Settings */}
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:bg-white/5 transition-colors"
              >
                <Settings
                  size={15}
                  strokeWidth={1.8}
                  className="text-[var(--text-muted)]"
                />
                Settings
              </button>

              <div className="border-t border-[var(--border)] mx-2" />

              {/* Help */}
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:bg-white/5 transition-colors"
              >
                <HelpCircle
                  size={15}
                  strokeWidth={1.8}
                  className="text-[var(--text-muted)]"
                />
                <span className="flex-1 text-left">Help</span>
                <ChevronRight size={13} className="text-[var(--text-muted)]" />
              </button>

              {/* Log out */}
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

              <div className="border-t border-[var(--border)] mx-2" />

              {/* Footer links */}
              <div className="px-4 py-2.5 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <button
                  type="button"
                  className="hover:text-[var(--text-secondary)] transition-colors"
                >
                  Privacy Policy
                </button>
                <span>·</span>
                <button
                  type="button"
                  className="hover:text-[var(--text-secondary)] transition-colors"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          )}

          {/* User row button */}
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
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[13px] font-medium text-white truncate">
                {userName}
              </span>
              {trialDaysLeft !== undefined && (
                <span className="text-[11px] text-[var(--accent)]">
                  Pro Trial — {trialDaysLeft} days left
                </span>
              )}
            </div>
          </button>
        </div>
      )}
    </aside>
  );
}
