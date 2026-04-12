import { ArrowUpRight, PlusCircle, Sparkles } from "lucide-react";
import type { ActionPillsProps } from "@/types/dashboard/ui";

export function ActionPills({
  onAddMoney,
  onTransfer,
  onAskMiru,
}: ActionPillsProps) {
  return (
    <div className="animate-fade-up delay-200 px-5 md:px-0 mt-6 flex gap-3">
      <button
        type="button"
        onClick={onAddMoney}
        className="flex-1 h-12 rounded-2xl bg-surface2 border border-white/10 flex items-center justify-center gap-2 text-sm font-semibold text-foreground hover:bg-surface transition-colors"
      >
        <PlusCircle size={18} />
        Add Money
      </button>
      <button
        type="button"
        onClick={onTransfer}
        className="flex-1 h-12 rounded-2xl bg-surface2 border border-white/10 flex items-center justify-center gap-2 text-sm font-semibold text-foreground hover:bg-surface transition-colors"
      >
        <ArrowUpRight size={18} />
        Transfer
      </button>
      <button
        type="button"
        onClick={onAskMiru}
        className="flex-1 h-12 rounded-2xl bg-foreground text-bg font-bold flex items-center justify-center gap-2 text-sm hover:opacity-90 active:scale-95 transition-all"
      >
        <Sparkles size={18} />
        Ask Miru
      </button>
    </div>
  );
}
