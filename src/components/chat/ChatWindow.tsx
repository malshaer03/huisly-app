"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/lib/store";
import { InputBar } from "./InputBar";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  onSend: (message: string) => void;
  onToggleSidebar?: () => void;
}

export function ChatWindow({ onSend, onToggleSidebar }: ChatWindowProps) {
  const { messages, isLoading, title, matchCount } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  const messageCount = messages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
      {/* Top bar */}
      <div className="h-16 border-b border-[var(--border)] flex items-center px-4 gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="md:hidden w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] flex-shrink-0"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="text-[14px] font-medium text-[var(--text-secondary)]">
          {title}
        </span>
        {matchCount !== undefined && (
          <div className="flex items-center gap-1.5 bg-[#1a1f3e] rounded-xl px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[11px] font-semibold text-[#7a8fd4]">
              {matchCount} matches
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 md:py-10">
        <div className="w-full max-w-2xl mx-auto px-4 flex flex-col gap-5">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">H</span>
              </div>
              <div className="bg-[var(--bg-bubble-ai)] rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <InputBar onSend={onSend} />
    </div>
  );
}
