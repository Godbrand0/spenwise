import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

const apiKey = process.env.GROQ_API_KEY;

export async function callGroq(
  prompt: string,
  systemInstruction?: string,
): Promise<string> {
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in environment variables");
  }

  console.log("🚀 Executing AI query via Groq (Llama 3.3)...");
  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemInstruction,
      prompt: prompt,
    });

    return text;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw error;
  }
}
