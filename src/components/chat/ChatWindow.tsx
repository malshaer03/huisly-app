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
    <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
      {/* Top bar — glass effect */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0 z-10"
        style={{
          background: "rgba(15,15,16,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Left: sidebar toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors flex-shrink-0"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Center: title pill */}
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-[var(--text-primary)]">
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

        {/* Right: new chat */}
        <button
          type="button"
          aria-label="New chat"
          className="w-10 h-10 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] flex items-center justify-center transition-colors flex-shrink-0"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="12" y1="9" x2="12" y2="15" />
            <line x1="9" y1="12" x2="15" y2="12" />
          </svg>
        </button>
      </div>

      {/* Messages — extends behind floating input */}
      <div className="flex-1 overflow-y-auto py-6 md:py-10 pb-36">
        <div className="w-full max-w-2xl mx-auto px-4 flex flex-col gap-5">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex items-center gap-1.5 py-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input — floating over content */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <InputBar onSend={onSend} />
      </div>
    </div>
  );
}
