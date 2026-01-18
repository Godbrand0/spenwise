-- Create statements table for uploaded PDF statements
CREATE TABLE IF NOT EXISTS statements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  num_pages INTEGER NOT NULL,
  raw_text TEXT,
  extraction_method VARCHAR(50) DEFAULT 'hybrid', -- 'regex', 'ai', 'hybrid'
  bank_name VARCHAR(100),
  statement_period_start DATE,
  statement_period_end DATE,
  account_number VARCHAR(50),
  account_name VARCHAR(100),
  opening_balance DECIMAL(15, 2),
  closing_balance DECIMAL(15, 2),
  total_credits DECIMAL(15, 2) DEFAULT 0,
  total_debits DECIMAL(15, 2) DEFAULT 0,
  processing_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_statements_user_id ON statements(user_id);
CREATE INDEX IF NOT EXISTS idx_statements_status ON statements(processing_status);
CREATE INDEX IF NOT EXISTS idx_statements_period ON statements(statement_period_start, statement_period_end);
CREATE INDEX IF NOT EXISTS idx_statements_created_at ON statements(created_at);

-- RLS policies
ALTER TABLE statements ENABLE ROW LEVEL SECURITY;

-- Users can view their own statements
CREATE POLICY "Users can view own statements" ON statements
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own statements
CREATE POLICY "Users can insert own statements" ON statements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own statements
CREATE POLICY "Users can update own statements" ON statements
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own statements
CREATE POLICY "Users can delete own statements" ON statements
  FOR DELETE USING (auth.uid() = user_id);