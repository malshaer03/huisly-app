import type {
  Account,
  ActivityItem,
  NetWorthData,
  NetWorthDataPoint,
  SpendingCategory,
  SpendingSummary,
} from "./common";

/* ─── Component Props ──────────────────────────────────────────── */

export interface PortfolioHeroProps {
  netWorth: NetWorthData;
  hideBalance: boolean;
  isLoading: boolean;
  onToggleBalance: () => void;
}

export interface ActionPillsProps {
  onAddMoney: () => void;
  onTransfer: () => void;
  onAskMiru: () => void;
}

export interface AccountsHeaderProps {
  onFilter: () => void;
  onAddAccount: () => void;
}

export interface AccountsSectionProps {
  accounts: Account[];
  isLoading: boolean;
  hideBalance: boolean;
}

export interface AccountRowProps {
  account: Account;
  hideBalance: boolean;
  isLoading?: boolean;
}

export interface PayCycleSectionProps {
  spending: SpendingSummary;
  hideBalance: boolean;
  isLoading: boolean;
  onCalendar: () => void;
}

export interface CategoryRowProps {
  category: SpendingCategory;
}

export interface RecentActivityProps {
  activity: ActivityItem[];
  isLoading: boolean;
  hideBalance: boolean;
  onViewAll: () => void;
}

export interface TransactionRowProps {
  transaction: ActivityItem;
  isLast: boolean;
}

export interface SparklineProps {
  data?: NetWorthDataPoint[];
}

export interface ChatSheetProps {
  onClose: () => void;
}

export interface DashboardHeaderProps {
  onNotifications: () => void;
  onSettings: () => void;
}
