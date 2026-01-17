import { extractWithRegex } from "./regex-parser";
import { extractWithAI } from "./ai-extractor";
import { Transaction } from "./regex-parser";

export async function extractTransactions(
  pdfText: string
): Promise<Transaction[]> {
  // Try regex first (free!)
  const regexResult = extractWithRegex(pdfText);

  if (regexResult.confidence > 0.8) {
    console.log("✅ Regex extraction successful");
    return regexResult.transactions;
  }

  // Fallback to AI
  console.log("🤖 Using AI extraction");
  const aiResult = await extractWithAI(pdfText);

  // Validate extracted data
  return validateTransactions(aiResult);
}

function validateTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => {
    // Basic validation
    if (!t.date || !t.description || !t.amount || !t.type) {
      console.warn("Invalid transaction:", t);
      return false;
    }

    // Check date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t.date)) {
      console.warn("Invalid date format:", t.date);
      return false;
    }

    // Check amount is positive
    if (t.amount <= 0) {
      console.warn("Invalid amount:", t.amount);
      return false;
    }

    // Check type is valid
    if (!["debit", "credit"].includes(t.type)) {
      console.warn("Invalid type:", t.type);
      return false;
    }

    return true;
  });
}
