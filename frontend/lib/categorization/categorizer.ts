import { callGemini } from "../ai/gemini-client";
import { Transaction } from "../extraction/regex-parser";

export interface Category {
  id: number;
  name: string;
  keywords: string[];
  parent_category?: string;
  is_income: boolean;
}

export async function categorizeTransactions(
  transactions: Transaction[],
  userCategories: Category[] // From database
): Promise<(Transaction & { category?: string; confidence: number })[]> {
  // First, try keyword matching (free!)
  const withQuickMatch = transactions.map((t) => {
    const match = findCategoryByKeyword(t.description, userCategories);
    return { ...t, category: match?.name, confidence: match ? 1.0 : 0 };
  });

  // AI categorization only for unmatched
  const needsAI = withQuickMatch.filter((t) => !t.category);

  if (needsAI.length === 0) {
    return withQuickMatch;
  }

  const aiCategorized = await categorizeWithAI(needsAI, userCategories);

  // Merge results
  return withQuickMatch.map((t) =>
    t.category
      ? t
      : aiCategorized.find((a) => a.description === t.description) || t
  );
}

async function categorizeWithAI(
  transactions: Transaction[],
  allowedCategories: Category[]
): Promise<(Transaction & { category?: string; confidence: number })[]> {
  const categoryList = allowedCategories.map((c) => c.name).join(", ");

  const prompt = `
Categorize these transactions using ONLY these categories:
${categoryList}

IMPORTANT: 
- Income categories: Salary, Freelance Income, Business Income, Investment Income, Other Income
- Expense categories: Groceries, Dining, Transport, Rent, Entertainment, Utilities, Healthcare, etc.

Return JSON array with format:
[{ "description": "...", "category": "Groceries", "confidence": 0.9 }]

Rules:
- If unsure, use the closest match with lower confidence (0.5-0.7)
- NEVER create new categories
- Consider the transaction description and amount
- Look for merchant names and transaction types
- For Nigerian context: consider common merchants like Shoprite, Spar, KFC, Domino's, Uber, Bolt

Transactions:
${JSON.stringify(
  transactions.map((t) => ({
    description: t.description,
    amount: t.amount,
    type: t.type,
    is_income: t.is_income,
  }))
)}
`;

  const response = await callGemini(prompt);
  const cleaned = response.replace(/```json\n?|\n?```/g, "");

  try {
    const aiResults = JSON.parse(cleaned);

    return transactions.map((t) => {
      const aiResult = aiResults.find(
        (r: any) => r.description === t.description
      );
      return {
        ...t,
        category: aiResult?.category,
        confidence: aiResult?.confidence || 0.5,
      };
    });
  } catch (error) {
    console.error("Failed to parse AI categorization:", error);
    // Return transactions with uncategorized status
    return transactions.map((t) => ({
      ...t,
      category: undefined,
      confidence: 0,
    }));
  }
}

function findCategoryByKeyword(
  description: string,
  categories: Category[]
): Category | null {
  const lowerDesc = description.toLowerCase();

  for (const cat of categories) {
    if (cat.keywords.some((kw) => lowerDesc.includes(kw))) {
      return cat;
    }
  }

  return null;
}

// Default categories for Nigerian users
export const defaultCategories: Category[] = [
  // Expense categories
  {
    id: 1,
    name: "Groceries",
    keywords: [
      "shoprite",
      "spar",
      "supermarket",
      "market",
      "food store",
      "groceries",
    ],
    is_income: false,
  },
  {
    id: 2,
    name: "Dining",
    keywords: [
      "restaurant",
      "kfc",
      "dominos",
      "pizza",
      "food",
      "eatery",
      "cafe",
    ],
    is_income: false,
  },
  {
    id: 3,
    name: "Transport",
    keywords: [
      "uber",
      "bolt",
      "taxi",
      "fuel",
      "petrol",
      "transport",
      "bus",
      "danfo",
    ],
    is_income: false,
  },
  {
    id: 4,
    name: "Rent",
    keywords: ["rent", "housing", "accommodation", "landlord"],
    is_income: false,
  },
  {
    id: 5,
    name: "Entertainment",
    keywords: ["netflix", "cinema", "movies", "show", "concert", "event"],
    is_income: false,
  },
  {
    id: 6,
    name: "Utilities",
    keywords: ["electricity", "water", "internet", "phone", "bill", "utility"],
    is_income: false,
  },
  {
    id: 7,
    name: "Healthcare",
    keywords: ["hospital", "pharmacy", "doctor", "medical", "health"],
    is_income: false,
  },
  {
    id: 8,
    name: "Shopping",
    keywords: ["mall", "clothing", "shoes", "electronics", "purchase"],
    is_income: false,
  },

  // Income categories
  {
    id: 101,
    name: "Salary",
    keywords: ["salary", "payroll", "wages", "monthly pay"],
    parent_category: "Income",
    is_income: true,
  },
  {
    id: 102,
    name: "Freelance Income",
    keywords: ["freelance", "contract", "consulting", "gig"],
    parent_category: "Income",
    is_income: true,
  },
  {
    id: 103,
    name: "Business Income",
    keywords: ["business", "sales", "revenue", "profit"],
    parent_category: "Income",
    is_income: true,
  },
  {
    id: 104,
    name: "Investment Income",
    keywords: ["dividend", "interest", "investment", "returns"],
    parent_category: "Income",
    is_income: true,
  },
  {
    id: 105,
    name: "Other Income",
    keywords: ["gift", "refund", "transfer", "bonus"],
    parent_category: "Income",
    is_income: true,
  },
];
