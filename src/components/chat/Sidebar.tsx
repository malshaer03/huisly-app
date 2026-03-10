"use client";

import { Plus } from "lucide-react";

interface ChatHistoryItem {
  id: string;
  title: string;
  active?: boolean;
}

interface SidebarProps {
  history: ChatHistoryItem[];
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  userName?: string;
  trialDaysLeft?: number;
}

export function Sidebar({
  history,
  onNewChat,
  onSelectChat,
  userName = "A",
  trialDaysLeft,
}: SidebarProps) {
  return (
    <aside className="w-[260px] h-full bg-[var(--bg-sidebar)] flex flex-col flex-shrink-0">
      {/* Logo + New Chat */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
            <span className="text-sm font-bold text-white">h</span>
          </div>
          <span className="text-[18px] font-bold text-white">huisly</span>
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
            onClick={() => onSelectChat(item.id)}
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
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {userName[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-medium text-white truncate">
              {userName}
            </span>
            {trialDaysLeft !== undefined && (
              <span className="text-[11px] text-[var(--accent)]">
                Pro Trial — {trialDaysLeft} days left
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
