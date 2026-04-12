import { Building2, ChevronRight, Wallet } from "lucide-react";
import type { AccountRowProps } from "@/types/dashboard/ui";

export function AccountRow({
  account,
  hideBalance,
  isLoading,
}: AccountRowProps) {
  return (
    <div
      className={`bg-surface border border-white/6 rounded-[22px] px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-white/20 transition-colors ${isLoading ? "animate-pulse" : ""}`}
    >
      <div
        className="w-[4px] h-12 rounded-full"
        style={{
          background:
            account.provider === "truelayer"
              ? "#ff6200"
              : account.provider === "zerion"
                ? "#f5841f"
                : "#f3ba2f",
        }}
      />
      <div className="w-12 h-12 rounded-[16px] bg-white/5 flex items-center justify-center relative">
        {account.accountType === "bank" ? (
          <Building2 size={22} className="text-foreground" />
        ) : (
          <Wallet size={22} className="text-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-foreground truncate">
          {account.accountName || account.provider}
        </p>
        <p className="text-[13px] text-muted truncate capitalize">
          {account.accountType} · {account.syncStatus}
        </p>
      </div>
      <div className="text-right shrink-0">
        <div className="flex items-baseline justify-end gap-0">
          <span className="text-base font-bold text-foreground">
            {hideBalance ? "••••" : "€0"}
          </span>
        </div>
      </div>
      <ChevronRight size={16} className="text-muted shrink-0" />
    </div>
  );
}
