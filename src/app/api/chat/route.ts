import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { netWorthSnapshots, subscriptions, transactions } from "@/db/schema";

const SYSTEM_PROMPT = `You are Miru, a personal finance AI assistant.
You have access to the user's financial data: bank accounts, crypto wallets, CEX holdings, transactions, and subscriptions.
Answer questions about their money clearly and concisely. Use plain text only (no markdown).

When you need data, call the appropriate tool. Never invent numbers — only report what the tools return.
If data is unavailable, say so honestly and suggest connecting an account.`;

export async function POST(req: Request) {
  const { messages, userId } = await req.json();

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "AI_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const openai = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });

  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openai.chat("qwen/qwen3.6-plus"),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    stopWhen: stepCountIs(5),
    tools: {
      get_transactions: tool({
        description:
          "Query the user's transactions. Use when the user asks about spending, income, or specific merchants.",
        inputSchema: z.object({
          category: z
            .string()
            .optional()
            .describe(
              "Filter by category e.g. food, transport, salary, subscription",
            ),
          merchant_name: z
            .string()
            .optional()
            .describe("Filter by merchant name (partial match)"),
          date_from: z
            .string()
            .optional()
            .describe("Start date ISO format YYYY-MM-DD"),
          date_to: z
            .string()
            .optional()
            .describe("End date ISO format YYYY-MM-DD"),
          transaction_type: z
            .enum(["debit", "credit", "transfer"])
            .optional()
            .describe("Filter by transaction type"),
        }),
        execute: async ({
          category,
          merchant_name,
          date_from,
          date_to,
          transaction_type,
        }) => {
          if (!userId) return { error: "Not authenticated" };

          try {
            const filters = [eq(transactions.userId, userId)];
            if (category) filters.push(eq(transactions.category, category));
            if (date_from)
              filters.push(gte(transactions.transactionDate, date_from));
            if (date_to)
              filters.push(lte(transactions.transactionDate, date_to));
            if (transaction_type)
              filters.push(eq(transactions.transactionType, transaction_type));

            let rows = await db
              .select()
              .from(transactions)
              .where(and(...filters))
              .orderBy(desc(transactions.transactionDate))
              .limit(50);

            if (merchant_name) {
              const lower = merchant_name.toLowerCase();
              rows = rows.filter((r) =>
                r.merchantName?.toLowerCase().includes(lower),
              );
            }

            const total = rows.reduce((sum, r) => sum + Number(r.amount), 0);
            return {
              count: rows.length,
              total_eur: total.toFixed(2),
              transactions: rows.map((r) => ({
                date: r.transactionDate,
                merchant: r.merchantName,
                amount: r.amount,
                currency: r.currency,
                category: r.category,
                type: r.transactionType,
              })),
            };
          } catch {
            return { error: "Failed to query transactions" };
          }
        },
      }),

      get_net_worth: tool({
        description:
          "Get the user's current net worth — total EUR across all connected accounts (banks, crypto, CEX). Use when asked about net worth, total balance, or overall financial picture.",
        inputSchema: z.object({}),
        execute: async () => {
          if (!userId) return { error: "Not authenticated" };

          try {
            const [snapshot] = await db
              .select()
              .from(netWorthSnapshots)
              .where(eq(netWorthSnapshots.userId, userId))
              .orderBy(desc(netWorthSnapshots.snapshotAt))
              .limit(1);

            if (!snapshot) {
              return {
                error:
                  "No net worth data yet. Connect a bank account, wallet, or CEX to get started.",
              };
            }

            return {
              total_eur: snapshot.totalEur,
              breakdown: snapshot.breakdownJson,
              as_of: snapshot.snapshotAt,
            };
          } catch {
            return { error: "Failed to fetch net worth" };
          }
        },
      }),

      get_budget_status: tool({
        description:
          "Get the user's budget status for the current pay cycle. Use when asked about budget, spending this month/cycle, or how much is left.",
        inputSchema: z.object({}),
        execute: async () => {
          if (!userId) return { error: "Not authenticated" };

          try {
            // Calculate current pay cycle bounds (uses today's date)
            const today = new Date();
            const cycleStart = new Date(today);
            const cycleEnd = new Date(today);
            cycleStart.setDate(1);
            cycleEnd.setMonth(cycleEnd.getMonth() + 1, 0);

            const rows = await db
              .select()
              .from(transactions)
              .where(
                and(
                  eq(transactions.userId, userId),
                  eq(transactions.transactionType, "debit"),
                  gte(
                    transactions.transactionDate,
                    cycleStart.toISOString().split("T")[0],
                  ),
                  lte(
                    transactions.transactionDate,
                    today.toISOString().split("T")[0],
                  ),
                ),
              );

            const spent = rows.reduce((sum, r) => sum + Number(r.amount), 0);

            return {
              cycle_start: cycleStart.toISOString().split("T")[0],
              cycle_end: cycleEnd.toISOString().split("T")[0],
              spent_so_far: spent.toFixed(2),
              transaction_count: rows.length,
            };
          } catch {
            return { error: "Failed to calculate budget status" };
          }
        },
      }),

      get_subscriptions: tool({
        description:
          "Get the user's active recurring subscriptions. Use when asked about subscriptions, recurring payments, or monthly costs.",
        inputSchema: z.object({}),
        execute: async () => {
          if (!userId) return { error: "Not authenticated" };

          try {
            const rows = await db
              .select()
              .from(subscriptions)
              .where(
                and(
                  eq(subscriptions.userId, userId),
                  eq(subscriptions.status, "active"),
                ),
              )
              .orderBy(desc(subscriptions.amount));

            const monthlyTotal = rows
              .filter((r) => r.frequency === "monthly")
              .reduce((sum, r) => sum + Number(r.amount), 0);

            return {
              count: rows.length,
              monthly_total: monthlyTotal.toFixed(2),
              annual_total: (monthlyTotal * 12).toFixed(2),
              subscriptions: rows.map((r) => ({
                merchant: r.merchantName,
                amount: r.amount,
                currency: r.currency,
                frequency: r.frequency,
                next_charge: r.nextExpectedDate,
              })),
            };
          } catch {
            return { error: "Failed to fetch subscriptions" };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
