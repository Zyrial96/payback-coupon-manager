# Payback Coupon Manager 📱

Ein moderner, Apple-Design-inspirierter Coupon Manager für Payback, DM, Rossmann und mehr. Verwalte alle deine Coupons an einem Ort mit Multi-Scan, Statistiken, Dark Mode und elegantem Design.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)

## ✨ Alle Features

### 🎨 Modernes Design
- Apple-Design-Sprache mit Glassmorphism
- **Dark Mode** 🌙 - Für angenehmes Nutzen bei Nacht
- Flüssige Animationen und Übergänge
- Mobile-first Responsive Design

### 📱 Kernfunktionen

#### 🔥 **Multi-Coupon Modus** (NEU)
- Kombiniere mehrere Coupons zu einem Barcode
- Scanne mehrere Barcodes hintereinander
- Spare Zeit an der Kasse

#### 📊 **Statistiken** (NEU)
- Gespartes Geld berechnen
- Spar-Trend über 6 Monate
- Coupon-Verteilung nach Typen
- Durchschnittliche Ersparnis

#### 📷 **Kamera-Scan**
- Scanne Barcodes direkt mit der Kamera
- Unterstützt CODE128, QR und EAN13
- Automatische Erkennung

#### 🔔 **Push-Benachrichtigungen**
- Erinnerungen 3 Tage vor Ablauf
- Erinnerungen 1 Tag vor Ablauf
- Service Worker für Background Notifications

#### ❤️ **Favoriten**
- Wichtige Coupons anpinnen
- Schneller Zugriff auf Favoriten

#### 📤 **Teilen**
- Teile Coupons via Link
- QR-Code zum Scannen
- Einfacher Import für Empfänger

#### 🎯 **Markieren als Genutzt**
- Speichere eingelöste Coupons
- Tracke wie viel du gespart hast
- Historie behalten

#### 🔍 **Filter & Suche**
- Suche nach Name oder Barcode
- Filtere nach Typ (Payback, DM, Rossmann...)
- Filtere nach Status (Aktiv, Abgelaufen, Genutzt)
- Sortiere nach Datum, Ablauf oder Name

#### 📤 **Export/Import**
- Backup als JSON (vollständige Daten)
- Export als CSV (für Excel)
- Import von Backups

#### 📊 **Statistiken**
- Übersicht über aktive/abgelaufene Coupons
- Gesamtersparnis berechnen
- Monatliche Trends
- Durchschnittliche Ersparnis

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
4. Optional: Füge Wert (€) für Statistiken hinzu
5. Speichern

### Multi-Coupon Modus 🔥
1. Klicke auf das Layers-Icon
2. Wähle "Bestehende kombinieren" oder "Neue scannen"
3. Wähle mehrere Coupons aus oder scanne sie
4. Gib einen Namen für die Kombination ein
5. Der kombinierte Barcode wird erstellt

### Barcode anzeigen
1. Klicke auf einen Coupon
2. Klicke "Anzeigen"
3. Zeige den Code an der Kasse vor
4. **Tipp:** Nutze Vollbild-Modus und Helligkeits-Boost für besseren Scan

### Als genutzt markieren
1. Klicke auf die drei Punkte ⋮ eines Coupons
2. Wähle "Als genutzt markieren"
3. Optional: Tracke wie viel du gespart hast
4. Der Coupon wird in die Historie verschoben

### Coupon teilen
1. Klicke auf die drei Punkte ⋮ eines Coupons
2. Wähle "Teilen"
3. Kopiere den Link oder zeige den QR-Code
4. Der Empfänger kann den Coupon mit einem Klick importieren

### Dark Mode aktivieren
1. Klicke auf das Mond-Icon in der Header-Leiste
2. Die App wechselt sofort in den Dark Mode
3. Deine Präferenz wird gespeichert

### Statistiken ansehen
1. Klicke auf das Diagramm-Icon in der Header-Leiste
2. Siehe deine Spar-Statistiken
3. Analysiere Trends und Verteilungen

### Filter verwenden
- **Suche:** Schnellsuche nach Name oder Barcode
- **Typ:** Filtere nach Payback, DM, Rossmann, etc.
- **Status:** Zeige nur aktive, abgelaufene oder genutzte Coupons
- **Sortierung:** Nach Datum, Ablauf oder Name sortieren

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

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Sprache**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Datenbank**: [Supabase](https://supabase.com/) (optional)
- **Barcode**: [html5-qrcode](https://github.com/mebjas/html5-qrcode), [jsbarcode](https://github.com/lindell/JsBarcode)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🗺️ Roadmap

- [x] Multi-Coupon Modus (Kombiniere mehrere Coupons)
- [x] Kamera-Scan zum Hinzufügen von Coupons
- [x] Push-Benachrichtigungen vor Ablauf
- [x] Coupon-Kategorien und Filter
- [x] Export/Import Funktion
- [x] Dark Mode
- [x] Statistiken und Charts
- [x] Coupon teilen
- [x] Favoriten / Anpinnen
- [x] Als genutzt markieren
- [ ] Telegram-Bot für automatisches Coupon-Sammeln
- [ ] Mehrere Coupon-Gruppen/Ordner
- [ ] Store-Locator (DM/Rossmann finden)

## 📝 Lizenz

MIT License - Persönlicher Gebrauch.

**Wichtig:** Diese App ist für persönlichen Gebrauch gedacht. Bitte beachte die AGB der jeweiligen Coupon-Anbieter.

---

Entwickelt mit ❤️ für effizientes Coupon-Management.