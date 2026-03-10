import { create } from "zustand";
import type { Message } from "@/components/chat/MessageBubble";

interface ChatHistoryItem {
  id: string;
  title: string;
  active?: boolean;
}

interface ChatStore {
  // Messages
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Chat history
  history: ChatHistoryItem[];
  activeChatId: string | null;
  setActiveChat: (id: string) => void;

  // Current chat context
  title: string;
  matchCount: number | undefined;
  setTitle: (title: string) => void;
  setMatchCount: (count: number | undefined) => void;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hi! I'm your Huisly housing agent. 🏠\n\nWhere in the Netherlands are you looking, and what's your budget?",
  },
];

const INITIAL_HISTORY: ChatHistoryItem[] = [
  { id: "1", title: "Looking for Amsterdam flat", active: true },
  { id: "2", title: "Utrecht budget search" },
  { id: "3", title: "Den Haag expat housing" },
];

export const useChatStore = create<ChatStore>((set) => ({
  messages: INITIAL_MESSAGES,
  isLoading: false,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ isLoading: loading }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  history: INITIAL_HISTORY,
  activeChatId: "1",
  setActiveChat: (id) =>
    set((state) => ({
      activeChatId: id,
      sidebarOpen: false,
      history: state.history.map((item) => ({
        ...item,
        active: item.id === id,
      })),
    })),

  title: "Amsterdam search",
  matchCount: 14,
  setTitle: (title) => set({ title }),
  setMatchCount: (count) => set({ matchCount: count }),
}));
