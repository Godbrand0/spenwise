// Database types based on our Supabase schema

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  keywords: string[];
  parent_category?: string;
  is_income: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Statement {
  id: string;
  user_id: string;
  filename: string;
  file_size: number;
  num_pages: number;
  raw_text?: string;
  extraction_method: string;
  bank_name?: string;
  statement_period_start?: string;
  statement_period_end?: string;
  account_number?: string;
  account_name?: string;
  opening_balance?: number;
  closing_balance?: number;
  total_credits: number;
  total_debits: number;
  processing_status: "pending" | "processing" | "completed" | "failed";
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  statement_id: string;
  category_id?: string;
  transaction_date: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  is_income: boolean;
  category_name?: string;
  categorization_confidence: number;
  is_categorized_manually: boolean;
  balance_after_transaction?: number;
  reference_number?: string;
  merchant_name?: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TaxCalculation {
  id: string;
  user_id: string;
  tax_year: number;
  tax_period: "annual" | "monthly" | "quarterly";
  period_start: string;
  period_end: string;
  gross_income: number;
  salary_income: number;
  freelance_income: number;
  business_income: number;
  investment_income: number;
  other_income: number;
  taxable_income: number;
  personal_allowance: number;
  consolidated_relief_allowance: number;
  estimated_tax: number;
  effective_rate: number;
  tax_status: "estimated" | "filed" | "paid";
  due_date?: string;
  amount_paid: number;
  balance_due: number;
  tax_config?: Record<string, any>;
  calculation_details?: Record<string, any>;
  // Tax exemption and badge information
  is_taxable: boolean;
  tax_exemption_reason?: string;
  tax_badge: "tax-exempt" | "low-tax" | "standard-tax" | "high-tax";
  created_at: string;
  updated_at: string;
}

export interface FinancialTodo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: "budget" | "savings" | "investment" | "tax" | "bill" | "other";
  priority: "low" | "medium" | "high";
  target_amount?: number;
  current_amount: number;
  target_date?: string;
  progress_percentage: number;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  is_recurring: boolean;
  recurring_frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  next_due_date?: string;
  completed_at?: string;
  completion_notes?: string;
  tags: string[];
  reminder_settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Extended transaction interface with category info
export interface TransactionWithCategory extends Transaction {
  category?: Category;
}

// Statement with transactions
export interface StatementWithTransactions extends Statement {
  transactions?: TransactionWithCategory[];
}

// Database response types
export interface DatabaseResponse<T> {
  data: T | null;
  error: any;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter types for transactions
export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
  types?: ("debit" | "credit")[];
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

// Analytics types
export interface SpendingAnalytics {
  totalSpending: number;
  totalIncome: number;
  netIncome: number;
  spendingByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  incomeByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    income: number;
    spending: number;
    net: number;
  }>;
}

// Tax calculation input types
export interface TaxCalculationInput {
  tax_year: number;
  tax_period?: "annual" | "monthly" | "quarterly";
  period_start: string;
  period_end: string;
  gross_income: number;
  salary_income?: number;
  freelance_income?: number;
  business_income?: number;
  investment_income?: number;
  other_income?: number;
}

// Financial todo input types
export interface CreateFinancialTodoInput {
  title: string;
  description?: string;
  category: "budget" | "savings" | "investment" | "tax" | "bill" | "other";
  priority?: "low" | "medium" | "high";
  target_amount?: number;
  target_date?: string;
  is_recurring?: boolean;
  recurring_frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  tags?: string[];
  reminder_settings?: Record<string, any>;
}

export interface UpdateFinancialTodoInput {
  title?: string;
  description?: string;
  category?: "budget" | "savings" | "investment" | "tax" | "bill" | "other";
  priority?: "low" | "medium" | "high";
  target_amount?: number;
  current_amount?: number;
  target_date?: string;
  status?: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  is_recurring?: boolean;
  recurring_frequency?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  next_due_date?: string;
  completed_at?: string;
  completion_notes?: string;
  tags?: string[];
  reminder_settings?: Record<string, any>;
}

export interface MonthlyFinancialAnalysis {
  id: string;
  user_id: string;
  analysis_month: number;
  analysis_year: number;
  total_income: number;
  total_expenses: number;
  net_savings: number;
  transaction_count: number;
  ai_remark: string;
  ai_advice: string;
  ai_suggestions: string[];
  generated_at: string;
  created_at: string;
  updated_at: string;
}
