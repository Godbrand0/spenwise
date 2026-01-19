-- Create tax calculations table
CREATE TABLE IF NOT EXISTS tax_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tax period
  tax_year INTEGER NOT NULL,
  tax_period VARCHAR(20) NOT NULL DEFAULT 'annual', -- 'annual', 'monthly', 'quarterly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Income breakdown
  gross_income DECIMAL(15, 2) NOT NULL DEFAULT 0,
  salary_income DECIMAL(15, 2) DEFAULT 0,
  freelance_income DECIMAL(15, 2) DEFAULT 0,
  business_income DECIMAL(15, 2) DEFAULT 0,
  investment_income DECIMAL(15, 2) DEFAULT 0,
  other_income DECIMAL(15, 2) DEFAULT 0,
  
  -- Tax calculation details
  taxable_income DECIMAL(15, 2) NOT NULL DEFAULT 0,
  personal_allowance DECIMAL(15, 2) DEFAULT 0,
  consolidated_relief_allowance DECIMAL(15, 2) DEFAULT 0,
  estimated_tax DECIMAL(15, 2) NOT NULL DEFAULT 0,
  effective_rate DECIMAL(5, 2) DEFAULT 0,
  
  -- Tax status
  tax_status VARCHAR(20) DEFAULT 'estimated', -- 'estimated', 'filed', 'paid'
  due_date DATE,
  amount_paid DECIMAL(15, 2) DEFAULT 0,
  balance_due DECIMAL(15, 2) GENERATED ALWAYS AS (estimated_tax - amount_paid) STORED,
  
  -- Metadata
  tax_config JSONB, -- Store the tax configuration used for calculation
  calculation_details JSONB, -- Store detailed breakdown of tax calculation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique tax period per user
  UNIQUE(user_id, tax_year, tax_period)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tax_calculations_user_id ON tax_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_tax_year ON tax_calculations(tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_period ON tax_calculations(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_status ON tax_calculations(tax_status);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_due_date ON tax_calculations(due_date);

-- RLS policies
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;

-- Users can view their own tax calculations
DROP POLICY IF EXISTS "Users can view own tax calculations" ON tax_calculations;
CREATE POLICY "Users can view own tax calculations" ON tax_calculations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own tax calculations
DROP POLICY IF EXISTS "Users can insert own tax calculations" ON tax_calculations;
CREATE POLICY "Users can insert own tax calculations" ON tax_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tax calculations
DROP POLICY IF EXISTS "Users can update own tax calculations" ON tax_calculations;
CREATE POLICY "Users can update own tax calculations" ON tax_calculations
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own tax calculations
DROP POLICY IF EXISTS "Users can delete own tax calculations" ON tax_calculations;
CREATE POLICY "Users can delete own tax calculations" ON tax_calculations
  FOR DELETE USING (auth.uid() = user_id);

-- Function to calculate tax due date (January 31 of following year)
CREATE OR REPLACE FUNCTION calculate_tax_due_date(tax_year INTEGER)
RETURNS DATE AS $$
BEGIN
  RETURN MAKE_DATE(tax_year + 1, 1, 31);
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update effective rate
CREATE OR REPLACE FUNCTION update_effective_rate()
RETURNS TRIGGER AS $$
BEGIN
  NEW.effective_rate = CASE 
    WHEN NEW.gross_income > 0 THEN ROUND((NEW.estimated_tax / NEW.gross_income) * 100, 2)
    ELSE 0 
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update effective rate
DROP TRIGGER IF EXISTS trigger_update_effective_rate ON tax_calculations;
CREATE TRIGGER trigger_update_effective_rate
  BEFORE INSERT OR UPDATE ON tax_calculations
  FOR EACH ROW EXECUTE FUNCTION update_effective_rate();