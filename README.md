# Payback Coupon Manager 📱

Ein moderner, Apple-Design-inspirierter Coupon Manager für Payback, DM, Rossmann und mehr. Verwalte alle deine Coupons an einem Ort mit Barcode-Scan, Push-Benachrichtigungen und elegantem Design.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

### 🎨 Modernes Design
- Apple-Design-Sprache mit Glassmorphism
- Flüssige Animationen und Übergänge
- Mobile-first Responsive Design
- Dark Mode Ready

### 📱 Kernfunktionen
- **📷 Kamera-Scan**: Scanne Barcodes direkt mit der Kamera
- **🔔 Push-Benachrichtigungen**: Erinnerungen vor Ablauf (3 Tage & 1 Tag)
- **🔍 Filter & Suche**: Suche nach Typ, Status und Name
- **📊 Statistiken**: Übersicht über aktive/abgelaufene Coupons
- **📤 Export/Import**: Backup als JSON oder CSV

### 🛡️ Datenschutz
- Lokale Datenspeicherung (localStorage)
- Optional: Supabase Cloud-Sync
- Keine Datenweitergabe an Dritte

## 🚀 Schnellstart

### 1. Supabase einrichten (optional, für Cloud-Sync)

1. Erstelle ein kostenloses Konto auf [supabase.com](https://supabase.com)
2. Neues Projekt erstellen
3. Führe das SQL-Schema aus `supabase-schema.sql` aus
4. Project URL und Anon Key kopieren

### 2. Lokale Entwicklung

```bash
# Repository klonen
git clone https://github.com/Zyrial96/payback-coupon-manager.git
cd payback-coupon-manager

# Dependencies installieren
npm install

# Environment Variablen (optional, nur für Supabase)
cp .env.example .env.local
# Füge deine Supabase-Daten ein

# Dev Server starten
npm run dev
```

### 3. Auf Vercel deployen

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FZyrial96%2Fpayback-coupon-manager)

## 📖 Nutzung

### Coupon hinzufügen
1. Klicke auf "Coupon hinzufügen" oder das Kamera-Icon
2. Wähle den Typ (Payback, DM, Rossmann, etc.)
3. Gib Titel, Barcode und Ablaufdatum ein
4. Speichern

### Barcode scannen
1. Klicke auf das Kamera-Icon
2. Halte den Barcode vor die Kamera
3. Der Code wird automatisch erkannt

### Filter verwenden
- **Suche**: Schnellsuche nach Name oder Barcode
- **Typ**: Filtere nach Payback, DM, Rossmann, etc.
- **Status**: Zeige nur aktive, abgelaufene oder genutzte Coupons
- **Sortierung**: Nach Datum, Ablauf oder Name sortieren

### Backup erstellen
1. Öffne die Einstellungen (Zahnrad-Icon)
2. Wähle "Export"
3. Wähle JSON (vollständige Daten) oder CSV (Excel)
4. Datei wird heruntergeladen

### Benachrichtigungen aktivieren
1. Öffne die Einstellungen
2. Wähle "Benachrichtigungen"
3. Klicke "Benachrichtigungen aktivieren"
4. Erlaube Benachrichtigungen im Browser

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Sprache**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Datenbank**: [Supabase](https://supabase.com/) (optional)
- **Barcode**: [html5-qrcode](https://github.com/mebjas/html5-qrcode), [jsbarcode](https://github.com/lindell/JsBarcode)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🗺️ Roadmap

- [x] Kamera-Scan zum Hinzufügen von Coupons
- [x] Push-Benachrichtigungen vor Ablauf
- [x] Coupon-Kategorien und Filter
- [x] Export/Import Funktion
- [ ] Telegram-Bot für automatisches Coupon-Sammeln
- [ ] Dark Mode
- [ ] Mehrere Coupon-Gruppen/Ordner
- [ ] Statistiken und Charts

## 📝 Lizenz

MIT License - Persönlicher Gebrauch.

**Wichtig:** Diese App ist für persönlichen Gebrauch gedacht. Bitte beachte die AGB der jeweiligen Coupon-Anbieter.

---

Entwickelt mit ❤️ für effizientes Coupon-Management.