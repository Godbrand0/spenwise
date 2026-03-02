-- Add month and year generated columns to transactions table
-- These columns will be automatically computed from transaction_date

ALTER TABLE transactions
  ADD COLUMN transaction_month INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM transaction_date)::INTEGER) STORED,
  ADD COLUMN transaction_year  INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR  FROM transaction_date)::INTEGER) STORED;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_transactions_month ON transactions(transaction_month);
CREATE INDEX IF NOT EXISTS idx_transactions_year  ON transactions(transaction_year);
CREATE INDEX IF NOT EXISTS idx_transactions_user_year_month
  ON transactions(user_id, transaction_year, transaction_month);

-- Add comments for documentation
COMMENT ON COLUMN transactions.transaction_month IS 'Month (1-12); generated from transaction_date';
COMMENT ON COLUMN transactions.transaction_year  IS 'Year (e.g. 2024); generated from transaction_date';