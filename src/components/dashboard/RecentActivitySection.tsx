import { ChevronRight } from "lucide-react";
import type { RecentActivityProps } from "@/types/dashboard/ui";
import { TransactionRow } from "./TransactionRow";

export function RecentActivitySection({
  activity,
  isLoading,
  hideBalance,
  onViewAll,
}: RecentActivityProps) {
  const displayedActivity = activity.slice(0, 3);

  return (
    <div className="animate-fade-up delay-500 px-5 md:px-0 mt-8 md:mt-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Recent Activity
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Last {displayedActivity.length} transactions
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs text-accent2 hover:text-accent2/80 transition-colors font-medium flex items-center gap-1"
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      {isLoading ? (
        <div className="bg-surface border border-white/6 rounded-[22px] p-5 space-y-3">
          <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
        </div>
      ) : displayedActivity.length === 0 ? (
        <div className="h-32 flex items-center justify-center bg-surface border border-white/6 rounded-[22px]">
          <p className="text-sm text-muted">No transactions yet</p>
        </div>
      ) : (
        <div className="bg-surface border border-white/6 rounded-[22px] p-5">
          <div className="space-y-0">
            {displayedActivity.map((item, index) => (
              <TransactionRow
                key={item.id}
                transaction={item}
                isLast={index === displayedActivity.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
