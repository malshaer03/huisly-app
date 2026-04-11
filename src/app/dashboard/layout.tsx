import { LoginModalController } from "@/components/auth/LoginModalController";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {children}
      <ChatWidget />
      <LoginModalController />
    </div>
  );
}
