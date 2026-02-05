-- Create user financial analysis table
-- Stores comprehensive financial analysis across all user statements
-- Updated whenever a new statement is uploaded

CREATE TABLE IF NOT EXISTS user_financial_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  ai_insights TEXT NOT NULL,
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  total_statements INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  analysis_period_start DATE,
  analysis_period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_analysis_user_id 
ON user_financial_analysis(user_id);

CREATE INDEX IF NOT EXISTS idx_user_analysis_updated 
ON user_financial_analysis(updated_at);

-- RLS policies
ALTER TABLE user_financial_analysis ENABLE ROW LEVEL SECURITY;

-- Users can view their own analysis
DROP POLICY IF EXISTS "Users can view own analysis" ON user_financial_analysis;
CREATE POLICY "Users can view own analysis" 
ON user_financial_analysis
FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own analysis
DROP POLICY IF EXISTS "Users can insert own analysis" ON user_financial_analysis;
CREATE POLICY "Users can insert own analysis" 
ON user_financial_analysis
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own analysis
DROP POLICY IF EXISTS "Users can update own analysis" ON user_financial_analysis;
CREATE POLICY "Users can update own analysis" 
ON user_financial_analysis
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own analysis
DROP POLICY IF EXISTS "Users can delete own analysis" ON user_financial_analysis;
CREATE POLICY "Users can delete own analysis" 
ON user_financial_analysis
FOR DELETE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE user_financial_analysis IS 'Stores comprehensive AI-generated financial analysis for each user across all their statements';
COMMENT ON COLUMN user_financial_analysis.ai_insights IS 'AI-generated comprehensive financial insights (3-4 sentences)';
COMMENT ON COLUMN user_financial_analysis.ai_suggestions IS 'AI-generated cost-cutting suggestions as JSON array (4-5 items)';
COMMENT ON COLUMN user_financial_analysis.total_statements IS 'Total number of statements analyzed';
COMMENT ON COLUMN user_financial_analysis.total_transactions IS 'Total number of transactions analyzed';
COMMENT ON COLUMN user_financial_analysis.analysis_period_start IS 'Start date of the analysis period';
COMMENT ON COLUMN user_financial_analysis.analysis_period_end IS 'End date of the analysis period';
