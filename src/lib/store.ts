import type { User } from "@supabase/supabase-js";
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
  sendMessage: (content: string) => void;
  newChat: () => void;

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

  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Login modal
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
}

const INITIAL_MESSAGES: Message[] = [];

const INITIAL_HISTORY: ChatHistoryItem[] = [
  { id: "1", title: "Looking for Amsterdam flat", active: true },
  { id: "2", title: "Utrecht budget search" },
  { id: "3", title: "Den Haag expat housing" },
];

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: INITIAL_MESSAGES,
  isLoading: false,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ isLoading: loading }),
  sendMessage: (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };
    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));
    // TODO: wire up Claude API
    setTimeout(() => {
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Got it! Let me search for that...",
          },
        ],
        isLoading: false,
      }));
    }, 1500);
  },
  newChat: () =>
    set({
      messages: [
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "Hi! I'm your Huisly housing agent. 🏠\n\nWhere in the Netherlands are you looking, and what's your budget?",
        },
      ],
      sidebarOpen: false,
    }),

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

  title: "",
  matchCount: undefined,
  setTitle: (title) => set({ title }),
  setMatchCount: (count) => set({ matchCount: count }),

  user: null,
  setUser: (user) => set({ user }),

  loginModalOpen: false,
  setLoginModalOpen: (open) => set({ loginModalOpen: open }),
}));
