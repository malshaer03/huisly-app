import { ArrowUpRight, Sparkles, X } from "lucide-react";
import type { ChatSheetProps } from "@/types/dashboard/ui";

export function ChatSheet({ onClose }: ChatSheetProps) {
  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-60 bg-black/65 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close chat"
      />

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[72%] bg-surface rounded-t-[28px] border border-white/8 border-b-0 z-70 flex flex-col overflow-hidden">
        <div className="w-9 h-1 rounded-full bg-white/10 mx-auto mt-3.5 shrink-0" />

        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/6 shrink-0">
          <div className="w-9 h-9 rounded-[12px] bg-accent2 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-bg" />
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-sm text-foreground">
              Miru AI
            </p>
            <p className="text-[10px] text-accent2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent2 animate-pulse" />
              Watching your money
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-[8px] bg-surface2 border border-white/6 flex items-center justify-center text-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col items-start">
            <p className="text-[10px] text-muted mb-1 pl-1">just now</p>
            <div className="bg-surface2 border border-white/7 rounded-[16px_16px_16px_4px] px-4 py-2.5 text-[13px] leading-relaxed text-foreground">
              Hey! Portfolio is looking good today. What do you want to know?
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 py-2 overflow-x-auto hide-scrollbar shrink-0">
          {[
            "On track? 📊",
            "Subscriptions 📱",
            "Crypto 🔗",
            "Net worth 💰",
            "Top expense 💸",
          ].map((s) => (
            <button
              type="button"
              key={s}
              className="shrink-0 px-3 py-1.5 rounded-full bg-surface2 border border-white/8 text-[11px] text-muted whitespace-nowrap hover:bg-accent2 hover:text-bg transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 px-4 pt-2.5 pb-7 border-t border-white/6 shrink-0">
          <input
            placeholder="Ask anything about your money..."
            className="flex-1 min-w-0 bg-surface2 border border-white/8 rounded-[22px] px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted outline-none focus:border-accent transition-colors"
          />
          <button
            type="button"
            className="w-10 h-10 rounded-[13px] bg-accent2 flex items-center justify-center text-bg text-lg shrink-0 active:scale-90 transition-transform"
            aria-label="Send message"
          >
            <ArrowUpRight size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
