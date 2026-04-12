import { LoginModalController } from "@/components/auth/LoginModalController";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg flex">
      <DashboardSidebar />
      <div className="flex-1 min-h-screen relative">
        <main className="mx-auto w-full md:max-w-[1000px] pb-32 md:pb-8 md:px-8">
          {children}
        </main>
        <BottomNav />
      </div>
      <LoginModalController />
      <ChatWidget />
    </div>
  );
}
