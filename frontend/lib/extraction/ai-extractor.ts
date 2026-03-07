import { callGemini, cleanJson } from "../ai/gemini-client";
import { Transaction } from "./regex-parser";

/**
 * Splits text into chunks by line to avoid breaking transactions.
 */
function chunkText(text: string, maxChars: number): string[] {
  const lines = text.split("\n");
  const chunks: string[] = [];
  let currentChunk = "";

  for (const line of lines) {
    if ((currentChunk + line).length > maxChars) {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = line + "\n";
    } else {
      currentChunk += line + "\n";
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

function parseChunk(response: string, index: number): Transaction[] {
  const cleanedResponse = cleanJson(response);
  const transactions = JSON.parse(cleanedResponse);

  if (!Array.isArray(transactions)) {
    console.error("Response is not an array for chunk", index);
    return [];
  }

  return transactions
    .map((t: any, i: number) => {
      if (!t.date || !t.description || !t.amount || !t.type) {
        console.warn(`Chunk ${index}, Transaction ${i} missing fields. Skipping.`);
        return null;
      }
      return {
        date: t.date,
        description: t.description,
        amount: parseFloat(t.amount),
        type: t.type as "debit" | "credit",
        is_income: Boolean(t.is_income),
      };
    })
    .filter(Boolean) as Transaction[];
}

async function processChunk(
  chunk: string,
  index: number,
  total: number,
  systemInstruction: string,
): Promise<Transaction[]> {
  const prompt = `
Extract ALL transactions from this bank statement fragment (Part ${index + 1}/${total}).

Return ONLY a valid JSON array of objects.

Rules:
- date: YYYY-MM-DD format
- amount: positive number only
- type: "debit" or "credit"
- is_income: true ONLY for credits that represent actual income (salary, freelance, business revenue).
- Nigerian POS Heuristic:
  * Transfers of 1,100, 1,200, 2,100, 2,200, 3,100, 3,200, 4,100, 4,200, 5,100, 5,200, 10,100, 10,200 Naira (specifically amounts where 100 or 200 is "attached" as a fee) are often POS agent transfers.
  * Label these in the description as "POS Transfer - [Original Description]".
- Transaction Frequency: Pay close attention to recurring names or accounts. If a name appears multiple times, ensure the description is consistent.

Bank statement fragment:
${chunk}
`;

  const response = await callGemini(prompt, systemInstruction);

  try {
    return parseChunk(response, index);
  } catch (error) {
    console.error(`Failed to parse AI response for chunk ${index}:`, error);
    return [];
  }
}

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = [];
  let i = 0;

  while (i < tasks.length) {
    const batch = tasks.slice(i, i + limit);
    const batchResults = await Promise.all(batch.map((fn) => fn()));
    results.push(...batchResults);
    i += limit;
  }

  return results;
}

export async function extractWithAI(pdfText: string): Promise<Transaction[]> {
  const systemInstruction = `You are an expert Nigerian financial forensic auditor specializing in bank statement analysis.
Your goal is to extract transactions with high precision and identify specific patterns unique to the Nigerian economy.`;

  // Larger chunks = fewer AI calls. 24k chars ≈ 6k tokens, well within Gemini's limits.
  const maxChunkChars = 24000;
  const textChunks = chunkText(pdfText, maxChunkChars);

  if (textChunks.length > 1) {
    console.log(`📦 Large statement detected. Processing ${textChunks.length} chunks in parallel...`);
  }

  const tasks = textChunks.map(
    (chunk, index) => () =>
      processChunk(chunk, index, textChunks.length, systemInstruction),
  );

  // Process up to 5 chunks at a time to stay within rate limits
  const results = await runWithConcurrency(tasks, 5);

  const allTransactions = results.flat();

  if (textChunks.length === 1 && allTransactions.length === 0) {
    throw new Error("Failed to extract transactions using AI");
  }

  return allTransactions;
}
