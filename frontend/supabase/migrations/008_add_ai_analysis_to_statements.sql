-- Add AI analysis columns to statements table
-- This allows storing AI-generated insights and suggestions per statement
-- to avoid regenerating them on every page load

ALTER TABLE statements
ADD COLUMN ai_insights TEXT,
ADD COLUMN ai_suggestions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN analysis_generated_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on analyzed statements
CREATE INDEX IF NOT EXISTS idx_statements_analysis_generated 
ON statements(analysis_generated_at) 
WHERE analysis_generated_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN statements.ai_insights IS 'AI-generated financial insights for this statement (2-3 sentences summary)';
COMMENT ON COLUMN statements.ai_suggestions IS 'AI-generated cost-cutting suggestions as JSON array';
COMMENT ON COLUMN statements.analysis_generated_at IS 'Timestamp when AI analysis was last generated';
