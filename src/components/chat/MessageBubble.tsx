import type { UIMessage } from "ai";
import { MessageRenderer } from "./MessageRenderer";

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
      <div className="flex flex-col gap-3 max-w-full md:max-w-[500px]">
        {isUser ? (
          <div className="text-[15px] leading-relaxed bg-[var(--bg-bubble-user)] text-white rounded-2xl rounded-tr-sm px-4 py-3">
            {text}
          </div>
        ) : (
          <div className="text-[15px] leading-relaxed text-[var(--text-secondary)] py-1">
            <MessageRenderer content={text} />
          </div>
        )}
      </div>
    </div>
  );
}
