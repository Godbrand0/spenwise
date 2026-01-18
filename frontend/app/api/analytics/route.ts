import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/database/client";
import { getSpendingAnalytics } from "@/lib/database/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const { data: analytics, error } = await getSpendingAnalytics(
      userId,
      dateFrom,
      dateTo,
    );

    if (error) {
      console.error("Error fetching analytics:", error);
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 },
      );
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error in analytics API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
