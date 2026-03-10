import { ListingCard } from "@/components/ui/ListingCard";

export interface Listing {
  id: string;
  price: string;
  title: string;
  meta: string;
  source: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  listings?: Listing[];
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* AI avatar */}
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-sm font-bold text-white">H</span>
        </div>
      )}

      <div className="flex flex-col gap-3 max-w-[580px]">
        {/* Text bubble */}
        <div
          className={`px-4 py-3.5 text-[15px] leading-relaxed ${
            isUser
              ? "bg-[var(--bg-bubble-user)] text-white rounded-2xl rounded-tr-sm"
              : "bg-[var(--bg-bubble-ai)] text-[var(--text-secondary)] rounded-2xl rounded-tl-sm"
          }`}
        >
          {message.content}
        </div>

        {/* Listing cards */}
        {message.listings && message.listings.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {message.listings.map((listing) => (
              <ListingCard
                key={listing.id}
                price={listing.price}
                title={listing.title}
                meta={listing.meta}
                source={listing.source}
                onApply={() => console.log("Apply to", listing.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
