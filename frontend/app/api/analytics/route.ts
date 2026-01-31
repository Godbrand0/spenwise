import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/ai/gemini-client";

export async function POST(req: NextRequest) {
  try {
    const { prompt, type } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    let systemInstruction = "";
    let responseFormat = {};

    if (type === "analysis") {
      systemInstruction = `You are a financial analyst AI assistant. Analyze the provided transaction data and provide insights.
      
      Format your response as JSON with the following structure:
      {
        "insights": "A brief summary of spending patterns (2-3 sentences)",
        "suggestions": ["3-4 specific cost-cutting suggestions that can be turned into actionable goals"]
      }
      
      Focus on practical, actionable advice that can help users save money and improve their financial health.`;

      responseFormat = {
        insights: "string",
        suggestions: ["string"],
      };
    }

    const response = await callGemini(prompt, systemInstruction);

    // Try to parse as JSON, if fails return as plain text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response || "{}");
    } catch (e) {
      // If not JSON, create a structured response
      parsedResponse = {
        insights: response || "Unable to generate insights",
        suggestions: [],
      };
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("Error in analytics API:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics" },
      { status: 500 },
    );
  }
}
