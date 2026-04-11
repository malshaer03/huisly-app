"use client";

import { ArrowUp, Mic, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** When true, renders without the gradient wrapper (for centered empty state) */
  inline?: boolean;
  /** Called with the bar's rendered height so parent can offset message list */
  onHeightChange?: (height: number) => void;
}

interface InputBoxProps {
  value: string;
  disabled?: boolean;
  placeholder: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
}

const InputBox = ({
  value,
  disabled,
  placeholder,
  textareaRef,
  onChange,
  onKeyDown,
  onSend,
}: InputBoxProps) => (
  <div className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl px-4 pt-3 pb-3">
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      rows={1}
      disabled={disabled}
      className="w-full bg-transparent text-[16px] text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none outline-none leading-relaxed max-h-40 overflow-y-auto mb-3"
    />
    <div className="flex items-center justify-between">
      <button
        type="button"
        title="Attach file"
        className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[#3a3a4a] transition-colors"
      >
        <Plus size={18} />
      </button>
      <div className="flex items-center gap-3">
        <button
          type="button"
          title="Voice input"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <Mic size={19} />
        </button>
        <button
          type="button"
          onClick={onSend}
          disabled={disabled}
          title="Send"
          className={`w-11 h-11 rounded-full transition-colors flex items-center justify-center ${value.trim() ? "bg-[var(--accent)] hover:bg-[var(--accent-hover)]" : "bg-[#252530] hover:bg-[#2e2e3c] disabled:cursor-not-allowed"}`}
        >
          <ArrowUp size={18} color="white" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  </div>
);

export function InputBar({
  onSend,
  disabled,
  placeholder = "Ask Miru anything…",
  inline = false,
  onHeightChange,
}: InputBarProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Auto-grow textarea
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally re-run on value change
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  // Report wrapper height to parent so it can pad the message list
  useEffect(() => {
    if (!onHeightChange || !wrapperRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      onHeightChange(entry.contentRect.height);
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [onHeightChange]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    textareaRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (inline) {
    return (
      <InputBox
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        textareaRef={textareaRef}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onSend={handleSend}
      />
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="w-full px-4 pt-3 pb-6"
      style={{
        background:
          "linear-gradient(to top, rgba(15,15,16,0.98) 60%, rgba(15,15,16,0.7) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="w-full max-w-2xl mx-auto">
        <InputBox
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          textareaRef={textareaRef}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}
