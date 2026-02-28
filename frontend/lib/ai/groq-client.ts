import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

const apiKey = process.env.GROQ_API_KEY;

export async function callGroq(
  prompt: string,
  systemInstruction?: string,
  modelName: string = "llama-3.3-70b-versatile",
): Promise<string> {
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in environment variables");
  }

  console.log(`🚀 Executing AI query via Groq (${modelName})...`);
  try {
    const { text } = await generateText({
      model: groq(modelName),
      system: systemInstruction,
      prompt: prompt,
    });

    return text;
  } catch (error: any) {
    const status = error.status || error.statusCode;
    // If we hit a rate limit or "request too large" error and we're using the 70B model,
    // fallback to the 8B model which usually has much higher limits
    if (modelName === "llama-3.3-70b-versatile" && (status === 413 || status === 429)) {
      console.warn("⚠️ Groq 70B limit hit. Falling back to 8B model...");
      return callGroq(prompt, systemInstruction, "llama3-8b-8192");
    }

    console.error(`Error calling Groq API (${modelName}):`, error);
    throw error;
  }
}
