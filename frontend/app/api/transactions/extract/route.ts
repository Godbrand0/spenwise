import { NextRequest, NextResponse } from "next/server";
import { extractTransactions } from "../../../../lib/extraction/hybrid-extractor";
import {
  categorizeTransactions,
  defaultCategories,
} from "../../../../lib/categorization/categorizer";
import { createServerClient } from "../../../../lib/database/client";
import {
  createTransactions,
  getCategories,
} from "../../../../lib/database/utils";

export async function POST(req: NextRequest) {
  try {
    const { pdfText, statementId, userId } = await req.json();

    if (!pdfText) {
      return NextResponse.json(
        { error: "PDF text is required" },
        { status: 400 },
      );
    }

    if (!statementId) {
      return NextResponse.json(
        { error: "Statement ID is required" },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Get user's categories (including default categories)
    const { data: categories, error: categoriesError } =
      await getCategories(userId);

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      // Fall back to default categories if there's an error
    }

    // Extract transactions using hybrid approach
    const transactions = await extractTransactions(pdfText);

    // Categorize transactions
    const categorizedTransactions = await categorizeTransactions(
      transactions,
      categories || defaultCategories,
    );

    // Prepare transactions for database insertion
    const transactionsToInsert = categorizedTransactions.map(
      (transaction: any) => ({
        user_id: userId,
        statement_id: statementId,
        transaction_date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        is_income: transaction.is_income,
        category_name: transaction.category,
        categorization_confidence: transaction.confidence || 0,
        is_categorized_manually: false,
      }),
    );

    // Save transactions to database
    const { data: savedTransactions, error: saveError } =
      await createTransactions(transactionsToInsert);

    if (saveError) {
      console.error("Error saving transactions:", saveError);
      return NextResponse.json(
        { error: "Failed to save transactions to database" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      transactions: savedTransactions,
      totalTransactions: transactions.length,
      categorizedCount: categorizedTransactions.filter((t: any) => t.category)
        .length,
    });
  } catch (error) {
    console.error("Error extracting transactions:", error);
    return NextResponse.json(
      { error: "Failed to extract transactions" },
      { status: 500 },
    );
  }
}
