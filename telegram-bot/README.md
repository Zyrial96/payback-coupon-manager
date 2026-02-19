# Telegram Coupon Bot 🤖

Ein Telegram-Bot, der automatisch Coupons aus Gruppen erkennt und speichert.

## ✨ Features

- **Automatische Erkennung** von Coupons in Nachrichten
- **Unterstützte Typen**: Payback, DM, Rossmann, und generische Barcodes
- **API** für die Web-App Integration
- **Doppelte Erkennung** verhindert Duplikate
- **Statistiken** über erkannte Coupons

## 🚀 Setup

### 1. Bot bei Telegram erstellen

1. Öffne [@BotFather](https://t.me/BotFather)
2. Sende `/newbot`
3. Gib dem Bot einen Namen (z.B. "Payback Coupon Collector")
4. Speichere das Token

### 2. Bot zu Gruppe hinzufügen

1. Füge den Bot zu deiner Coupon-Gruppe hinzu
2. Mache den Bot zum Admin (optional, aber empfohlen)
3. Der Bot beginnt sofort mit dem Scannen

### 3. Installation

```bash
cd telegram-bot
npm install

# Environment Variablen
cp .env.example .env
# Bearbeite .env und füge dein Token ein
```

### 4. Starten

```bash
# Nur Bot
npm start

# Bot + API
npm run dev
```

## 📋 Befehle

| Befehl | Beschreibung |
|--------|-------------|
| `/start` | Startet den Bot |
| `/help` | Zeigt Hilfe |
| `/status` | Bot-Status |
| `/latest` | Neueste Coupons |
| `/stats` | Statistiken |

## 🔍 Automatische Erkennung

Der Bot erkennt:
- **Payback**: "PB: 1234567890" oder "Payback 1234567890"
- **DM**: "DM: 1234567890" oder "DM Coupon 1234567890"
- **Rossmann**: "RM: 1234567890" oder "Rossmann 1234567890"
- **Generisch**: Alle 8-13 stelligen Zahlen

## 🔌 API Endpunkte

| Endpoint | Beschreibung |
|----------|-------------|
| `GET /health` | Health Check |
| `GET /api/coupons` | Alle Coupons |
| `GET /api/coupons/latest?limit=10` | Neueste Coupons |
| `GET /api/coupons/type/:type` | Coupons nach Typ |
| `GET /api/stats` | Statistiken |

### API Beispiel

```bash
# Alle Coupons abrufen
curl -H "X-API-Key: your_api_key" \
  http://localhost:3001/api/coupons

# Neueste 5 Coupons
curl -H "X-API-Key: your_api_key" \
  http://localhost:3001/api/coupons/latest?limit=5
```

## 🔗 Integration mit Web-App

Die gespeicherten Coupons werden in `coupons.json` gespeichert.
Die Web-App kann über die API darauf zugreifen.

### Web-App Integration

1. API Server deployen (z.B. auf Railway, Render, oder VPS)
2. API URL und Key in die Web-App eintragen
3. Coupons werden automatisch synchronisiert

## 📝 Environment Variablen

| Variable | Beschreibung |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Bot Token von @BotFather |
| `API_KEY` | Sicherer API Key |
| `WEBHOOK_SECRET` | Secret für Webhooks |
| `WEBHOOK_URL` | Optional: Webhook URL |
| `PORT` | API Port (default: 3001) |

## 🛠️ Technologien

- **Telegraf**: Telegram Bot Framework
- **Express**: API Server
- **Node-Cron**: Scheduled Tasks
- **Axios**: HTTP Requests

## 📁 Dateistruktur

```
telegram-bot/
├── bot.js              # Haupt-Bot-Logik
├── api.js              # API Server
├── package.json        # Dependencies
├── .env.example        # Env Template
├── coupons.json        # Gespeicherte Coupons
├── processed_messages.json  # Verarbeitete Nachrichten
└── README.md          # Dokumentation
```

## ⚠️ Wichtige Hinweise

- Der Bot speichert Coupons nur lokal
- Keine Weitergabe an Dritte
- Für persönlichen Gebrauch gedacht
- Beachte die AGB der Coupon-Anbieter

## 🔮 Zukünftige Features

- [ ] Real-time Sync mit Web-App via WebSockets
- [ ] Push-Benachrichtigungen bei neuen Coupons
- [ ] Bilderkennung (QR-Codes aus Bildern)
- [ ] Automatische Gültigkeitsprüfung
- [ ] Coupon-Validierung

---

Entwickelt für automatisiertes Coupon-Management.