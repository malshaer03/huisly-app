import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  connectedAccounts,
  netWorthSnapshots,
  transactions,
  users,
} from "@/db/schema";

/**
 * Calculate cycle bounds based on a fixed salary date (defaulting to 25th)
 */
export function getPayCycleBounds(
  _salaryDate: number = 25,
  referenceDate: Date = new Date(),
) {
  const salaryDate = 25; // Hardcoded to 25th for now as per user request
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const day = referenceDate.getDate();

  let start: Date;
  let end: Date;

  if (day < salaryDate) {
    start = new Date(year, month - 1, salaryDate);
    end = new Date(year, month, salaryDate - 1);
  } else {
    start = new Date(year, month, salaryDate);
    end = new Date(year, month + 1, salaryDate - 1);
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export async function getNetWorthData(userId: string) {
  const snapshots = await db
    .select()
    .from(netWorthSnapshots)
    .where(eq(netWorthSnapshots.userId, userId))
    .orderBy(desc(netWorthSnapshots.snapshotAt))
    .limit(30); // Last 30 snapshots for sparkline

  if (snapshots.length === 0) {
    return {
      total: 0,
      change: 0,
      changePct: 0,
      snapshots: [],
    };
  }

  const latest = snapshots[0];
  const previous = snapshots[1] || latest;

  const total = Number(latest.totalEur);
  const prevTotal = Number(previous.totalEur);
  const change = total - prevTotal;
  const changePct = prevTotal !== 0 ? (change / prevTotal) * 100 : 0;

  return {
    total,
    change,
    changePct,
    snapshots: snapshots.reverse().map((s) => ({
      date: s.snapshotAt.toISOString().split("T")[0],
      value: Number(s.totalEur),
    })),
  };
}

export async function getAccountsData(userId: string) {
  return await db
    .select()
    .from(connectedAccounts)
    .where(eq(connectedAccounts.userId, userId))
    .orderBy(desc(connectedAccounts.updatedAt));
}

export async function getSpendingSummary(userId: string, salaryDate: number) {
  const { start, end } = getPayCycleBounds(salaryDate);

  const startIso = start.toISOString().split("T")[0];
  const endIso = end.toISOString().split("T")[0];

  // Total spending for the cycle
  const [spendingResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.transactionType, "debit"),
        gte(transactions.transactionDate, startIso),
        lte(transactions.transactionDate, endIso),
      ),
    );

  // Category breakdown
  const categoryResults = await db
    .select({
      category: transactions.category,
      amount: sql<number>`SUM(${transactions.amount})`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.transactionType, "debit"),
        gte(transactions.transactionDate, startIso),
        lte(transactions.transactionDate, endIso),
      ),
    )
    .groupBy(transactions.category);

  const totalSpent = Number(spendingResult.total);

  // Hardcoded colors for now to match UI design
  const categoryColors: Record<string, string> = {
    food: "#f06a6a",
    transport: "#f5c542",
    groceries: "#7c6dfa",
    subscription: "#4fd1a5",
    utilities: "#4d6bfe",
    shopping: "#f5841f",
  };

  const categories = categoryResults.map((c) => ({
    name: c.category || "Uncategorized",
    amount: Number(c.amount),
    pct: totalSpent > 0 ? (Number(c.amount) / totalSpent) * 100 : 0,
    color: categoryColors[c.category?.toLowerCase() || ""] || "#94a3b8",
  }));

  const daysLeft = Math.ceil(
    (end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    total: totalSpent,
    budget: 2000, // Hardcoded budget for MVP
    categories: categories.sort((a, b) => b.amount - a.amount),
    daysLeft: Math.max(0, daysLeft),
    cycleBounds: {
      start: start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      end: end.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    },
  };
}

export async function getRecentActivity(userId: string, limit = 5) {
  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
    .limit(limit);
}
