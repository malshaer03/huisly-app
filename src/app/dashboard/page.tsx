"use client";

import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import {
  AccountsSection,
  ActionPills,
  ChatSheet,
  DashboardHeader,
  PayCycleSection,
  PortfolioHero,
  RecentActivitySection,
} from "@/components/dashboard";
import { useAuth } from "@/hooks/useAuth";
import { fetchDashboardData } from "@/services/dashboard";
import type { DashboardData } from "@/types/dashboard/api";

const DEFAULT_NET_WORTH = {
  total: 0,
  change: 0,
  changePct: 0,
  snapshots: [],
};

const DEFAULT_SPENDING = {
  total: 0,
  budget: 2000,
  categories: [],
  daysLeft: 0,
  cycleBounds: { start: "", end: "" },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    enabled: !!user,
  });

  const netWorth = data?.netWorth || DEFAULT_NET_WORTH;
  const accounts = data?.accounts || [];
  const spending = data?.spending || DEFAULT_SPENDING;
  const activity = data?.activity || [];

  return (
    <div className="min-h-screen pb-32 max-w-[430px] md:max-w-none mx-auto">
      <DashboardHeader onNotifications={() => {}} onSettings={() => {}} />

      <div className="flex flex-col gap-0 md:gap-8">
        <div className="w-full">
          <PortfolioHero
            netWorth={netWorth}
            hideBalance={hideBalance}
            isLoading={isLoading}
            onToggleBalance={() => setHideBalance(!hideBalance)}
          />

          <ActionPills
            onAddMoney={() => {}}
            onTransfer={() => {}}
            onAskMiru={() => setChatOpen(true)}
          />
        </div>

        <AccountsSection
          accounts={accounts}
          isLoading={isLoading}
          hideBalance={hideBalance}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:mt-0">
          <PayCycleSection
            spending={spending}
            hideBalance={hideBalance}
            isLoading={isLoading}
            onCalendar={() => {}}
          />

          <RecentActivitySection
            activity={activity}
            isLoading={isLoading}
            hideBalance={hideBalance}
            onViewAll={() => {}}
          />
        </div>
      </div>

      {chatOpen && <ChatSheet onClose={() => setChatOpen(false)} />}

      {!chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="fixed bottom-[92px] md:bottom-10 right-5 md:right-10 z-[55] w-[56px] h-[56px] rounded-[18px] bg-accent2 flex items-center justify-center shadow-[0_8px_32px_rgba(79,209,165,0.35)] cursor-pointer active:scale-95 transition-all hover:scale-110"
        >
          <Sparkles size={24} className="text-bg" />
        </button>
      )}
    </div>
  );
}
