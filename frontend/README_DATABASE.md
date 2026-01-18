# Database Implementation Guide

This document outlines the complete database implementation for the Spenwise financial management system.

## Database Schema

The database consists of 6 main tables:

### 1. Users Table

- **Purpose**: Store user account information
- **Key Fields**: id, email, full_name, avatar_url
- **Location**: `supabase/migrations/001_create_users_table.sql`

### 2. Categories Table

- **Purpose**: Store transaction categories (both default and user-defined)
- **Key Fields**: id, user_id, name, keywords, is_income, is_default
- **Location**: `supabase/migrations/002_create_categories_table.sql`

### 3. Statements Table

- **Purpose**: Store uploaded PDF statement metadata
- **Key Fields**: id, user_id, filename, file_size, num_pages, raw_text, processing_status
- **Location**: `supabase/migrations/003_create_statements_table.sql`

### 4. Transactions Table

- **Purpose**: Store extracted transaction data
- **Key Fields**: id, user_id, statement_id, category_id, transaction_date, description, amount, type
- **Location**: `supabase/migrations/004_create_transactions_table.sql`

### 5. Tax Calculations Table

- **Purpose**: Store tax calculations and estimates
- **Key Fields**: id, user_id, tax_year, gross_income, estimated_tax, tax_status
- **Location**: `supabase/migrations/005_create_tax_calculations_table.sql`

### 6. Financial Todos Table

- **Purpose**: Store financial goals and tasks
- **Key Fields**: id, user_id, title, category, target_amount, current_amount, status
- **Location**: `supabase/migrations/006_create_financial_todos_table.sql`

## Database Types

All TypeScript interfaces are defined in:

- **Location**: `lib/database/types.ts`
- **Includes**: User, Category, Statement, Transaction, TaxCalculation, FinancialTodo
- **Helper Types**: DatabaseResponse, PaginatedResponse, TransactionFilters

## Database Client

Two Supabase clients are available:

- **Server Client**: `lib/database/client.ts` - For API routes
- **Browser Client**: `lib/supabase.ts` - For client-side usage

## Database Utilities

All database operations are centralized in:

- **Location**: `lib/database/utils.ts`
- **Functions**: CRUD operations for all tables
- **Features**: Error handling, type safety, pagination

## API Endpoints

### Core Data APIs

- **Statements**: `app/api/statements/route.ts` - GET statements with pagination
- **Transactions**: `app/api/transactions/route.ts` - GET/PUT transactions with filtering
- **Categories**: `app/api/categories/route.ts` - GET/POST categories
- **Analytics**: `app/api/analytics/route.ts` - GET spending analytics

### Processing APIs

- **Upload**: `app/api/upload/route.ts` - Process PDF and save statement
- **Extract**: `app/api/transactions/extract/route.ts` - Extract and save transactions
- **Tax**: `app/api/tax/estimate/route.ts` - Calculate and save tax estimates

### User Management APIs

- **User**: `app/api/auth/user/route.ts` - GET/POST user data
- **Todos**: `app/api/todos/route.ts` - CRUD operations for financial todos

## Data Flow

1. **PDF Upload** → `/api/upload` → Save statement metadata
2. **Text Extraction** → Extract text from PDF
3. **Transaction Extraction** → `/api/transactions/extract` → Save transactions
4. **Categorization** → Auto-categorize using keywords/AI
5. **Analytics** → Calculate spending patterns and insights
6. **Tax Calculation** → Estimate taxes based on income

## Security

All tables have Row Level Security (RLS) enabled:

- Users can only access their own data
- Default categories are visible to all users
- API routes validate user authentication

## Migration Instructions

To apply the database schema:

1. Set up Supabase project
2. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Run migrations in order:
   ```bash
   supabase db push
   ```

## Testing

To test the database integration:

1. Create a test user via `/api/auth/user`
2. Upload a PDF via `/api/upload`
3. Extract transactions via `/api/transactions/extract`
4. Verify data in Supabase dashboard
5. Test analytics via `/api/analytics`

## Error Handling

All database utilities return consistent format:

```typescript
interface DatabaseResponse<T> {
  data: T | null;
  error: any;
}
```

API routes handle errors consistently:

- 400 for validation errors
- 404 for not found
- 500 for server errors

## Performance Considerations

- Indexes on frequently queried fields
- Pagination for large datasets
- Text search on transaction descriptions
- Efficient joins for related data

## Future Enhancements

- Real-time subscriptions
- Data export functionality
- Advanced filtering
- Bulk operations
- Data archiving
