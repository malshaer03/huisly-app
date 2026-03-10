"use client";

import { ArrowUp, Mic, Plus } from "lucide-react";
import { useRef, useState } from "react";

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    textareaRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="w-full px-4 pt-3 pb-6"
      style={{
        background:
          "linear-gradient(to top, rgba(15,15,16,0.98) 60%, rgba(15,15,16,0.7) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="w-full max-w-2xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl px-4 pt-3 pb-3">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Reply to Huisly"
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent text-[16px] text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none outline-none leading-relaxed max-h-40 overflow-y-auto mb-3"
        />

        {/* Button row */}
        <div className="flex items-center justify-between">
          {/* Plus / attach */}
          <button
            type="button"
            title="Attach file"
            className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[#3a3a4a] transition-colors"
          >
            <Plus size={18} />
          </button>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              title="Voice input"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <Mic size={19} />
            </button>

            {/* Send / waveform */}
            <button
              type="button"
              onClick={handleSend}
              disabled={disabled}
              title="Send"
              className={`w-11 h-11 rounded-full transition-colors flex items-center justify-center ${value.trim() ? "bg-[var(--accent)] hover:bg-[var(--accent-hover)]" : "bg-[#252530] hover:bg-[#2e2e3c] disabled:cursor-not-allowed"}`}
            >
              <ArrowUp size={18} color="white" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
