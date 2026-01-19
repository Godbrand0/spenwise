-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  statement_id UUID REFERENCES statements(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  -- Transaction details
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('debit', 'credit')),
  is_income BOOLEAN DEFAULT FALSE,
  
  -- Categorization details
  category_name VARCHAR(100),
  categorization_confidence DECIMAL(3, 2) DEFAULT 0.0 CHECK (categorization_confidence >= 0 AND categorization_confidence <= 1),
  is_categorized_manually BOOLEAN DEFAULT FALSE,
  
  -- Additional metadata
  balance_after_transaction DECIMAL(15, 2),
  reference_number VARCHAR(100),
  merchant_name VARCHAR(100),
  location VARCHAR(100),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_statement_id ON transactions(statement_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_is_income ON transactions(is_income);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);
CREATE INDEX IF NOT EXISTS idx_transactions_description ON transactions USING gin(to_tsvector('english', description));

-- RLS policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own transactions
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own transactions
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update statement totals when transactions are inserted/updated/deleted
CREATE OR REPLACE FUNCTION update_statement_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE statements 
    SET 
      total_credits = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM transactions 
        WHERE statement_id = COALESCE(NEW.statement_id, OLD.statement_id) 
        AND type = 'credit'
      ),
      total_debits = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM transactions 
        WHERE statement_id = COALESCE(NEW.statement_id, OLD.statement_id) 
        AND type = 'debit'
      ),
      updated_at = NOW()
    WHERE id = COALESCE(NEW.statement_id, OLD.statement_id);
    
    RETURN COALESCE(NEW, OLD);
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE statements 
    SET 
      total_credits = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM transactions 
        WHERE statement_id = OLD.statement_id 
        AND type = 'credit'
      ),
      total_debits = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM transactions 
        WHERE statement_id = OLD.statement_id 
        AND type = 'debit'
      ),
      updated_at = NOW()
    WHERE id = OLD.statement_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update statement totals
DROP TRIGGER IF EXISTS trigger_update_statement_totals_insert ON transactions;
CREATE TRIGGER trigger_update_statement_totals_insert
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_statement_totals();

DROP TRIGGER IF EXISTS trigger_update_statement_totals_update ON transactions;
CREATE TRIGGER trigger_update_statement_totals_update
  AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_statement_totals();

DROP TRIGGER IF EXISTS trigger_update_statement_totals_delete ON transactions;
CREATE TRIGGER trigger_update_statement_totals_delete
  AFTER DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_statement_totals();