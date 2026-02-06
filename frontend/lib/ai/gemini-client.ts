import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

export async function callGemini(
  prompt: string,
  systemInstruction?: string,
): Promise<string> {
  const startTime = Date.now();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
  } catch (error) {
    console.error("Error calling Gemini API:", error);
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
