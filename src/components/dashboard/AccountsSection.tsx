import { Plus, SlidersHorizontal } from "lucide-react";
import type { AccountsSectionProps } from "@/types/dashboard/ui";
import { AccountRow } from "./AccountRow";

export function AccountsSection({
  accounts,
  isLoading,
  hideBalance,
}: AccountsSectionProps) {
  return (
    <div className="animate-fade-up delay-300 px-5 md:px-0 mt-8 md:mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Accounts</h2>
          <p className="text-xs text-muted mt-0.5">
            {accounts.length} connected
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-surface2 border border-white/6 flex items-center justify-center text-muted hover:text-foreground transition-colors"
            aria-label="Filter accounts"
          >
            <SlidersHorizontal size={16} />
          </button>
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-surface2 border border-white/6 flex items-center justify-center text-muted hover:text-foreground transition-colors"
            aria-label="Add account"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {isLoading ? (
          <>
            <div className="h-16 bg-surface border border-white/6 rounded-[22px] animate-pulse" />
            <div className="h-16 bg-surface border border-white/6 rounded-[22px] animate-pulse" />
            <div className="h-16 bg-surface border border-white/6 rounded-[22px] animate-pulse" />
          </>
        ) : accounts.length === 0 ? (
          <div className="h-32 flex items-center justify-center bg-surface border border-white/6 rounded-[22px]">
            <p className="text-sm text-muted">No accounts connected yet</p>
          </div>
        ) : (
          accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              hideBalance={hideBalance}
            />
          ))
        )}
      </div>
    </div>
  );
}
