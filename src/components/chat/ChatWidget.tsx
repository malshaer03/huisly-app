"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle } from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChatStore } from "@/lib/store";
import { ChatWindow } from "./ChatWindow";

export function ChatWidget() {
  const { user } = useAuth();
  const { chatOpen, toggleChat, setLoginModalOpen } = useChatStore();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { userId: user?.id },
      }),
    [user?.id],
  );

  const { messages, status, sendMessage } = useChat({ transport });

  const handleFabClick = () => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }
    toggleChat();
  };

  return (
    <>
      {/* Chat overlay */}
      {chatOpen && user && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[560px] rounded-2xl overflow-hidden shadow-2xl border border-[var(--border)] bg-[var(--bg-base)] relative">
          <ChatWindow
            messages={messages}
            status={status}
            sendMessage={sendMessage}
            onClose={toggleChat}
          />
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={handleFabClick}
        aria-label="Open Miru chat"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-lg transition-all hover:scale-105 flex items-center justify-center"
      >
        <MessageCircle size={24} />
      </button>
    </>
  );
}
