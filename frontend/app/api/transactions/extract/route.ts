import { NextRequest, NextResponse } from "next/server";
import { extractTransactions } from "../../../../lib/extraction/hybrid-extractor";
import {
  categorizeTransactions,
  defaultCategories,
} from "../../../../lib/categorization/categorizer";

export async function POST(req: NextRequest) {
  try {
    const { pdfText } = await req.json();

    if (!pdfText) {
      return NextResponse.json(
        { error: "PDF text is required" },
        { status: 400 }
      );
    }

    // Extract transactions using hybrid approach
    const transactions = await extractTransactions(pdfText);

    // Categorize transactions
    const categorizedTransactions = await categorizeTransactions(
      transactions,
      defaultCategories
    );

    return NextResponse.json({
      transactions: categorizedTransactions,
      totalTransactions: transactions.length,
      categorizedCount: categorizedTransactions.filter((t: any) => t.category)
        .length,
    });
  } catch (error) {
    console.error("Error extracting transactions:", error);
    return NextResponse.json(
      { error: "Failed to extract transactions" },
      { status: 500 }
    );
  }
}
