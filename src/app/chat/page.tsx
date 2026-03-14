"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo } from "react";
import { LoginModal } from "@/components/auth/LoginModal";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Sidebar } from "@/components/chat/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useChatStore } from "@/lib/store";

export default function ChatPage() {
  useAuth();
  const {
    sidebarOpen,
    setSidebarOpen,
    loginModalOpen,
    setLoginModalOpen,
    user,
  } = useChatStore();

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, status, sendMessage, setMessages } = useChat({
    transport,
  });

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--bg-base)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/50 md:hidden w-full cursor-default"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 md:relative md:block
          transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Sidebar onNewChat={() => setMessages([])} />
      </div>

      <ChatWindow
        messages={messages}
        status={status}
        sendMessage={sendMessage}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        setLoginModalOpen={setLoginModalOpen}
      />

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}
