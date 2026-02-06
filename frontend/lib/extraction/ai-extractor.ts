import { callGemini } from "../ai/gemini-client";
import { Transaction } from "./regex-parser";

export async function extractWithAI(pdfText: string): Promise<Transaction[]> {
  const systemInstruction = `You are an expert Nigerian financial forensic auditor specializing in bank statement analysis. 
Your goal is to extract transactions with high precision and identify specific patterns unique to the Nigerian economy.`;

  const prompt = `
Extract ALL transactions from this bank statement.

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

Bank statement text:
${pdfText}
`;

  const response = await callGemini(prompt, systemInstruction);

  try {
    // With JSON Mode enabled, we can parse directly
    const transactions = JSON.parse(response);

    // Validate the structure
    if (!Array.isArray(transactions)) {
      throw new Error("Response is not an array");
    }

    return transactions.map((t, index) => {
      // Ensure required fields exist
      if (!t.date || !t.description || !t.amount || !t.type) {
        throw new Error(`Transaction ${index} missing required fields`);
      }

      return {
        date: t.date,
        description: t.description,
        amount: parseFloat(t.amount),
        type: t.type as "debit" | "credit",
        is_income: Boolean(t.is_income),
      };
    });
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    console.error("Raw response:", response);
    throw new Error("Failed to extract transactions using AI");
  }
}
