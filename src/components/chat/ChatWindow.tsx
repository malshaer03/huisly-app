"use client";

import { useEffect, useRef } from "react";
import { MessageBubble, type Message } from "./MessageBubble";
import { InputBar } from "./InputBar";

interface ChatWindowProps {
  messages: Message[];
  onSend: (message: string) => void;
  isLoading?: boolean;
  title?: string;
  matchCount?: number;
}

export function ChatWindow({
  messages,
  onSend,
  isLoading,
  title = "New conversation",
  matchCount,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="h-16 border-b border-[var(--border)] flex items-center px-[260px] gap-3 flex-shrink-0">
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
      <div className="flex-1 overflow-y-auto py-10 px-[260px] flex flex-col gap-5">
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

      {/* Input */}
      <InputBar onSend={onSend} disabled={isLoading} />
    </div>
  );
}
