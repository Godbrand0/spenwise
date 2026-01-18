import { createServerClient } from "./client";
import {
  User,
  Category,
  Statement,
  Transaction,
  TaxCalculation,
  FinancialTodo,
  TransactionFilters,
  PaginationParams,
  PaginatedResponse,
  DatabaseResponse,
  CreateFinancialTodoInput,
  UpdateFinancialTodoInput,
  TaxCalculationInput,
} from "./types";

// Server-side Supabase client
const supabase = createServerClient();

// User functions
export async function getUserById(
  userId: string,
): Promise<DatabaseResponse<User>> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createUser(
  user: Omit<User, "id" | "created_at" | "updated_at">,
): Promise<DatabaseResponse<User>> {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert(user)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Category functions
export async function getCategories(
  userId?: string,
): Promise<DatabaseResponse<Category[]>> {
  try {
    let query = supabase
      .from("categories")
      .select("*")
      .order("is_income", { ascending: false })
      .order("name");

    if (userId) {
      query = query.or(`user_id.eq.${userId},is_default.eq.true`);
    } else {
      query = query.eq("is_default", true);
    }

    const { data, error } = await query;

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createCategory(
  category: Omit<Category, "id" | "created_at" | "updated_at">,
): Promise<DatabaseResponse<Category>> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .insert(category)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Statement functions
export async function createStatement(
  statement: Omit<
    Statement,
    "id" | "created_at" | "updated_at" | "total_credits" | "total_debits"
  >,
): Promise<DatabaseResponse<Statement>> {
  try {
    const { data, error } = await supabase
      .from("statements")
      .insert(statement)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateStatement(
  id: string,
  updates: Partial<Statement>,
): Promise<DatabaseResponse<Statement>> {
  try {
    const { data, error } = await supabase
      .from("statements")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getStatementsByUserId(
  userId: string,
  params?: PaginationParams,
): Promise<DatabaseResponse<PaginatedResponse<Statement>>> {
  try {
    let query = supabase
      .from("statements")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    // Apply ordering
    const orderBy = params?.orderBy || "created_at";
    const orderDirection = params?.orderDirection || "desc";
    query = query.order(orderBy, { ascending: orderDirection === "asc" });

    // Apply pagination
    if (params?.page && params?.limit) {
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      return { data: null, error };
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const hasMore = count ? page * limit < count : false;

    const paginatedResponse: PaginatedResponse<Statement> = {
      data: data || [],
      count: count || 0,
      page,
      limit,
      hasMore,
    };

    return { data: paginatedResponse, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Transaction functions
export async function createTransactions(
  transactions: Omit<Transaction, "id" | "created_at" | "updated_at">[],
): Promise<DatabaseResponse<Transaction[]>> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .insert(transactions)
      .select();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getTransactionsByUserId(
  userId: string,
  filters?: TransactionFilters,
  params?: PaginationParams,
): Promise<DatabaseResponse<PaginatedResponse<Transaction>>> {
  try {
    let query = supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    // Apply filters
    if (filters) {
      if (filters.dateFrom) {
        query = query.gte("transaction_date", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("transaction_date", filters.dateTo);
      }
      if (filters.categories && filters.categories.length > 0) {
        query = query.in("category_name", filters.categories);
      }
      if (filters.types && filters.types.length > 0) {
        query = query.in("type", filters.types);
      }
      if (filters.minAmount) {
        query = query.gte("amount", filters.minAmount);
      }
      if (filters.maxAmount) {
        query = query.lte("amount", filters.maxAmount);
      }
      if (filters.search) {
        query = query.textSearch("description", filters.search);
      }
    }

    // Apply ordering
    const orderBy = params?.orderBy || "transaction_date";
    const orderDirection = params?.orderDirection || "desc";
    query = query.order(orderBy, { ascending: orderDirection === "asc" });

    // Apply pagination
    if (params?.page && params?.limit) {
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      return { data: null, error };
    }

    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const hasMore = count ? page * limit < count : false;

    const paginatedResponse: PaginatedResponse<Transaction> = {
      data: data || [],
      count: count || 0,
      page,
      limit,
      hasMore,
    };

    return { data: paginatedResponse, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateTransaction(
  id: string,
  updates: Partial<Transaction>,
): Promise<DatabaseResponse<Transaction>> {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Tax calculation functions
export async function createTaxCalculation(
  taxCalculation: Omit<
    TaxCalculation,
    "id" | "created_at" | "updated_at" | "balance_due" | "effective_rate"
  >,
): Promise<DatabaseResponse<TaxCalculation>> {
  try {
    const { data, error } = await supabase
      .from("tax_calculations")
      .insert(taxCalculation)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getTaxCalculationsByUserId(
  userId: string,
): Promise<DatabaseResponse<TaxCalculation[]>> {
  try {
    const { data, error } = await supabase
      .from("tax_calculations")
      .select("*")
      .eq("user_id", userId)
      .order("tax_year", { ascending: false })
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Financial todo functions
export async function createFinancialTodo(
  todo: Omit<
    FinancialTodo,
    "id" | "created_at" | "updated_at" | "progress_percentage"
  >,
): Promise<DatabaseResponse<FinancialTodo>> {
  try {
    const { data, error } = await supabase
      .from("financial_todos")
      .insert(todo)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getFinancialTodosByUserId(
  userId: string,
): Promise<DatabaseResponse<FinancialTodo[]>> {
  try {
    const { data, error } = await supabase
      .from("financial_todos")
      .select("*")
      .eq("user_id", userId)
      .order("priority", { ascending: false })
      .order("target_date", { ascending: true })
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateFinancialTodo(
  id: string,
  updates: Partial<FinancialTodo>,
): Promise<DatabaseResponse<FinancialTodo>> {
  try {
    const { data, error } = await supabase
      .from("financial_todos")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteFinancialTodo(
  id: string,
): Promise<DatabaseResponse<null>> {
  try {
    const { error } = await supabase
      .from("financial_todos")
      .delete()
      .eq("id", id);

    return { data: null, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Analytics functions
export async function getSpendingAnalytics(
  userId: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<DatabaseResponse<any>> {
  try {
    let query = supabase.from("transactions").select("*").eq("user_id", userId);

    if (dateFrom) {
      query = query.gte("transaction_date", dateFrom);
    }
    if (dateTo) {
      query = query.lte("transaction_date", dateTo);
    }

    const { data, error } = await query;

    if (error || !data) {
      return { data: null, error };
    }

    // Type assertion for the data
    const transactions = data as Transaction[];

    // Calculate analytics
    const totalSpending = transactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);

    const spendingByCategory = transactions
      .filter((t) => t.type === "debit" && t.category_name)
      .reduce(
        (acc, t) => {
          const category = t.category_name!;
          if (!acc[category]) {
            acc[category] = { amount: 0, count: 0 };
          }
          acc[category].amount += t.amount;
          acc[category].count += 1;
          return acc;
        },
        {} as Record<string, { amount: number; count: number }>,
      );

    const incomeByCategory = transactions
      .filter((t) => t.type === "credit" && t.category_name)
      .reduce(
        (acc, t) => {
          const category = t.category_name!;
          if (!acc[category]) {
            acc[category] = { amount: 0, count: 0 };
          }
          acc[category].amount += t.amount;
          acc[category].count += 1;
          return acc;
        },
        {} as Record<string, { amount: number; count: number }>,
      );

    const analytics = {
      totalSpending,
      totalIncome,
      netIncome: totalIncome - totalSpending,
      spendingByCategory: Object.entries(spendingByCategory).map(
        ([category, data]) => ({
          category,
          amount: data.amount,
          percentage:
            totalSpending > 0 ? (data.amount / totalSpending) * 100 : 0,
          transactionCount: data.count,
        }),
      ),
      incomeByCategory: Object.entries(incomeByCategory).map(
        ([category, data]) => ({
          category,
          amount: data.amount,
          percentage: totalIncome > 0 ? (data.amount / totalIncome) * 100 : 0,
          transactionCount: data.count,
        }),
      ),
    };

    return { data: analytics, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
