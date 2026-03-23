"use client";

import type { ComponentPart } from "@/lib/parseMessage";

interface ListingCardProps {
  data: ComponentPart["data"];
  onApply?: (id: string) => void;
}

const gradients = [
  "linear-gradient(135deg, #1a2a4a 0%, #0d1f35 40%, #162035 100%)",
  "linear-gradient(135deg, #1f2d1a 0%, #0d1f14 40%, #152018 100%)",
  "linear-gradient(135deg, #2a1a1a 0%, #1f0d0d 40%, #201515 100%)",
  "linear-gradient(135deg, #1a1a2a 0%, #0d0d1f 40%, #151520 100%)",
];

// Stable gradient derived from listing id to avoid mutable module state
function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return gradients[Math.abs(hash) % gradients.length];
}

function sourceLabel(source: string | null): string {
  if (!source) return "Unknown";
  if (source === "pararius") return "Pararius";
  if (source === "funda") return "Funda";
  if (source === "kamernet") return "Kamernet";
  if (source === "facebook") return "Facebook";
  if (source === "alless") return "Alless";
  return source;
}

export function ListingCard({ data, onApply }: ListingCardProps) {
  const {
    id,
    price,
    city,
    size_m2,
    furnished,
    available_from,
    room_type,
    source,
    contact_method,
    post_url,
    description,
  } = data;

  const gradient = getGradient(id);
  const isFacebook = source === "facebook" || contact_method === "facebook_dm";
  const isAlless = source === "alless";

  const formattedDate = available_from
    ? new Date(available_from).toLocaleDateString("en-NL", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      className="flex-shrink-0 w-[220px] rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      }}
    >
      {/* Image placeholder */}
      <div
        className="relative w-full h-[110px] overflow-hidden"
        style={{ background: gradient }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)",
          }}
        />

        {/* Building silhouette */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 px-4 h-[75px]">
          {[
            { w: 18, h: 55 },
            { w: 28, h: 70 },
            { w: 22, h: 48 },
            { w: 16, h: 38 },
          ].map((b, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static building shapes
              key={i}
              className="flex-shrink-0 rounded-t-sm"
              style={{
                width: b.w,
                height: b.h,
                background: "rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>

        {/* Window lights */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-1.5">
          {[true, false, true, true, false].map((on, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static window shapes
              key={i}
              className="w-1 h-1 rounded-sm"
              style={{
                background: on
                  ? "rgba(255,220,100,0.5)"
                  : "rgba(255,255,255,0.08)",
              }}
            />
          ))}
        </div>

        {/* Source badge */}
        <div
          className="absolute top-2 left-2 z-10 text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
          style={{
            background: isAlless
              ? "rgba(249,115,22,0.25)"
              : "rgba(255,255,255,0.1)",
            color: isAlless ? "#fb923c" : "rgba(255,255,255,0.6)",
            border: isAlless
              ? "1px solid rgba(249,115,22,0.35)"
              : "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {sourceLabel(source)}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-2">
        {/* Price + city */}
        <div className="flex items-baseline justify-between gap-1">
          <div>
            <span
              className="text-[15px] font-bold tracking-tight"
              style={{ color: "#fff" }}
            >
              €{price.toLocaleString()}
            </span>
            <span
              className="text-[11px] ml-1"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              /mo
            </span>
          </div>
          <span
            className="text-[11px] truncate max-w-[80px]"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {city}
          </span>
        </div>

        {/* Room type */}
        {room_type && (
          <p
            className="text-[11.5px] capitalize"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            {room_type}
          </p>
        )}

        {/* Description */}
        {description && (
          <p
            className="text-[11px] leading-snug line-clamp-2"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {size_m2 != null && (
            <span
              className="text-[9.5px] px-1.5 py-0.5 rounded-full"
              style={{
                color: "rgba(255,255,255,0.5)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {size_m2}m²
            </span>
          )}
          {furnished != null && (
            <span
              className="text-[9.5px] px-1.5 py-0.5 rounded-full"
              style={{
                color: "rgba(255,255,255,0.5)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {furnished ? "Furnished" : "Unfurnished"}
            </span>
          )}
          {formattedDate && (
            <span
              className="text-[9.5px] px-1.5 py-0.5 rounded-full"
              style={{
                color: "rgba(255,255,255,0.5)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              From {formattedDate}
            </span>
          )}
        </div>

        {/* CTA — source-aware */}
        {isFacebook ? (
          <a
            href={post_url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-1.5 rounded-lg text-[11px] font-semibold text-center transition-colors duration-150 block"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            View on Facebook →
          </a>
        ) : (
          <button
            type="button"
            onClick={() => onApply?.(id)}
            className="w-full py-1.5 rounded-lg text-[11px] font-semibold transition-colors duration-150"
            style={{
              background: isAlless
                ? "rgba(249,115,22,0.15)"
                : "rgba(59,126,255,0.15)",
              border: isAlless
                ? "1px solid rgba(249,115,22,0.25)"
                : "1px solid rgba(59,126,255,0.25)",
              color: isAlless ? "#fb923c" : "#6fa3ff",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isAlless
                ? "rgba(249,115,22,0.25)"
                : "rgba(59,126,255,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isAlless
                ? "rgba(249,115,22,0.15)"
                : "rgba(59,126,255,0.15)";
            }}
          >
            {isAlless ? "Send Application →" : "Draft Application →"}
          </button>
        )}
      </div>
    </div>
  );
}
