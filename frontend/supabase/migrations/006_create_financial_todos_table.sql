-- Create financial todos table
CREATE TABLE IF NOT EXISTS financial_todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Todo details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'budget', 'savings', 'investment', 'tax', 'bill', 'other'
  priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high'
  
  -- Target and progress
  target_amount DECIMAL(15, 2),
  current_amount DECIMAL(15, 2) DEFAULT 0,
  target_date DATE,
  progress_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN target_amount > 0 THEN ROUND((current_amount / target_amount) * 100, 2)
      ELSE 0 
    END
  ) STORED,
  
  -- Status and dates
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'cancelled'
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  next_due_date DATE,
  
  -- Completion details
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  reminder_settings JSONB, -- Store reminder preferences
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_financial_todos_user_id ON financial_todos(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_todos_status ON financial_todos(status);
CREATE INDEX IF NOT EXISTS idx_financial_todos_category ON financial_todos(category);
CREATE INDEX IF NOT EXISTS idx_financial_todos_priority ON financial_todos(priority);
CREATE INDEX IF NOT EXISTS idx_financial_todos_target_date ON financial_todos(target_date);
CREATE INDEX IF NOT EXISTS idx_financial_todos_next_due_date ON financial_todos(next_due_date);
CREATE INDEX IF NOT EXISTS idx_financial_todos_is_recurring ON financial_todos(is_recurring);

-- RLS policies
ALTER TABLE financial_todos ENABLE ROW LEVEL SECURITY;

-- Users can view their own todos
CREATE POLICY "Users can view own todos" ON financial_todos
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own todos
CREATE POLICY "Users can manage own todos" ON financial_todos
  FOR ALL USING (auth.uid() = user_id);

-- Function to update next_due_date for recurring todos
CREATE OR REPLACE FUNCTION update_next_due_date()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a completed recurring todo, calculate next due date
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.is_recurring = TRUE THEN
    CASE NEW.recurring_frequency
      WHEN 'daily' THEN
        NEW.next_due_date := NEW.completed_at::DATE + INTERVAL '1 day';
      WHEN 'weekly' THEN
        NEW.next_due_date := NEW.completed_at::DATE + INTERVAL '1 week';
      WHEN 'monthly' THEN
        NEW.next_due_date := NEW.completed_at::DATE + INTERVAL '1 month';
      WHEN 'quarterly' THEN
        NEW.next_due_date := NEW.completed_at::DATE + INTERVAL '3 months';
      WHEN 'yearly' THEN
        NEW.next_due_date := NEW.completed_at::DATE + INTERVAL '1 year';
    END CASE;
    
    -- Reset status to pending for the next occurrence
    NEW.status := 'pending';
    NEW.current_amount := 0;
    NEW.completed_at := NULL;
    NEW.completion_notes := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle recurring todos
CREATE TRIGGER trigger_update_next_due_date
  BEFORE UPDATE ON financial_todos
  FOR EACH ROW EXECUTE FUNCTION update_next_due_date();

-- Insert some default financial todo templates
INSERT INTO financial_todos (title, description, category, priority, is_recurring, recurring_frequency, tags, is_default)
VALUES
  ('Review monthly budget', 'Review and adjust monthly budget based on spending patterns', 'budget', 'medium', TRUE, 'monthly', ARRAY['budget', 'review'], TRUE),
  ('Pay utility bills', 'Ensure all utility bills are paid on time', 'bill', 'high', TRUE, 'monthly', ARRAY['bills', 'utilities'], TRUE),
  ('Save for emergency fund', 'Contribute to emergency fund savings', 'savings', 'high', TRUE, 'monthly', ARRAY['savings', 'emergency'], TRUE),
  ('Review investment portfolio', 'Review and rebalance investment portfolio', 'investment', 'medium', TRUE, 'quarterly', ARRAY['investment', 'review'], TRUE),
  ('File tax returns', 'Prepare and file annual tax returns', 'tax', 'high', TRUE, 'yearly', ARRAY['tax', 'filing'], TRUE)
ON CONFLICT DO NOTHING;