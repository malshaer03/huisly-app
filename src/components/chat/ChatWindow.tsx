"use client";

import type { ChatStatus, UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { InputBar } from "./InputBar";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  messages: UIMessage[];
  status: ChatStatus;
  sendMessage: (options: { text: string }) => void;
  toggleSidebar: () => void;
  user: unknown;
  setLoginModalOpen: (open: boolean) => void;
}

export function ChatWindow({
  messages,
  status,
  sendMessage,
  toggleSidebar,
  user,
  setLoginModalOpen,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState(120);

  const messageCount = messages.length;
  const isEmpty = messageCount === 0;
  const isLoading = status === "submitted" || status === "streaming";

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount]);

  const handleSend = (content: string) => {
    sendMessage({ text: content });
  };

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
          onClick={toggleSidebar}
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

        {/* Center: spacer */}
        <div className="flex-1" />

        {/* Right: sign in or avatar */}
        {!user ? (
          <button
            type="button"
            onClick={() => setLoginModalOpen(true)}
            className="h-9 px-4 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-semibold transition-colors flex-shrink-0"
          >
            Sign in
          </button>
        ) : null}
      </div>

      {isEmpty ? (
        /* Empty state — input centered */
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16 gap-8">
          <div className="text-center space-y-2">
            <h1 className="text-[26px] font-semibold text-[var(--text-primary)] tracking-tight">
              Where would you like to live?
            </h1>
            <p className="text-[15px] text-[var(--text-muted)]">
              Tell me your city, budget, and move-in date.
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <InputBar
              onSend={handleSend}
              placeholder="e.g. Amsterdam, 2-bed, under €1,400, from April"
              inline
              disabled={isLoading}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Messages — extends behind floating input */}
          <div
            className="flex-1 overflow-y-auto py-6 md:py-10"
            style={{ paddingBottom: inputHeight + 24 }}
          >
            <div className="w-full max-w-2xl mx-auto px-4 flex flex-col gap-5">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Show bounce indicator only when request submitted but not yet streaming */}
              {status === "submitted" && (
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
            <InputBar
              onSend={handleSend}
              disabled={isLoading}
              onHeightChange={setInputHeight}
            />
          </div>
        </>
      )}
    </div>
  );
}
