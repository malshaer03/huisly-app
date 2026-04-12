"use client";

import type { ChatStatus, UIMessage } from "ai";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { InputBar } from "./InputBar";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  messages: UIMessage[];
  status: ChatStatus;
  sendMessage: (options: { text: string }) => void;
  onClose: () => void;
}

export function ChatWindow({
  messages,
  status,
  sendMessage,
  onClose,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [inputHeight, setInputHeight] = useState(100);

  const messageCount = messages.length;
  const isEmpty = messageCount === 0;
  const isLoading = status === "submitted" || status === "streaming";

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — scroll on count or stream
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: status === "streaming" ? "instant" : "smooth",
    });
  }, [messageCount, status, messages]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-[var(--border)]">
        <div>
          <p className="text-[14px] font-semibold text-[var(--text-primary)]">
            Miru
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">
            Your finance assistant
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {isEmpty ? (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 gap-6">
          <div className="text-center space-y-1">
            <p className="text-[15px] font-medium text-[var(--text-primary)]">
              Ask me anything
            </p>
            <p className="text-[13px] text-[var(--text-muted)]">
              Spending, net worth, subscriptions…
            </p>
          </div>
          <div className="w-full">
            <InputBar
              onSend={(text) => sendMessage({ text })}
              placeholder="e.g. What's my net worth?"
              inline
              disabled={isLoading}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto py-4 px-3"
            style={{ paddingBottom: inputHeight + 12 }}
          >
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {status === "submitted" && (
                <div className="flex items-center gap-1.5 py-1 px-1">
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

          {/* Floating input */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <InputBar
              onSend={(text) => sendMessage({ text })}
              placeholder="Ask about your finances…"
              disabled={isLoading}
              onHeightChange={setInputHeight}
            />
          </div>
        </>
      )}
    </div>
  );
}
