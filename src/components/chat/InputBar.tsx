"use client";

import { ArrowUp, Upload } from "lucide-react";
import { useState } from "react";

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-[var(--border)] bg-[var(--bg-base)] py-4 px-4">
      <div className="w-full max-w-2xl mx-auto flex items-center gap-3 bg-[var(--bg-input)] rounded-xl px-5 py-3">
        {/* Upload button */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors flex-shrink-0"
          type="button"
          title="Upload document"
        >
          <Upload size={16} />
        </button>

        {/* Input */}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Huisly…"
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent text-[15px] text-[var(--text-primary)] placeholder-[var(--text-placeholder)] resize-none outline-none leading-relaxed max-h-40 overflow-y-auto"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="w-10 h-10 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0"
        >
          <ArrowUp size={16} color="white" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
