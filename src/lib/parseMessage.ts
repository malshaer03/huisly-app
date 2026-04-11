export type TextPart = {
  type: "text";
  content: string;
};

export type MessagePart = TextPart;

export function parseMessage(text: string): MessagePart[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return [{ type: "text", content: trimmed }];
}
