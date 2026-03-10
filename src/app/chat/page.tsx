"use client";

import { ChatWindow } from "@/components/chat/ChatWindow";
import type { Message } from "@/components/chat/MessageBubble";
import { Sidebar } from "@/components/chat/Sidebar";
import { useChatStore } from "@/lib/store";

export default function ChatPage() {
  const {
    addMessage,
    setLoading,
    setMessages,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    history,
    setActiveChat,
  } = useChatStore();

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    addMessage(userMessage);
    setLoading(true);

    // TODO: wire up Claude API
    setTimeout(() => {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Got it! Let me search for that...",
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
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
        <Sidebar
          history={history}
          onNewChat={() => {
            setMessages([
              {
                id: Date.now().toString(),
                role: "assistant",
                content:
                  "Hi! I'm your Huisly housing agent. 🏠\n\nWhere in the Netherlands are you looking, and what's your budget?",
              },
            ]);
            setSidebarOpen(false);
          }}
          onSelectChat={setActiveChat}
          userName="Ahmed"
          trialDaysLeft={5}
        />
      </div>

      <ChatWindow onSend={handleSend} onToggleSidebar={toggleSidebar} />
    </div>
  );
}
