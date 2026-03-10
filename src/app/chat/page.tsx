"use client";

import { useState } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { Message } from "@/components/chat/MessageBubble";

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hi! I'm your Huisly housing agent. 🏠\n\nWhere in the Netherlands are you looking, and what's your budget?",
  },
];

const HISTORY = [
  { id: "1", title: "Looking for Amsterdam flat", active: true },
  { id: "2", title: "Utrecht budget search" },
  { id: "3", title: "Den Haag expat housing" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // TODO: wire up Claude API
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Got it! Let me search for that...",
      };
      setMessages((prev) => [...prev, reply]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      <Sidebar
        history={HISTORY}
        onNewChat={() => setMessages(INITIAL_MESSAGES)}
        onSelectChat={(id) => console.log("select", id)}
        userName="Ahmed"
        trialDaysLeft={5}
      />
      <ChatWindow
        messages={messages}
        onSend={handleSend}
        isLoading={isLoading}
        title="Amsterdam search"
        matchCount={14}
      />
    </div>
  );
}
