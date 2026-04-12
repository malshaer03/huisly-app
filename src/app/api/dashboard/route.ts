import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSupabase } from "@/lib/db";
import {
  getAccountsData,
  getNetWorthData,
  getRecentActivity,
  getSpendingSummary,
} from "@/lib/financial-data";

export async function GET() {
  const supabase = getSupabase();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Fetch user's salary date from DB
    const [userRecord] = await db
      .select({ salaryDate: users.salaryDate })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const salaryDate = userRecord?.salaryDate || 1;

    // 3. Fetch all dashboard data in parallel
    const [netWorth, accounts, spending, activity] = await Promise.all([
      getNetWorthData(user.id),
      getAccountsData(user.id),
      getSpendingSummary(user.id, salaryDate),
      getRecentActivity(user.id),
    ]);

    // 4. Return consolidated response
    return NextResponse.json({
      netWorth,
      accounts,
      spending,
      activity,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
