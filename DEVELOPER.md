# Payback Coupon Manager - Entwickler Dokumentation

> **Für Claude Code Weiterentwicklung** - Alle relevanten Informationen auf einen Blick

## 🎯 Projekt-Übersicht

Ein moderner Coupon Manager mit Next.js, Apple-Design, Telegram-Bot Integration und umfangreichen Features.

### Tech Stack
- **Framework:** Next.js 15 + React 19
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS
- **Datenbank:** Supabase (optional) / LocalStorage
- **Bot:** Telegraf (Telegram Bot Framework)
- **Barcode:** html5-qrcode, jsbarcode

---

## 📁 Projektstruktur

```
payback-coupon-manager/
├── app/
│   ├── globals.css          # Global Styles + Dark Mode
│   ├── layout.tsx           # Root Layout
│   └── page.tsx             # Hauptseite
├── components/
│   ├── AddCouponModal.tsx   # Coupon erstellen
│   ├── BarcodeDisplay.tsx   # Barcode anzeigen (Fullscreen)
│   ├── CameraScanner.tsx    # Kamera-Scan
│   ├── CouponCard.tsx       # Einzelne Coupon-Karte
│   ├── CouponFilter.tsx     # Filter & Suche
│   ├── MultiScanModal.tsx   # Multi-Coupon Modus
│   ├── SettingsModal.tsx    # Einstellungen
│   ├── ShareModal.tsx       # Coupon teilen
│   ├── Statistics.tsx       # Statistiken Dashboard
│   └── TelegramSync.tsx     # Telegram Integration
├── lib/
│   ├── importExport.ts      # JSON/CSV Import/Export
│   ├── notifications.ts     # Push Notifications
│   └── supabase.ts          # Supabase Client
├── types/
│   └── coupon.ts            # TypeScript Interfaces
├── telegram-bot/
│   ├── bot.js               # Telegram Bot Logik
│   ├── api.js               # REST API Server
│   └── README.md            # Bot Dokumentation
└── public/
    └── sw.js                # Service Worker
```

---

## 🎨 Design-System

### Farbpalette (Tailwind Config)
```javascript
colors: {
  apple: {
    red: '#FF3B30',
    blue: '#007AFF', 
    green: '#34C759',
    orange: '#FF9500',
    purple: '#AF52DE',
    pink: '#FF2D55',
    gray: {
      50: '#F2F2F7', 100: '#E5E5EA', 200: '#D1D1D6',
      300: '#C7C7CC', 400: '#AEAEB2', 500: '#8E8E93',
      600: '#636366', 700: '#48484A', 800: '#3A3A3C', 900: '#1C1C1E'
    }
  },
  payback: {
    red: '#E30613',
    dark: '#1C1C1E'
  }
}
```

### Komponenten-Klassen
- `.apple-card` - Glassmorphism Cards
- `.apple-button-primary` - Haupt-Buttons
- `.apple-button-secondary` - Sekundäre Buttons
- `.apple-input` - Formular Inputs

### Animationen
- `animate-fade-in` - Fade In
- `animate-slide-up` - Slide von unten
- `animate-scale-in` - Scale Animation

---

## 📊 Datenmodelle

### Coupon Interface
```typescript
interface Coupon {
  id: string;                    // UUID
  title: string;                 // Name
  description?: string;          // Beschreibung
  barcode: string;               // Barcode-Wert
  barcodeType: 'CODE128' | 'QR' | 'EAN13';
  type: 'payback' | 'dm' | 'rossmann' | 'other';
  validFrom: string;             // YYYY-MM-DD
  validUntil: string;            // YYYY-MM-DD
  used: boolean;                 // Eingelöst?
  usedAt?: string;               // Wann eingelöst
  usedAmount?: number;           // Wie viel gespart
  createdAt: string;             // ISO Timestamp
  value?: number;                // Coupon-Wert in €
  isFavorite?: boolean;          // Angepinnt?
  category?: string;             // Kategorie
  notes?: string;                // Notizen
}
```

### FilterOptions
```typescript
interface FilterOptions {
  search: string;                // Suchbegriff
  type: CouponType | 'all';      // Typ Filter
  status: 'all' | 'active' | 'expired' | 'used';
  sortBy: 'date' | 'expiry' | 'name';
}
```

---

