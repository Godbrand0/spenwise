-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  parent_category VARCHAR(100),
  is_income BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique category names per user
  UNIQUE(user_id, name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_income ON categories(is_income);
CREATE INDEX IF NOT EXISTS idx_categories_is_default ON categories(is_default);

-- RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users can view their own categories and default categories
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id OR is_default = TRUE);

-- Users can manage their own categories
CREATE POLICY "Users can manage own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

-- Insert default categories for all users
INSERT INTO categories (name, keywords, is_income, is_default) VALUES
  -- Expense categories
  ('Groceries', ARRAY['shoprite', 'spar', 'supermarket', 'market', 'food store', 'groceries'], FALSE, TRUE),
  ('Dining', ARRAY['restaurant', 'kfc', 'dominos', 'pizza', 'food', 'eatery', 'cafe'], FALSE, TRUE),
  ('Transport', ARRAY['uber', 'bolt', 'taxi', 'fuel', 'petrol', 'transport', 'bus', 'danfo'], FALSE, TRUE),
  ('Rent', ARRAY['rent', 'housing', 'accommodation', 'landlord'], FALSE, TRUE),
  ('Entertainment', ARRAY['netflix', 'cinema', 'movies', 'show', 'concert', 'event'], FALSE, TRUE),
  ('Utilities', ARRAY['electricity', 'water', 'internet', 'phone', 'bill', 'utility'], FALSE, TRUE),
  ('Healthcare', ARRAY['hospital', 'pharmacy', 'doctor', 'medical', 'health'], FALSE, TRUE),
  ('Shopping', ARRAY['mall', 'clothing', 'shoes', 'electronics', 'purchase'], FALSE, TRUE),
  
  -- Income categories
  ('Salary', ARRAY['salary', 'payroll', 'wages', 'monthly pay'], TRUE, TRUE),
  ('Freelance Income', ARRAY['freelance', 'contract', 'consulting', 'gig'], TRUE, TRUE),
  ('Business Income', ARRAY['business', 'sales', 'revenue', 'profit'], TRUE, TRUE),
  ('Investment Income', ARRAY['dividend', 'interest', 'investment', 'returns'], TRUE, TRUE),
  ('Other Income', ARRAY['gift', 'refund', 'transfer', 'bonus'], TRUE, TRUE)
ON CONFLICT (name, is_default) DO NOTHING;