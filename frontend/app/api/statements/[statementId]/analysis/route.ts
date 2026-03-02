import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { callGemini, cleanJson } from "@/lib/ai/gemini-client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch stored analysis for a statement
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ statementId: string }> }
) {
  try {
    const { statementId } = await params;

    // Fetch statement with analysis
    const { data: statement, error } = await supabase
      .from("statements")
      .select("ai_insights, ai_suggestions, analysis_generated_at")
      .eq("id", statementId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Statement not found" },
        { status: 404 }
      );
    }

    // If no analysis exists, return null to trigger generation
    if (!statement.ai_insights) {
      return NextResponse.json(
        { 
          insights: null, 
          suggestions: [],
          needsGeneration: true 
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      insights: statement.ai_insights,
      suggestions: statement.ai_suggestions || [],
      generatedAt: statement.analysis_generated_at,
      needsGeneration: false,
    });
  } catch (error) {
    console.error("Error fetching statement analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}

// POST: Generate and store analysis for a statement
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ statementId: string }> }
) {
  try {
    const { statementId } = await params;

    // Fetch statement and its transactions
    const { data: statement, error: statementError } = await supabase
      .from("statements")
      .select("*")
      .eq("id", statementId)
      .single();

    if (statementError) {
      return NextResponse.json(
        { error: "Statement not found" },
        { status: 404 }
      );
    }

    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("*")
      .eq("statement_id", statementId)
      .order("transaction_date", { ascending: false });

    if (transactionsError) {
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 }
      );
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        { error: "No transactions found for this statement" },
        { status: 400 }
      );
    }

    // Prepare transaction summary for AI (cap at 100 to stay within TPM limits)
    const transactionSummary = transactions.slice(0, 100).map((t) => ({
      description: t.description,
      amount: t.amount,
      category: t.category_name,
      type: t.type,
      date: t.transaction_date,
    }));

    // Generate AI insights
    const insightsPrompt = `
      Analyze these bank statement transactions and provide:
      1. A brief summary of spending patterns for this statement period (2-3 sentences)
      2. 3-4 specific cost-cutting suggestions that can be turned into actionable goals
      
      Statement Period: ${statement.statement_period_start} to ${statement.statement_period_end}
      Bank: ${statement.bank_name}
      Transactions: ${JSON.stringify(transactionSummary, null, 2)}
    `;

    const systemInstruction = `You are a financial analyst AI assistant. Analyze the provided transaction data and provide insights.
      
      Format your response as JSON with the following structure:
      {
        "insights": "A brief summary of spending patterns (2-3 sentences)",
        "suggestions": ["3-4 specific cost-cutting suggestions that can be turned into actionable goals"]
      }
      
      Focus on practical, actionable advice that can help users save money and improve their financial health.`;

    const response = await callGemini(insightsPrompt, systemInstruction);

    // Parse AI response
    let parsedResponse;
    try {
      const cleanedResponse = cleanJson(response);
      parsedResponse = JSON.parse(cleanedResponse);
      
      if (!parsedResponse.insights || !Array.isArray(parsedResponse.suggestions)) {
        throw new Error("Invalid response structure");
      }
    } catch (e) {
      console.error("Error parsing AI response:", e);
      parsedResponse = {
        insights: response || "Unable to generate insights",
        suggestions: [],
      };
    }

    // Store analysis in database
    const { error: updateError } = await supabase
      .from("statements")
      .update({
        ai_insights: parsedResponse.insights,
        ai_suggestions: parsedResponse.suggestions,
        analysis_generated_at: new Date().toISOString(),
      })
      .eq("id", statementId);

    if (updateError) {
      console.error("Error storing analysis:", updateError);
      return NextResponse.json(
        { error: "Failed to store analysis" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      insights: parsedResponse.insights,
      suggestions: parsedResponse.suggestions,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating statement analysis:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
