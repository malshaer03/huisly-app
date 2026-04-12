import type {
  AccountsResponse,
  ActivityResponse,
  DashboardData,
  NetWorthResponse,
  SpendingResponse,
} from "@/types/dashboard/api";

export async function fetchNetWorth(): Promise<NetWorthResponse> {
  const response = await fetch("/api/dashboard?section=networth");
  if (!response.ok) {
    throw new Error("Failed to fetch net worth data");
  }
  return response.json();
}

export async function fetchAccounts(): Promise<AccountsResponse> {
  const response = await fetch("/api/dashboard?section=accounts");
  if (!response.ok) {
    throw new Error("Failed to fetch accounts");
  }
  return response.json();
}

export async function fetchSpending(): Promise<SpendingResponse> {
  const response = await fetch("/api/dashboard?section=spending");
  if (!response.ok) {
    throw new Error("Failed to fetch spending data");
  }
  return response.json();
}

export async function fetchActivity(): Promise<ActivityResponse> {
  const response = await fetch("/api/dashboard?section=activity");
  if (!response.ok) {
    throw new Error("Failed to fetch activity");
  }
  return response.json();
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const response = await fetch("/api/dashboard");
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return response.json();
}
