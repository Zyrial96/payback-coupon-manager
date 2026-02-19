# Payback Coupon Manager 📱

Ein persönlicher Coupon-Manager für Payback und andere Treueprogramme. Verwalte alle deine Coupons an einem Ort und zeige Barcodes direkt an der Kasse an.

## Features ✨

- 📱 Mobile-first Design
- 🎫 Coupon-Verwaltung (Payback, DM, Rossmann, etc.)
- 📊 Übersicht über aktive/abgelaufene Coupons
- 📅 Ablaufdatum-Tracking
- 📶 Barcode-Anzeige (CODE128, QR, EAN13)
- ☁️ Cloud-Sync via Supabase
- 🔒 Persönliche Datenbank pro Benutzer

## Tech Stack 🛠️

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Datenbank:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Barcode:** jsbarcode, qrcode
- **Hosting:** Vercel

## Schnellstart 🚀

### 1. Supabase einrichten

1. Erstelle ein kostenloses Konto auf [supabase.com](https://supabase.com)
2. Neue Projekt erstellen
3. SQL Editor öffnen und folgendes ausführen:

```sql
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

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own coupons"
  ON coupons
  FOR ALL
  USING (auth.uid() = user_id);
```

4. Project URL und Anon Key kopieren

### 2. Lokal entwickeln

```bash
# Repository klonen
git clone https://github.com/Zyrial96/payback-coupon-manager.git
cd payback-coupon-manager

# Dependencies installieren
npm install

# Environment Variablen
# Kopiere .env.example zu .env.local und füge deine Supabase-Daten ein
cp .env.example .env.local

# Dev Server starten
npm run dev
```

### 3. Auf Vercel deployen

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Zyrial96/payback-coupon-manager)

Oder manuell:

1. Projekt auf [Vercel](https://vercel.com) importieren
2. Environment Variablen (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) hinzufügen
3. Deployen!

## Nutzung 📖

1. **Registrieren/Anmelden** mit E-Mail
2. **Coupons hinzufügen** über den "+" Button
3. **Barcode anzeigen** durch Klick auf den Coupon
4. **Alte Coupons löschen** oder als "genutzt" markieren

## Roadmap 🗺️

- [ ] Telegram-Bot für automatisches Coupon-Sammeln
- [ ] Kamera-Scan zum Hinzufügen von Coupons
- [ ] Push-Benachrichtigungen vor Ablauf
- [ ] Coupon-Kategorien und Filter
- [ ] Export/Import Funktion

## Lizenz 📄

MIT License - Persönlicher Gebrauch.

**Wichtig:** Diese App ist für persönlichen Gebrauch gedacht. Bitte beachte die AGB der jeweiligen Coupon-Anbieter.

---

Entwickelt mit ❤️ für effizientes Coupon-Management.