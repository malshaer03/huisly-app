import type { UIMessage } from "ai";

interface MessageBubbleProps {
  message: UIMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const text = message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col gap-3 max-w-[85%] md:max-w-[580px]">
        <div
          className={`text-[15px] leading-relaxed ${
            isUser
              ? "bg-[var(--bg-bubble-user)] text-white rounded-2xl rounded-tr-sm px-4 py-3"
              : "text-[var(--text-secondary)] py-1"
          }`}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
