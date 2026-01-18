import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/database/client";
import { getStatementsByUserId } from "@/lib/database/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const orderBy = searchParams.get("orderBy") || "created_at";
    const orderDirection = searchParams.get("orderDirection") || "desc";

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const { data: statements, error } = await getStatementsByUserId(userId, {
      page,
      limit,
      orderBy,
      orderDirection: orderDirection as "asc" | "desc",
    });

    if (error) {
      console.error("Error fetching statements:", error);
      return NextResponse.json(
        { error: "Failed to fetch statements" },
        { status: 500 },
      );
    }

    return NextResponse.json(statements);
  } catch (error) {
    console.error("Error in statements API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
