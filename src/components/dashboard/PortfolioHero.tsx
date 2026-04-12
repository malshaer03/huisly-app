import { Eye, EyeOff, TrendingUp } from "lucide-react";
import type { PortfolioHeroProps } from "@/types/dashboard/ui";
import { Sparkline } from "./Sparkline";

export function PortfolioHero({
  netWorth,
  hideBalance,
  isLoading,
  onToggleBalance,
}: PortfolioHeroProps) {
  return (
    <div className="animate-fade-up delay-100 bg-surface border border-white/6 rounded-[22px] p-5 mx-5 md:mx-0 mt-6 md:mt-0">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-sm text-muted">Portfolio Value</p>
        <button
          type="button"
          onClick={onToggleBalance}
          className="text-muted hover:text-foreground transition-colors"
          aria-label={hideBalance ? "Show balance" : "Hide balance"}
        >
          {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <div className="flex items-baseline">
        <span className="font-display font-extrabold text-[44px] md:text-[56px] tracking-[-2px] text-foreground">
          {isLoading
            ? "••••••"
            : hideBalance
              ? "••••••"
              : `€${netWorth.total.toLocaleString("en-EU").split(".")[0]}`}
        </span>
        {!hideBalance && !isLoading && (
          <span className="font-display font-extrabold text-[44px] md:text-[56px] tracking-[-2px] text-muted">
            .{netWorth.total.toFixed(2).split(".")[1]}
          </span>
        )}
      </div>
      <div
        className={`flex items-center gap-1.5 mt-1 text-sm font-medium ${netWorth.change >= 0 ? "text-accent2" : "text-danger"}`}
      >
        {netWorth.change >= 0 ? (
          <TrendingUp size={14} />
        ) : (
          <TrendingUp size={14} className="rotate-180" />
        )}
        <span>
          {netWorth.change >= 0 ? "+" : ""}€
          {Math.abs(netWorth.change).toFixed(2)} ·{" "}
          {netWorth.changePct.toFixed(1)}%
        </span>
      </div>
      <Sparkline data={netWorth.snapshots} />
    </div>
  );
}
