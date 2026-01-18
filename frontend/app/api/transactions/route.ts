import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "../../../lib/database/client";
import {
  getTransactionsByUserId,
  updateTransaction,
} from "../../../lib/database/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const orderBy = searchParams.get("orderBy") || "transaction_date";
    const orderDirection = searchParams.get("orderDirection") || "desc";

    // Filter parameters
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const categories =
      searchParams.get("categories")?.split(",").filter(Boolean) || undefined;
    const types =
      (searchParams.get("types")?.split(",").filter(Boolean) as (
        | "debit"
        | "credit"
      )[]) || undefined;
    const minAmount = searchParams.get("minAmount")
      ? parseFloat(searchParams.get("minAmount")!)
      : undefined;
    const maxAmount = searchParams.get("maxAmount")
      ? parseFloat(searchParams.get("maxAmount")!)
      : undefined;
    const search = searchParams.get("search") || undefined;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const { data: transactions, error } = await getTransactionsByUserId(
      userId,
      {
        dateFrom,
        dateTo,
        categories,
        types,
        minAmount,
        maxAmount,
        search,
      },
      {
        page,
        limit,
        orderBy,
        orderDirection: orderDirection as "asc" | "desc",
      },
    );

    if (error) {
      console.error("Error fetching transactions:", error);
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 },
      );
    }

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error in transactions API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { transactionId, updates } = await req.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 },
      );
    }

    const { data: transaction, error } = await updateTransaction(
      transactionId,
      updates,
    );

    if (error) {
      console.error("Error updating transaction:", error);
      return NextResponse.json(
        { error: "Failed to update transaction" },
        { status: 500 },
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error in transactions API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
