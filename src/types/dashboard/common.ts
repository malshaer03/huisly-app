/* ─── Client-facing types (aligned with schema) ──────────────────── */

export interface Account {
  id: string;
  accountName: string | null;
  accountType: "bank" | "crypto_wallet" | "cex";
  provider: "truelayer" | "zerion" | "binance";
  syncStatus: "pending" | "syncing" | "success" | "error" | null;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  merchantName: string | null;
  amount: number;
  currency: string;
  transactionType: "debit" | "credit" | "transfer" | null;
  transactionDate: string;
  category: string | null;
}

export interface SpendingCategory {
  name: string;
  amount: number;
  pct: number;
  color: string;
}

export interface SpendingSummary {
  total: number;
  budget: number;
  categories: SpendingCategory[];
  daysLeft: number;
  cycleBounds: {
    start: string;
    end: string;
  };
}

export interface NetWorthDataPoint {
  date: string;
  value: number;
}

export interface NetWorthData {
  total: number;
  change: number;
  changePct: number;
  snapshots: NetWorthDataPoint[];
}
