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
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col gap-3 max-w-[85%] md:max-w-[580px]">
        {/* Text bubble */}
        <div
          className={`text-[15px] leading-relaxed ${
            isUser
              ? "bg-[var(--bg-bubble-user)] text-white rounded-2xl rounded-tr-sm px-4 py-3"
              : "text-[var(--text-secondary)] py-1"
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
