import type { User } from "@supabase/supabase-js";
import { create } from "zustand";

interface ChatHistoryItem {
  id: string;
  title: string;
  active?: boolean;
}

interface ChatStore {
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

const INITIAL_HISTORY: ChatHistoryItem[] = [
  { id: "1", title: "Looking for Amsterdam flat", active: true },
  { id: "2", title: "Utrecht budget search" },
  { id: "3", title: "Den Haag expat housing" },
];

export const useChatStore = create<ChatStore>((set) => ({
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
