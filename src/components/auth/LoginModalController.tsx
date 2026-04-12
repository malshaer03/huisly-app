"use client";

import { useChatStore } from "@/lib/store";
import { LoginModal } from "./LoginModal";

export function LoginModalController() {
  const { loginModalOpen, setLoginModalOpen } = useChatStore();
  return (
    <LoginModal
      open={loginModalOpen}
      onClose={() => setLoginModalOpen(false)}
    />
  );
}
