import { NextRequest, NextResponse } from "next/server";
import {
  getTransactionsByUserId,
  getMonthlyAnalysisByUserId,
  upsertMonthlyAnalysis,
} from "@/lib/database/utils";
import { callGemini, cleanJson } from "@/lib/ai/gemini-client";
import { Transaction, MonthlyFinancialAnalysis } from "@/lib/database/types";

// GET - Fetch stored monthly analyses for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const year = searchParams.get("year")
      ? parseInt(searchParams.get("year")!, 10)
      : undefined;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const { data, error } = await getMonthlyAnalysisByUserId(userId, year);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in GET /api/analysis/monthly:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Generate AI remark for a specific month
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, month, year } = body;

    if (!userId || !month || !year) {
      return NextResponse.json(
        { error: "userId, month, and year are required" },
        { status: 400 },
      );
    }

    // Validate month and year
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Month must be between 1 and 12" },
        { status: 400 },
      );
    }

    // Calculate date range for the month
    const dateFrom = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const dateTo = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    // Fetch transactions for the specified month and year
    const { data: transactionsData, error: transactionsError } =
      await getTransactionsByUserId(userId, { dateFrom, dateTo }, { limit: 10000 });

    if (transactionsError) {
      return NextResponse.json(
        { error: transactionsError.message },
        { status: 500 },
      );
    }

    const transactions = transactionsData?.data || [];

    // Calculate totals
    const totalIncome = transactions
      .filter((t: Transaction) => t.type === "credit" || t.is_income)
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t: Transaction) => t.type === "debit" || !t.is_income)
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpenses;
    const transactionCount = transactions.length;

    // Get top spending categories
    const spendingByCategory = transactions
      .filter((t: Transaction) => t.type === "debit" && t.category_name)
      .reduce((acc: Record<string, number>, t: Transaction) => {
        const category = t.category_name!;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += t.amount;
        return acc;
      }, {});

    const topSpendingCategories = Object.entries(spendingByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    // Get recent transactions (capped at 50)
    const recentTransactions = transactions
      .slice(0, 50)
      .map((t: Transaction) => ({
        date: t.transaction_date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category_name,
      }));

    // Get month name
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthName = monthNames[month - 1];

    // Build the prompt for Gemini
    const prompt = `Analyze transactions for ${monthName} ${year}.

Month Summary:
- Total Income: ₦${totalIncome.toLocaleString()}
- Total Expenses: ₦${totalExpenses.toLocaleString()}
- Net Savings: ₦${netSavings.toLocaleString()} (positive = profit, negative = loss)
- Transaction Count: ${transactionCount}

Top spending categories: ${JSON.stringify(topSpendingCategories)}
Recent transactions: ${JSON.stringify(recentTransactions)}

Respond with JSON:
{
  "remark": "2-3 sentence insight about this month's financial patterns and highlights",
  "advice": "1-2 sentences on how to build on the positives or address the negatives",
  "suggestions": ["3 short actionable bullet points for next month"]
}`;

    const systemInstruction =
      "You are a financial advisor specializing in Nigerian personal finance. Provide insights in the context of Nigerian economy, using Naira (₦) as currency. Be practical, culturally aware, and focus on actionable advice for Nigerians.";

    // Call Gemini API
    const aiResponse = await callGemini(prompt, systemInstruction);
    let aiAnalysis;

    try {
      const cleanedResponse = cleanJson(aiResponse);
      aiAnalysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    // Create monthly analysis record
    const monthlyAnalysis: Omit<
      MonthlyFinancialAnalysis,
      "id" | "created_at" | "updated_at"
    > = {
      user_id: userId,
      analysis_month: month,
      analysis_year: year,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_savings: netSavings,
      transaction_count: transactionCount,
      ai_remark: aiAnalysis.remark,
      ai_advice: aiAnalysis.advice,
      ai_suggestions: aiAnalysis.suggestions || [],
      generated_at: new Date().toISOString(),
    };

    // Upsert the analysis
    const { data: savedAnalysis, error: saveError } =
      await upsertMonthlyAnalysis(monthlyAnalysis);

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({ data: savedAnalysis });
  } catch (error) {
    console.error("Error in POST /api/analysis/monthly:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
