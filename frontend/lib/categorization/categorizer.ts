import { callGemini } from "@/lib/ai/gemini-client";
import { Transaction } from "@/lib/extraction/regex-parser";
import { Category as DatabaseCategory } from "@/lib/database/types";

export interface Category {
  id: number;
  name: string;
  keywords: string[];
  parent_category?: string;
  is_income: boolean;
}

// Helper function to convert database category to categorizer category
export function convertToCategorizerCategory(
  dbCategory: DatabaseCategory,
): Category {
  return {
    id: parseInt(dbCategory.id), // Convert UUID string to number for compatibility
    name: dbCategory.name,
    keywords: dbCategory.keywords,
    parent_category: dbCategory.parent_category,
    is_income: dbCategory.is_income,
  };
}

export async function categorizeTransactions(
  transactions: Transaction[],
  userCategories: DatabaseCategory[] | Category[], // From database
): Promise<(Transaction & { category?: string; confidence: number })[]> {
  // Convert database categories to categorizer format if needed
  const categories =
    userCategories.length > 0 &&
    "id" in userCategories[0] &&
    typeof userCategories[0].id === "string"
      ? (userCategories as DatabaseCategory[]).map(convertToCategorizerCategory)
      : (userCategories as Category[]);
  // First, try keyword matching (free!)
  const withQuickMatch = transactions.map((t) => {
    const match = findCategoryByKeyword(t.description, categories);
    return { ...t, category: match?.name, confidence: match ? 1.0 : 0 };
  });

  // AI categorization only for unmatched
  const needsAI = withQuickMatch.filter((t) => !t.category);

  if (needsAI.length === 0) {
    return withQuickMatch;
  }

  const aiCategorized = await categorizeWithAI(needsAI, categories);

  // Merge results
  return withQuickMatch.map((t) =>
    t.category
      ? t
      : aiCategorized.find((a) => a.description === t.description) || t,
  );
}

async function categorizeWithAI(
  transactions: Transaction[],
  allowedCategories: Category[],
): Promise<(Transaction & { category?: string; confidence: number })[]> {
  const categoryList = allowedCategories.map((c) => c.name).join(", ");

  const prompt = `
Categorize these transactions using ONLY these categories:
${categoryList}

IMPORTANT: 
- Income categories: Salary, Freelance Income, Business Income, Investment Income, Other Income
- Expense categories: Groceries, Dining, Transport, Rent, Entertainment, Utilities, Healthcare, etc.
- Nigerian POS Rule: Transfers of 1,000-5,000 Naira ending in 100/200, or 5,000-10,000 ending in 200, are usually POS Agent cash withdrawals. Categorize these as "Transport" or "Other Expense" unless specified otherwise.
- Look for recurring names/descriptions to ensure consistent categorization.

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
  })),
)}
`;

  let response: string;
  
  try {
    response = await callGemini(prompt);
  } catch (error) {
    console.error("AI categorization failed:", error);
    return transactions.map((t) => ({
      ...t,
      category: undefined,
      confidence: 0,
    }));
  }
  
  try {
    const aiResults = JSON.parse(response);

    return transactions.map((t) => {
      const aiResult = aiResults.find(
        (r: any) => r.description === t.description,
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
  categories: Category[],
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
