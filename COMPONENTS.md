# Component Reference

Detaillierte Dokumentation aller React Komponenten.

## AddCouponModal

**Props:**
```typescript
interface Props {
  onClose: () => void;
  onAdd: (coupon: Omit<Coupon, 'id' | 'createdAt'>) => void;
}
```

**Funktion:**
- Modal zum Erstellen neuer Coupons
- Formularfelder: Titel, Beschreibung, Barcode, Typ, Ablaufdatum
- Barcode-Typ Auswahl: CODE128, QR, EAN13

**Wichtige State-Variablen:**
```typescript
const [title, setTitle] = useState('');
const [barcodeType, setBarcodeType] = useState<'CODE128' | 'QR' | 'EAN13'>('CODE128');
const [type, setType] = useState<CouponType>('payback');
```

---

## BarcodeDisplay

**Props:**
```typescript
interface Props {
  coupon: Coupon;
  onClose: () => void;
}
```

**Funktion:**
- Vollbild Barcode-Anzeige
- Kopieren-Funktion
- Helligkeits-Boost
- Wake Lock (verhindert Bildschirm-Abschaltung)

**Besonderheiten:**
- Nutzt `navigator.wakeLock` API
- QR-Code oder JsBarcode je nach Typ
- Fullscreen Toggle

---

## CameraScanner

**Props:**
```typescript
interface Props {
  onScan: (barcode: string) => void;
  onClose: () => void;
}
```

**Funktion:**
- Kamera-Zugriff via html5-qrcode
- Mehrere Kameras unterstützt
- Live-Scanning mit Erfolgs-Callback

**Wichtig:**
```typescript
// Scanner initialisieren
scannerRef.current = new Html5Qrcode('reader');
await scannerRef.current.start(cameraId, { fps: 10, qrbox: {...} }, onSuccess, onError);

// Cleanup beim Unmount
await scannerRef.current.stop();
```

---

## CouponCard

**Props:**
```typescript
interface Props {
  coupon: Coupon;
  onShowBarcode: () => void;
  onDelete: () => void;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  onMarkUsed?: (amount?: number) => void;
}
```

**Funktion:**
- Zeigt einzelnen Coupon an
- Swipe-Actions (mehr Optionen)
- Tage-bis-Ablauf Anzeige
- Favoriten-Stern
- "Als genutzt markieren" mit Betrag

**UI-Elemente:**
- Icon mit Farbe je nach Typ (Payback=Rot, DM=Gelb, Rossmann=Blau)
- Badge für "Läuft bald ab" (< 7 Tage)
- Dropdown-Menü für Aktionen

---

## CouponFilter

**Props:**
```typescript
interface Props {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

interface FilterOptions {
  search: string;
  type: CouponType | 'all';
  status: 'all' | 'active' | 'expired' | 'used';
  sortBy: 'date' | 'expiry' | 'name';
}
```

**Funktion:**
- Suchfeld (Text)
- Typ-Filter (Payback, DM, Rossmann, Other)
- Status-Filter (Alle, Aktiv, Abgelaufen, Genutzt)
- Sortierung (Datum, Ablauf, Name)

**Helper:**
```typescript
export function applyFilters(coupons: Coupon[], filters: FilterOptions): Coupon[]
```

---

## MultiScanModal

**Props:**
```typescript
interface Props {
  existingCoupons: Coupon[];
  onAddCoupons: (coupons: Omit<Coupon, 'id' | 'createdAt'>[]) => void;
  onClose: () => void;
}
```

**Modi:**
1. **select** - Bestehende Coupons kombinieren
2. **scan** - Neue Barcodes scannen
3. **combine** - Kombinierten Coupon erstellen

**Funktion:**
- Wähle mehrere Coupons → Generiere kombinierten Barcode
- Oder: Scanne mehrere Barcodes hintereinander

---

## SettingsModal

**Tabs:**
1. **Export** - JSON oder CSV
2. **Import** - JSON oder CSV Datei
3. **Notifications** - Push-Benachrichtigungen aktivieren

**Props:**
```typescript
interface Props {
  coupons: Coupon[];
  onImport: (coupons: Coupon[]) => void;
  onClose: () => void;
}
```

---

## ShareModal

**Props:**
```typescript
interface Props {
  coupon: Coupon;
  onClose: () => void;
}
```

**Tabs:**
1. **Link** - Kopierbarer Share-Link
2. **QR Code** - QR-Code zum Scannen

**URL Format:**
```
https://payback-coupon-manager.vercel.app/import?data={encodedJson}
```

---

## Statistics

**Props:**
```typescript
interface Props {
  coupons: Coupon[];
}
```

**Berechnungen:**
- Gesamtersparnis (usedAmount summieren)
- Durchschnittliche Ersparnis pro Coupon
- Monatliche Trends (letzte 6 Monate)
- Coupon-Verteilung nach Typ

**Diagramme:**
- Balkendiagramm für monatliche Ersparnis
- Kreisdiagramm für Typ-Verteilung
- Statistik-Karten

---

## TelegramSync

**Props:**
```typescript
interface Props {
  onImport: (coupons: Coupon[]) => void;
  apiUrl?: string;
  apiKey?: string;
}
```

**Funktion:**
- Holt Coupons von Telegram Bot API
- Zeigt Anzahl neuer Coupons
- Verhindert Duplikate (Tracking via localStorage)

**API Call:**
```typescript
const response = await fetch(`${apiUrl}/api/coupons/latest?limit=50`, {
  headers: { 'X-API-Key': apiKey }
});
```

---

## Verwendung in page.tsx

```typescript
// State Management
const [coupons, setCoupons] = useState<Coupon[]>([]);
const [showAddModal, setShowAddModal] = useState(false);
const [showMultiScan, setShowMultiScan] = useState(false);
const [showStatistics, setShowStatistics] = useState(false);
const [darkMode, setDarkMode] = useState(false);

// Filter State
const [filters, setFilters] = useState<FilterOptions>({
  search: '',
  type: 'all',
  status: 'active',
  sortBy: 'expiry',
});

// Actions
const addCoupon = (couponData) => { ... };
const toggleFavorite = (id) => { ... };
const markAsUsed = (id, amount) => { ... };

// Render
<main>
  <Header />
  <StatsCards />
  <CouponFilter />
  <AddButton />
  <CouponsList>
    {sortedCoupons.map(c => <CouponCard ... />)}
  </CouponsList>
  
  {/* Modals */}
  {showAddModal && <AddCouponModal ... />}
  {showMultiScan && <MultiScanModal ... />}
  {showStatistics && <Statistics ... />}
</main>
```