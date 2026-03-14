import { ListingCard } from "@/components/ui/ListingCard";
import type { MessagePart } from "@/lib/parseMessage";
import { parseMessage } from "@/lib/parseMessage";

interface MessageRendererProps {
  content: string;
  onApply?: (listingId: string) => void;
}

function ListingCardShimmer() {
  return (
    <div
      className="flex-shrink-0 w-[220px] rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Image placeholder shimmer */}
      <div
        className="w-full h-[110px] animate-pulse"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
      {/* Body shimmer */}
      <div className="p-3 flex flex-col gap-2">
        <div
          className="h-4 w-16 rounded animate-pulse"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div
          className="h-3 w-full rounded animate-pulse"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />
        <div
          className="h-3 w-3/4 rounded animate-pulse"
          style={{ background: "rgba(255,255,255,0.05)" }}
        />
        <div className="flex gap-1 mt-1">
          <div
            className="h-4 w-8 rounded-full animate-pulse"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          <div
            className="h-4 w-14 rounded-full animate-pulse"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        </div>
        <div
          className="h-6 w-full rounded-lg mt-1 animate-pulse"
          style={{ background: "rgba(59,126,255,0.08)" }}
        />
      </div>
    </div>
  );
}

// Group consecutive listing/loading parts together so they can be
// rendered in a single horizontal scroll row.
type RenderGroup =
  | { type: "text"; content: string; key: number }
  | { type: "cards"; parts: Array<MessagePart & { key: number }>; key: number };

function groupParts(parts: MessagePart[]): RenderGroup[] {
  const groups: RenderGroup[] = [];
  let cardBatch: Array<MessagePart & { key: number }> = [];

  const flushCards = () => {
    if (cardBatch.length > 0) {
      groups.push({ type: "cards", parts: cardBatch, key: cardBatch[0].key });
      cardBatch = [];
    }
  };

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.type === "listing" || part.type === "loading") {
      cardBatch.push({ ...part, key: i });
    } else if (part.type === "text") {
      flushCards();
      groups.push({ type: "text", content: part.content, key: i });
    }
  }
  flushCards();

  return groups;
}

export function MessageRenderer({ content, onApply }: MessageRendererProps) {
  const parts = parseMessage(content);
  const groups = groupParts(parts);

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        if (group.type === "text") {
          return (
            <p key={group.key} className="text-sm leading-relaxed">
              {group.content}
            </p>
          );
        }

        // Horizontal scrollable row of listing/shimmer cards
        return (
          <div
            key={group.key}
            className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1"
            style={{ scrollbarWidth: "none" }}
          >
            {group.parts.map((part) => {
              if (part.type === "listing") {
                return (
                  <ListingCard
                    key={part.key}
                    data={part.data}
                    onApply={onApply}
                  />
                );
              }
              return <ListingCardShimmer key={part.key} />;
            })}
          </div>
        );
      })}
    </div>
  );
}
