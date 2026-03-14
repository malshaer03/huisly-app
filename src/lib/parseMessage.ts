export type TextPart = {
  type: "text";
  content: string;
};

export type ComponentPart = {
  type: "listing";
  data: {
    id: string;
    price: number;
    city: string;
    size_m2: number | null;
    furnished: boolean | null;
    available_from: string | null;
    room_type: string | null;
    source: string | null;
    contact_method: string | null;
    post_url: string | null;
    description: string | null;
  };
};

export type LoadingPart = {
  type: "loading";
};

export type MessagePart = TextPart | ComponentPart | LoadingPart;

// Matches complete render/{...} directives anywhere in the text.
const DIRECTIVE_RE = /render\/(\{(?:[^{}]|\{[^{}]*\})*\})/g;

// Matches the start of a render/ token that hasn't closed yet (partial stream).
const PARTIAL_RE = /render\/\{[\s\S]*$/;

export function parseMessage(text: string): MessagePart[] {
  const parts: MessagePart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(DIRECTIVE_RE)) {
    const matchStart = match.index ?? 0;

    // Text before this directive
    const before = text.slice(lastIndex, matchStart).trim();
    if (before) {
      parts.push({ type: "text", content: before });
    }

    // Parse the directive
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.type === "listing" && parsed.data) {
        parts.push({ type: "listing", data: parsed.data });
      }
    } catch {
      // Malformed but complete-looking match — show shimmer
      parts.push({ type: "loading" });
    }

    lastIndex = matchStart + match[0].length;
  }

  // Remaining text after the last complete directive
  const remaining = text.slice(lastIndex);

  // Check if remaining text contains a partial render/ token being streamed in.
  // If so, suppress it and show a shimmer instead.
  const partialMatch = remaining.match(PARTIAL_RE);
  if (partialMatch) {
    const beforePartial = remaining.slice(0, partialMatch.index).trim();
    if (beforePartial) {
      parts.push({ type: "text", content: beforePartial });
    }
    parts.push({ type: "loading" });
  } else {
    const trimmed = remaining.trim();
    if (trimmed) {
      parts.push({ type: "text", content: trimmed });
    }
  }

  return parts;
}
