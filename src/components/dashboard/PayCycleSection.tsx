import { Calendar } from "lucide-react";
import type { PayCycleSectionProps } from "@/types/dashboard/ui";
import { CategoryRow } from "./CategoryRow";

export function PayCycleSection({
  spending,
  hideBalance,
  isLoading,
  onCalendar,
}: PayCycleSectionProps) {
  const budgetPercent = (spending.total / spending.budget) * 100;
  const remaining = spending.budget - spending.total;

  return (
    <div className="animate-fade-up delay-400 px-5 md:px-0 mt-8 md:mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Pay Cycle</h2>
          <p className="text-xs text-muted mt-0.5">
            {spending.daysLeft} days remaining
          </p>
        </div>
        <button
          type="button"
          onClick={onCalendar}
          className="w-8 h-8 rounded-lg bg-surface2 border border-white/6 flex items-center justify-center text-muted hover:text-foreground transition-colors"
          aria-label="Change cycle dates"
        >
          <Calendar size={16} />
        </button>
      </div>

      {isLoading ? (
        <div className="bg-surface border border-white/6 rounded-[22px] p-5 animate-pulse h-32" />
      ) : (
        <div className="bg-surface border border-white/6 rounded-[22px] p-5 space-y-4">
          {/* Budget Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">
                {hideBalance ? "••••" : `€${spending.total.toFixed(2)}`}
              </p>
              <p className="text-xs text-muted">
                {hideBalance ? "••••" : `€${spending.budget.toFixed(2)}`}
              </p>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  budgetPercent > 100 ? "bg-danger" : "bg-accent2"
                }`}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2 pt-2">
            {spending.categories.map((category) => (
              <CategoryRow key={category.name} category={category} />
            ))}
          </div>

          {/* Footer Stats */}
          <div className="flex gap-4 text-xs pt-2 border-t border-white/6">
            <div>
              <p className="text-muted mb-0.5">Remaining</p>
              <p className="font-semibold text-accent2">
                {hideBalance ? "••••" : `€${Math.max(0, remaining).toFixed(2)}`}
              </p>
            </div>
            <div>
              <p className="text-muted mb-0.5">Cycle</p>
              <p className="font-semibold text-foreground">
                {spending.cycleBounds.start} – {spending.cycleBounds.end}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
