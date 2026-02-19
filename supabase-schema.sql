-- Supabase Datenbank Schema für Payback Coupon Manager
-- Führe dies im SQL Editor deines Supabase Projekts aus

-- Coupons Tabelle erstellen
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  barcode TEXT NOT NULL,
  barcode_type TEXT DEFAULT 'CODE128' CHECK (barcode_type IN ('CODE128', 'QR', 'EAN13')),
  type TEXT DEFAULT 'payback' CHECK (type IN ('payback', 'dm', 'rossmann', 'other')),
  valid_from DATE,
  valid_until DATE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_coupons_user_id ON coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_until ON coupons(valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_used ON coupons(used);

-- Row Level Security aktivieren
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Policy: Benutzer können nur ihre eigenen Coupons sehen/bearbeiten
CREATE POLICY "Users can only access their own coupons"
  ON coupons
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auth Policy für neue Registrierungen
CREATE POLICY "Allow individual user access"
  ON coupons
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Test-Daten (optional, kann gelöscht werden)
-- INSERT INTO coupons (user_id, title, description, barcode, type, valid_until)
-- VALUES (auth.uid(), 'Test Coupon', '10x Punkte', '1234567890', 'payback', '2026-12-31');

-- Erfolgsmeldung
SELECT 'Datenbank-Setup erfolgreich!' as status;