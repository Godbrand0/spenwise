import { callGemini } from "../ai/gemini-client";
import { Transaction } from "./regex-parser";

export async function extractWithAI(pdfText: string): Promise<Transaction[]> {
  const prompt = `
Extract ALL transactions from this bank statement.

Return ONLY valid JSON array with this exact schema:
[{
  "date": "2024-01-15",
  "description": "Transfer to John Doe",
  "amount": 5000.00,
  "type": "debit" | "credit",
  "is_income": false
}]

Rules:
- date: YYYY-MM-DD format
- amount: positive number only
- type: "debit" or "credit"
- is_income: true ONLY for credits that represent actual income (salary, freelance payments, business revenue)
  NOT for: refunds, transfers from own accounts, loan disbursements
- Include ALL transactions, even tiny ones
- For Nigerian bank statements, look for patterns like:
  * GTBank: "15/01/2024 Transfer 5,000.00 DR"
  * Access Bank: "15 Jan 2024 Transfer 5,000.00 Dr"
  * UBA: "2024-01-15 TRANSFER 5000.00 D"

Bank statement text:
${pdfText.slice(0, 15000)} // Limit to ~15k chars
`;

  const response = await callGemini(prompt);

  // Remove markdown code fences if present
  const cleaned = response.replace(/```json\n?|\n?```/g, "");

  try {
    const transactions = JSON.parse(cleaned);

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
