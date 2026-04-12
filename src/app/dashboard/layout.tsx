import { TopNav } from "@/components/dashboard/TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <TopNav />
      {/* Mobile: phone-width column, Desktop: full width */}
      <div className="mx-auto w-full  md:max-w-[1200px] md:mx-auto min-h-screen relative">
        <main className="pb-32 md:pb-8">{children}</main>
        {/* <BottomNav /> */}
      </div>
    </div>
  );
}
