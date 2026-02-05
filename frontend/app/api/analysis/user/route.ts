import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { callGemini } from "@/lib/ai/gemini-client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch stored user financial analysis
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

    // Fetch user analysis
    const { data: userAnalysis, error } = await supabase
      .from("user_financial_analysis")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      return NextResponse.json(
        { error: "Failed to fetch analysis" },
        { status: 500 }
      );
    }

    // If no analysis exists, return null to trigger generation
    if (!userAnalysis) {
      return NextResponse.json(
        {
          insights: null,
          suggestions: [],
          needsGeneration: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      insights: userAnalysis.ai_insights,
      suggestions: userAnalysis.ai_suggestions || [],
      totalStatements: userAnalysis.total_statements,
      totalTransactions: userAnalysis.total_transactions,
      periodStart: userAnalysis.analysis_period_start,
      periodEnd: userAnalysis.analysis_period_end,
      updatedAt: userAnalysis.updated_at,
      needsGeneration: false,
    });
  } catch (error) {
    console.error("Error fetching user analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}

// POST: Generate and store comprehensive user financial analysis
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

    // Fetch all user statements
    const { data: statements, error: statementsError } = await supabase
      .from("statements")
      .select("*")
      .eq("user_id", userId)
      .order("statement_period_start", { ascending: false });

    if (statementsError) {
      return NextResponse.json(
        { error: "Failed to fetch statements" },
        { status: 500 }
      );
    }

    if (!statements || statements.length === 0) {
      return NextResponse.json(
        { error: "No statements found for this user" },
        { status: 400 }
      );
    }

    // Fetch all user transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false });

    if (transactionsError) {
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 }
      );
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        { error: "No transactions found for this user" },
        { status: 400 }
      );
    }

    // Calculate analysis period
    const dates = transactions.map((t) => new Date(t.transaction_date));
    const periodStart = new Date(Math.min(...dates.map((d) => d.getTime())));
    const periodEnd = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Prepare transaction summary for AI (limit to recent 100 for performance)
    const transactionSummary = transactions.slice(0, 100).map((t) => ({
      description: t.description,
      amount: t.amount,
      category: t.category_name,
      type: t.type,
      date: t.transaction_date,
    }));

    // Generate AI insights
    const insightsPrompt = `
      Analyze these financial transactions across all bank statements and provide:
      1. A comprehensive summary of overall spending patterns and financial health (3-4 sentences)
      2. 4-5 specific cost-cutting suggestions that can be turned into actionable financial goals
      3. Identify trends in income and expenses over time
      
      Analysis Period: ${periodStart.toISOString().split("T")[0]} to ${periodEnd.toISOString().split("T")[0]}
      Total Statements: ${statements.length}
      Total Transactions: ${transactions.length}
      Recent Transactions: ${JSON.stringify(transactionSummary, null, 2)}
    `;

    const systemInstruction = `You are a financial analyst AI assistant. Analyze the provided transaction data and provide comprehensive insights.
      
      Format your response as JSON with the following structure:
      {
        "insights": "A comprehensive summary of overall spending patterns and financial health (3-4 sentences)",
        "suggestions": ["4-5 specific cost-cutting suggestions that can be turned into actionable financial goals"]
      }
      
      Focus on practical, actionable advice that can help users save money and improve their financial health.`;

    const response = await callGemini(insightsPrompt, systemInstruction);

    // Parse AI response
    let parsedResponse;
    try {
      let cleanedResponse = response?.trim() || "{}";

      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse
          .replace(/```json\n?/g, "")
          .replace(/```\n?$/g, "");
      } else if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse
          .replace(/```\n?/g, "")
          .replace(/```\n?$/g, "");
      }

      parsedResponse = JSON.parse(cleanedResponse);

      if (
        !parsedResponse.insights ||
        !Array.isArray(parsedResponse.suggestions)
      ) {
        throw new Error("Invalid response structure");
      }
    } catch (e) {
      console.error("Error parsing AI response:", e);
      parsedResponse = {
        insights: response || "Unable to generate insights",
        suggestions: [],
      };
    }

    // Upsert analysis in database
    const { data: upsertedAnalysis, error: upsertError } = await supabase
      .from("user_financial_analysis")
      .upsert(
        {
          user_id: userId,
          ai_insights: parsedResponse.insights,
          ai_suggestions: parsedResponse.suggestions,
          total_statements: statements.length,
          total_transactions: transactions.length,
          analysis_period_start: periodStart.toISOString().split("T")[0],
          analysis_period_end: periodEnd.toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error("Error storing user analysis:", upsertError);
      return NextResponse.json(
        { error: "Failed to store analysis" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      insights: parsedResponse.insights,
      suggestions: parsedResponse.suggestions,
      totalStatements: statements.length,
      totalTransactions: transactions.length,
      periodStart: periodStart.toISOString().split("T")[0],
      periodEnd: periodEnd.toISOString().split("T")[0],
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating user analysis:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
