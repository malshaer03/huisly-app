import {
  Building2,
  Car,
  CreditCard,
  type LucideIcon,
  ShoppingCart,
  Smartphone,
  UtensilsCrossed,
} from "lucide-react";
import type { CategoryRowProps } from "@/types/dashboard/ui";

const ICON_MAP: Record<string, LucideIcon> = {
  Food: UtensilsCrossed,
  Transport: Car,
  Groceries: ShoppingCart,
  Subscription: Smartphone,
  Utilities: Building2,
  Shopping: ShoppingCart,
};

export function CategoryRow({ category }: CategoryRowProps) {
  const Icon = ICON_MAP[category.name] || CreditCard;

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1.5">
          <p className="text-[14px] font-medium text-foreground">
            {category.name}
          </p>
          <p
            className="font-display font-semibold text-[14px]"
            style={{ color: category.color }}
          >
            €{category.amount.toFixed(0)}
          </p>
        </div>
        <div className="h-[4px] rounded-full bg-surface2 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${category.pct}%`,
              background: category.color,
            }}
          />
        </div>
      </div>
    </div>
  );
}