## 🔌 API Endpunkte (Telegram Bot)

Base URL: `http://localhost:3001` (oder deployte URL)

| Endpoint | Methode | Auth | Beschreibung |
|----------|---------|------|--------------|
| `/health` | GET | - | Health Check |
| `/api/coupons` | GET | X-API-Key | Alle Coupons |
| `/api/coupons/latest` | GET | X-API-Key | Neueste Coupons |
| `/api/coupons/type/:type` | GET | X-API-Key | Nach Typ filtern |
| `/api/stats` | GET | X-API-Key | Statistiken |

### Response Format
```json
{
  "success": true,
  "count": 5,
  "coupons": [...]
}
```

---

## 🔧 Umgebungsvariablen

### Web App (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Telegram Bot (.env)
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
API_KEY=your_secure_api_key
WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_URL=https://your-app.vercel.app/api/webhook
PORT=3001
```

---

## 🎯 Wichtige Funktionen

### applyFilters()
Datei: `components/CouponFilter.tsx`
```typescript
export function applyFilters(coupons: Coupon[], filters: FilterOptions): Coupon[]
```
Filtert und sortiert Coupons basierend auf Filter-Kriterien.

### checkExpiringCoupons()
Datei: `lib/notifications.ts`
```typescript
export function checkExpiringCoupons(coupons: Coupon[]): void
```
Prüft ablaufende Coupons und sendet Push-Benachrichtigungen.

### parseCoupon() (Bot)
Datei: `telegram-bot/bot.js`
Erkennt automatisch Coupons in Nachrichten mittels Regex Patterns.

---

## 🚀 Deployment

### Vercel (Web App)
```bash
# Einmalig
vercel --prod

# Danach automatisch bei jedem Push zu main
```

### Telegram Bot
Optionen:
1. **Railway.app** - Einfach, kostenloser Tier
2. **Render.com** - Web Service
3. **VPS** - Eigenständiger Server
4. **Local** - `npm start` für Development

---

## 📝 Roadmap / TODOs

### Geplant
- [ ] Store-Locator (DM/Rossmann finden)
- [ ] Mehrere Coupon-Ordner/Kategorien
- [ ] Cloud-Sync verbessern (Real-time)
- [ ] Widget für iOS/Android Homescreen
- [ ] OCR für Coupon-Bilder
- [ ] Automatische Gültigkeitsprüfung via API

### Ideen
- [ ] Coupon-Preisvergleich
- [ ] Best-Price Alert
- [ ] Social Features (Freunde folgen)
- [ ] Cashback-Tracking
- [ ] Mehrere Benutzer-Profile

---

## 🐛 Bekannte Issues

1. **node_modules im Repo** - Telegram-Bot node_modules sollten in .gitignore
2. **Vercel Build Cache** - Manchmal wird alte Version deployt → "Redeploy without cache"
3. **Wake Lock API** - Nicht alle Browser unterstützen Screen Wake Lock

---

## 💡 Tipps für Claude Code

### Wenn du Features hinzufügst:
1. **Typen zuerst** - Erweitere `types/coupon.ts`
2. **Komponente erstellen** - Neue .tsx Datei in `components/`
3. **In page.tsx integrieren** - Import + State + JSX
4. **Testen** - Local: `npm run dev`
5. **Commit** - `git add -A && git commit -m "..."`

### Wenn du den Bot erweiterst:
1. **Pattern hinzufügen** - In `bot.js` COUPON_PATTERNS erweitern
2. **Befehl erstellen** - `bot.command('name', handler)`
3. **API Endpoint** - In `api.js` neue Route
4. **Testen** - Lokaler Bot mit @BotFather Test-Token

### Nützliche Commands:
```bash
# Dev Server
npm run dev

# Build testen
npm run build

# Lint
npm run lint

# Bot starten
cd telegram-bot && npm start

# API starten  
cd telegram-bot && npm run api
```

---

## 🔗 Wichtige Links

- **Repo:** https://github.com/Zyrial96/payback-coupon-manager
- **Telegram Gruppe:** https://t.me/+VAzr4yRlTOhjOTUy
- **BotFather:** https://t.me/BotFather
- **Supabase:** https://supabase.com

---

*Letzte Aktualisierung: 2026-02-19*
*Version: 2.0.0 mit Telegram Bot Integration*