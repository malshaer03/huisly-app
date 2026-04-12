import type {
  Account,
  ActivityItem,
  NetWorthData,
  SpendingSummary,
} from "./common";

/* ─── API Response Types ───────────────────────────────────────── */

export interface NetWorthResponse {
  netWorth: NetWorthData;
}

export interface AccountsResponse {
  accounts: Account[];
}

export interface SpendingResponse {
  spending: SpendingSummary;
}

export interface ActivityResponse {
  activity: ActivityItem[];
}

export interface DashboardData {
  netWorth: NetWorthData;
  accounts: Account[];
  spending: SpendingSummary;
  activity: ActivityItem[];
}
