-- Create monthly_financial_analysis table to store AI-generated insights for each month

CREATE TABLE IF NOT EXISTS monthly_financial_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  analysis_month INTEGER NOT NULL CHECK (analysis_month BETWEEN 1 AND 12),
  analysis_year  INTEGER NOT NULL,
  -- Computed totals (calculated at generation time, stored for fast display)
  total_income      DECIMAL(15, 2) DEFAULT 0,
  total_expenses    DECIMAL(15, 2) DEFAULT 0,
  net_savings       DECIMAL(15, 2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  -- AI output
  ai_remark      TEXT,           -- 2-3 sentence insight for the month
  ai_advice      TEXT,           -- 1-2 sentences: "how to build on it"
  ai_suggestions JSONB DEFAULT '[]'::jsonb,  -- 3 actionable bullet points
  generated_at   TIMESTAMP WITH TIME ZONE,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, analysis_year, analysis_month)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_monthly_analysis_user_id ON monthly_financial_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_analysis_user_period
  ON monthly_financial_analysis(user_id, analysis_year, analysis_month);

-- Enable Row Level Security
ALTER TABLE monthly_financial_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage their own monthly analysis"
  ON monthly_financial_analysis FOR ALL USING (auth.uid() = user_id);