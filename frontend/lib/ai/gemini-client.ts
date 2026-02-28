import { GoogleGenAI } from "@google/genai";
import { callGroq } from "./groq-client";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is not defined in environment variables");
}

const ai = new GoogleGenAI({ 
  apiKey: apiKey,
});

/**
 * Robustly parse JSON from AI response, handling markdown blocks if present.
 */
export function cleanJson(text: string): string {
  // 1. Try to find content within markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1].trim();
  }

  // 2. If no code blocks, try to find the first '{' or '[' and the last '}' or ']'
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  const lastBrace = text.lastIndexOf('}');
  const lastBracket = text.lastIndexOf(']');

  let start = -1;
  let end = -1;

  // Determine if we're looking for an object or an array
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    // Looks like an object
    start = firstBrace;
    end = lastBrace;
  } else if (firstBracket !== -1) {
    // Looks like an array
    start = firstBracket;
    end = lastBracket;
  }

  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1);
  }

  return text.trim();
}

export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  retries = 3,
  backoff = 2000,
): Promise<string> {
  const startTime = Date.now();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        systemInstruction,
      },
    });

    if (!response || !response.text) {
      throw new Error("Invalid response from Gemini API");
    }

    // Track usage
    await logTokenUsage({
      inputTokens: 0,
      outputTokens: 0,
      latency: Date.now() - startTime,
      timestamp: new Date(),
    });

    return response.text;
  } catch (error: any) {
    // Handle rate limiting (status 429)
    if (error.status === 429 && retries > 0) {
      console.warn(`⚠️ Gemini Rate Limit hit. Retrying in ${backoff}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return callGemini(prompt, systemInstruction, retries - 1, backoff * 2);
    }

    if (error.status === 429) {
      console.warn("⚠️ Gemini API Rate Limit Exceeded. Falling back to Groq...");
      try {
        const groqResult = await callGroq(prompt, systemInstruction);
        return cleanJson(groqResult);
      } catch (groqError: any) {
        console.error("❌ Both Gemini and Groq failed. Groq Error:", groqError?.message || groqError);
        throw new Error("AI services currently unavailable. Please try again later.");
      }
    }

    console.error("❌ Error calling Gemini API:", error.message || error);
    if (error.status) console.error("Status Code:", error.status);
    throw error;
  }
}

// Track daily token usage
export async function logTokenUsage(data: {
  inputTokens: number;
  outputTokens: number;
  latency: number;
  timestamp: Date;
}) {
  // Log to database or file
  // Alert if approaching free tier limits (1M tokens/day)
  const dailyUsage = await getDailyTokenCount();

  if (dailyUsage > 900000) {
    console.warn("⚠️ Approaching daily token limit!");
  }
}

async function getDailyTokenCount(): Promise<number> {
  // In a real implementation, this would query the database
  // For now, return a mock value
  return 0;
}
