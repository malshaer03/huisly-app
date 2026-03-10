interface ListingCardProps {
  price: string;
  title: string;
  meta: string;
  source: string;
  onApply: () => void;
}

export function ListingCard({
  price,
  title,
  meta,
  source,
  onApply,
}: ListingCardProps) {
  return (
    <div className="w-[268px] rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden flex-shrink-0">
      {/* Image placeholder */}
      <div className="w-full h-[120px] bg-[var(--bg-elevated)] relative">
        <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white bg-[#1a3a5c] px-2 py-1 rounded">
          {source}
        </span>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-1.5">
        <p className="text-base font-bold text-white">{price}</p>
        <p className="text-[13px] font-medium text-[var(--text-secondary)]">
          {title}
        </p>
        <p className="text-[11px] text-[var(--text-muted)]">{meta}</p>
        <button
          type="button"
          onClick={onApply}
          className="w-full h-8 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors text-[13px] font-semibold text-white text-center mt-1"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
