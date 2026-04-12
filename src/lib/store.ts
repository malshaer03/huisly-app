import type { User } from "@supabase/supabase-js";
import { create } from "zustand";

interface ChatStore {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Login modal
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;

  // Chat widget
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  toggleChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  loginModalOpen: false,
  setLoginModalOpen: (open) => set({ loginModalOpen: open }),

  chatOpen: false,
  setChatOpen: (open) => set({ chatOpen: open }),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
}));
