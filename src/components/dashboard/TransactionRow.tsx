import { ChevronRight, CreditCard } from "lucide-react";
import type { TransactionRowProps } from "@/types/dashboard/ui";

export function TransactionRow({ transaction, isLast }: TransactionRowProps) {
  return (
    <div
      className={`flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/2 transition-colors ${
        !isLast ? "border-b border-white/4" : ""
      }`}
    >
      <div className="w-11 h-11 rounded-[14px] bg-surface2 flex items-center justify-center shrink-0">
        <CreditCard size={20} className="text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-foreground truncate">
          {transaction.merchantName || "Unknown Merchant"}
        </p>
        <p className="text-[12px] text-muted mt-0.5">
          {transaction.transactionDate} · {transaction.category}
        </p>
      </div>
      <p
        className={`font-display font-semibold text-sm shrink-0 flex items-center gap-1 ${
          transaction.transactionType === "credit"
            ? "text-accent2"
            : "text-danger"
        }`}
      >
        {transaction.transactionType === "debit" ? "−" : "+"}€
        {Math.abs(Number(transaction.amount)).toFixed(2)}
        <ChevronRight size={14} className="text-muted" />
      </p>
    </div>
  );
}
