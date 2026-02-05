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

    // Try to parse as JSON with robust error handling
    let parsedResponse;
    try {
      // Clean the response - sometimes AI wraps JSON in markdown code blocks
      let cleanedResponse = response?.trim() || "{}";
      
      // Remove markdown code block formatting if present
      if (cleanedResponse.startsWith("```json")) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
      } else if (cleanedResponse.startsWith("```")) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, "").replace(/```\n?$/g, "");
      }
      
      parsedResponse = JSON.parse(cleanedResponse);
      
      // Validate the response structure
      if (!parsedResponse.insights || !Array.isArray(parsedResponse.suggestions)) {
        throw new Error("Invalid response structure");
      }
    } catch (e) {
      console.error("Error parsing AI response:", e);
      console.error("Raw response:", response);
      
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
