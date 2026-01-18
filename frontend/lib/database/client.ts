import { createClient } from "@supabase/supabase-js";
import { Database } from "./database";

// Create a Supabase client for server-side usage
export function createServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

// Create a Supabase client for client-side usage
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Database type definitions
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          keywords: string[];
          parent_category: string | null;
          is_income: boolean;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          keywords?: string[];
          parent_category?: string | null;
          is_income?: boolean;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          keywords?: string[];
          parent_category?: string | null;
          is_income?: boolean;
          is_default?: boolean;
          updated_at?: string;
        };
      };
      statements: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          file_size: number;
          num_pages: number;
          raw_text: string | null;
          extraction_method: string;
          bank_name: string | null;
          statement_period_start: string | null;
          statement_period_end: string | null;
          account_number: string | null;
          account_name: string | null;
          opening_balance: number | null;
          closing_balance: number | null;
          total_credits: number;
          total_debits: number;
          processing_status: "pending" | "processing" | "completed" | "failed";
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          filename: string;
          file_size: number;
          num_pages: number;
          raw_text?: string | null;
          extraction_method?: string;
          bank_name?: string | null;
          statement_period_start?: string | null;
          statement_period_end?: string | null;
          account_number?: string | null;
          account_name?: string | null;
          opening_balance?: number | null;
          closing_balance?: number | null;
          total_credits?: number;
          total_debits?: number;
          processing_status?: "pending" | "processing" | "completed" | "failed";
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          file_size?: number;
          num_pages?: number;
          raw_text?: string | null;
          extraction_method?: string;
          bank_name?: string | null;
          statement_period_start?: string | null;
          statement_period_end?: string | null;
          account_number?: string | null;
          account_name?: string | null;
          opening_balance?: number | null;
          closing_balance?: number | null;
          total_credits?: number;
          total_debits?: number;
          processing_status?: "pending" | "processing" | "completed" | "failed";
          error_message?: string | null;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          statement_id: string;
          category_id: string | null;
          transaction_date: string;
          description: string;
          amount: number;
          type: "debit" | "credit";
          is_income: boolean;
          category_name: string | null;
          categorization_confidence: number;
          is_categorized_manually: boolean;
          balance_after_transaction: number | null;
          reference_number: string | null;
          merchant_name: string | null;
          location: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          statement_id: string;
          category_id?: string | null;
          transaction_date: string;
          description: string;
          amount: number;
          type: "debit" | "credit";
          is_income?: boolean;
          category_name?: string | null;
          categorization_confidence?: number;
          is_categorized_manually?: boolean;
          balance_after_transaction?: number | null;
          reference_number?: string | null;
          merchant_name?: string | null;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          statement_id?: string;
          category_id?: string | null;
          transaction_date?: string;
          description?: string;
          amount?: number;
          type?: "debit" | "credit";
          is_income?: boolean;
          category_name?: string | null;
          categorization_confidence?: number;
          is_categorized_manually?: boolean;
          balance_after_transaction?: number | null;
          reference_number?: string | null;
          merchant_name?: string | null;
          location?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      tax_calculations: {
        Row: {
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
          due_date: string | null;
          amount_paid: number;
          balance_due: number;
          tax_config: any | null;
          calculation_details: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tax_year: number;
          tax_period?: "annual" | "monthly" | "quarterly";
          period_start: string;
          period_end: string;
          gross_income?: number;
          salary_income?: number;
          freelance_income?: number;
          business_income?: number;
          investment_income?: number;
          other_income?: number;
          taxable_income?: number;
          personal_allowance?: number;
          consolidated_relief_allowance?: number;
          estimated_tax?: number;
          effective_rate?: number;
          tax_status?: "estimated" | "filed" | "paid";
          due_date?: string | null;
          amount_paid?: number;
          tax_config?: any | null;
          calculation_details?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tax_year?: number;
          tax_period?: "annual" | "monthly" | "quarterly";
          period_start?: string;
          period_end?: string;
          gross_income?: number;
          salary_income?: number;
          freelance_income?: number;
          business_income?: number;
          investment_income?: number;
          other_income?: number;
          taxable_income?: number;
          personal_allowance?: number;
          consolidated_relief_allowance?: number;
          estimated_tax?: number;
          effective_rate?: number;
          tax_status?: "estimated" | "filed" | "paid";
          due_date?: string | null;
          amount_paid?: number;
          tax_config?: any | null;
          calculation_details?: any | null;
          updated_at?: string;
        };
      };
      financial_todos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category:
            | "budget"
            | "savings"
            | "investment"
            | "tax"
            | "bill"
            | "other";
          priority: "low" | "medium" | "high";
          target_amount: number | null;
          current_amount: number;
          target_date: string | null;
          progress_percentage: number;
          status:
            | "pending"
            | "in_progress"
            | "completed"
            | "failed"
            | "cancelled";
          is_recurring: boolean;
          recurring_frequency:
            | "daily"
            | "weekly"
            | "monthly"
            | "quarterly"
            | "yearly"
            | null;
          next_due_date: string | null;
          completed_at: string | null;
          completion_notes: string | null;
          tags: string[];
          reminder_settings: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category:
            | "budget"
            | "savings"
            | "investment"
            | "tax"
            | "bill"
            | "other";
          priority?: "low" | "medium" | "high";
          target_amount?: number | null;
          current_amount?: number;
          target_date?: string | null;
          is_recurring?: boolean;
          recurring_frequency?:
            | "daily"
            | "weekly"
            | "monthly"
            | "quarterly"
            | "yearly"
            | null;
          next_due_date?: string | null;
          completed_at?: string | null;
          completion_notes?: string | null;
          tags?: string[];
          reminder_settings?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?:
            | "budget"
            | "savings"
            | "investment"
            | "tax"
            | "bill"
            | "other";
          priority?: "low" | "medium" | "high";
          target_amount?: number | null;
          current_amount?: number;
          target_date?: string | null;
          status?:
            | "pending"
            | "in_progress"
            | "completed"
            | "failed"
            | "cancelled";
          is_recurring?: boolean;
          recurring_frequency?:
            | "daily"
            | "weekly"
            | "monthly"
            | "quarterly"
            | "yearly"
            | null;
          next_due_date?: string | null;
          completed_at?: string | null;
          completion_notes?: string | null;
          tags?: string[];
          reminder_settings?: any | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
