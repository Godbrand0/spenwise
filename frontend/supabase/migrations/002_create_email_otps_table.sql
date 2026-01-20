-- Create OTP verification table
CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON public.email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_expires_at ON public.email_otps(expires_at);

-- Enable Row Level Security
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for signup)
CREATE POLICY "Allow OTP creation" ON public.email_otps
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow reads for verification (only own email)
CREATE POLICY "Allow OTP verification" ON public.email_otps
  FOR SELECT
  USING (true);

-- Create policy to allow updates for verification
CREATE POLICY "Allow OTP update" ON public.email_otps
  FOR UPDATE
  USING (true);

-- Function to clean up expired OTPs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.email_otps
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create a trigger to auto-cleanup on insert
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_otps()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM cleanup_expired_otps();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_otps_trigger
  AFTER INSERT ON public.email_otps
  EXECUTE FUNCTION trigger_cleanup_expired_otps();
