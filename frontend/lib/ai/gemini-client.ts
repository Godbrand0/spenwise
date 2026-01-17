import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function callGemini(prompt: string, systemInstruction?: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction,
  });

  const startTime = Date.now();
  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Track usage
  await logTokenUsage({
    inputTokens: result.response.usageMetadata?.promptTokenCount || 0,
    outputTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
    latency: Date.now() - startTime,
    timestamp: new Date(),
  });

  return response;
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
