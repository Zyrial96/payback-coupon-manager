import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Datenbank-Schema für Supabase:
/*
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  barcode TEXT NOT NULL,
  barcode_type TEXT DEFAULT 'CODE128',
  type TEXT DEFAULT 'payback',
  valid_from DATE,
  valid_until DATE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own coupons"
  ON coupons
  FOR ALL
  USING (auth.uid() = user_id);
*/