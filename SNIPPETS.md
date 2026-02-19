# Code Snippets für Claude Code

Nützliche Code-Beispiele für häufige Entwicklungsaufgaben.

## 1. Neue Coupon-Aktion hinzufügen

### Schritt 1: Type erweitern (types/coupon.ts)
```typescript
export interface Coupon {
  // ... bestehende Felder
  newField?: string;  // Neues Feld hinzufügen
}
```

### Schritt 2: Handler in page.tsx
```typescript
const handleNewAction = (id: string, value: any) => {
  setCoupons(coupons.map(c => 
    c.id === id ? { ...c, newField: value } : c
  ));
};
```

### Schritt 3: In CouponCard integrieren
```typescript
// In CouponCard.tsx Props hinzufügen
interface CouponCardProps {
  // ... bestehende Props
  onNewAction?: (id: string, value: any) => void;
}

// JSX
<button onClick={() => onNewAction?.(coupon.id, value)}>
  Aktion
</button>
```

### Schritt 4: In page.tsx verbinden
```typescript
<CouponCard 
  coupon={coupon}
  onNewAction={handleNewAction}
/>
```

---

## 2. Neues Filter-Kriterium

### In CouponFilter.tsx
```typescript
interface FilterOptions {
  // ... bestehende
  newCriteria: string;
}

// In applyFilters Funktion
if (filters.newCriteria !== 'all') {
  result = result.filter(c => c.someField === filters.newCriteria);
}
```

### UI hinzufügen
```typescript
<select 
  value={filters.newCriteria}
  onChange={(e) => onFilterChange({ 
    ...filters, 
    newCriteria: e.target.value 
  })}
>
  <option value="all">Alle</option>
  <option value="option1">Option 1</option>
</select>
```

---

## 3. Neues Modal erstellen

### Neue Datei: components/MyModal.tsx
```typescript
'use client';

import { X } from 'lucide-react';

interface MyModalProps {
  onClose: () => void;
  onConfirm: (data: any) => void;
}

export function MyModal({ onClose, onConfirm }: MyModalProps) {
  const [value, setValue] = useState('');
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Modal Titel</h2>
          <button onClick={onClose}><X /></button>
        </div>
        
        {/* Content */}
        <input 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="apple-input w-full"
        />
        
        {/* Actions */}
        <button 
          onClick={() => { onConfirm(value); onClose(); }}
          className="apple-button-primary w-full mt-4"
        >
          Bestätigen
        </button>
      </div>
    </div>
  );
}
```

### In page.tsx verwenden
```typescript
const [showMyModal, setShowMyModal] = useState(false);

// ...

{showMyModal && (
  <MyModal 
    onClose={() => setShowMyModal(false)}
    onConfirm={(data) => console.log(data)}
  />
)}
```

---

## 4. LocalStorage mit Sync

```typescript
// Speichern mit Event für Cross-Tab Sync
const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
  // Custom Event für andere Tabs
  window.dispatchEvent(new StorageEvent('storage', { key }));
};

// Lesen
const loadFromStorage = (key: string) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : null;
};

// Sync zwischen Tabs
useEffect(() => {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'payback-coupons') {
      const saved = localStorage.getItem('payback-coupons');
      if (saved) setCoupons(JSON.parse(saved));
    }
  };
  
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}, []);
```

---

## 5. API Fetch mit Error Handling

```typescript
const fetchCoupons = async () => {
  try {
    const response = await fetch('/api/coupons', {
      headers: {
        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data.coupons;
    
  } catch (error) {
    console.error('Fetch error:', error);
    // Zeige Error Toast/Notification
    return [];
  }
};
```

---

## 6. Debounced Search

```typescript
import { useEffect, useState } from 'react';

const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
  }, 300); // 300ms debounce
  
  return () => clearTimeout(timer);
}, [searchTerm]);

// debouncedSearch für Filter verwenden
const filteredCoupons = coupons.filter(c => 
  c.title.toLowerCase().includes(debouncedSearch.toLowerCase())
);
```

---

## 7. Dark Mode Toggle

```typescript
const [darkMode, setDarkMode] = useState(false);

useEffect(() => {
  // Check System Preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('dark-mode') === 'true';
  setDarkMode(saved || prefersDark);
}, []);

const toggleDarkMode = () => {
  const newMode = !darkMode;
  setDarkMode(newMode);
  localStorage.setItem('dark-mode', String(newMode));
  
  if (newMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// In Tailwind Config
tailwind.config.js:
module.exports = {
  darkMode: 'class',
  // ... rest
}
```

---

## 8. Pull-to-Refresh (Mobile)

```typescript
import { useState, useRef } from 'react';

const [isRefreshing, setIsRefreshing] = useState(false);
const touchStartY = useRef(0);

const handleTouchStart = (e: TouchEvent) => {
  touchStartY.current = e.touches[0].clientY;
};

const handleTouchMove = (e: TouchEvent) => {
  const touchY = e.touches[0].clientY;
  const diff = touchY - touchStartY.current;
  
  // Wenn am oberen Rand und nach unten gezogen
  if (window.scrollY === 0 && diff > 100 && !isRefreshing) {
    setIsRefreshing(true);
    // Refresh Logik
    await refreshData();
    setIsRefreshing(false);
  }
};

// JSX
<div 
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
>
  {isRefreshing && <div className="text-center py-4">Aktualisiere...</div>}
  {/* Content */}
</div>
```

---

## 9. QR-Code Scanner Fehlerbehandlung

```typescript
const startScanner = async () => {
  try {
    const devices = await Html5Qrcode.getCameras();
    if (devices.length === 0) {
      alert('Keine Kamera gefunden');
      return;
    }
    
    await scanner.start(
      devices[0].id,
      { fps: 10 },
      onSuccess,
      onError
    );
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      alert('Kamera-Zugriff verweigert. Bitte Berechtigungen in den Einstellungen aktivieren.');
    } else {
      alert('Fehler: ' + err.message);
    }
  }
};
```

---

## 10. Export mit File Download

```typescript
const exportCoupons = () => {
  const data = JSON.stringify(coupons, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `coupons-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
```

---

## 11. Responsive Grid

```typescript
// Tailwind Grid - responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {coupons.map(coupon => (
    <CouponCard key={coupon.id} coupon={coupon} />
  ))}
</div>

// Oder mit CSS Grid Template Areas
<div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
  <Sidebar />
  <MainContent />
</div>
```

---

## 12. Virtual Scroll (für lange Listen)

```typescript
import { useRef, useEffect, useState } from 'react';

const VirtualList = ({ items, itemHeight }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const scrollTop = containerRef.current.scrollTop;
      const containerHeight = containerRef.current.clientHeight;
      
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(
        start + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
      );
      
      setVisibleRange({ start, end });
    };
    
    containerRef.current?.addEventListener('scroll', handleScroll);
    return () => containerRef.current?.removeEventListener('scroll', handleScroll);
  }, []);
  
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const offsetY = visibleRange.start * itemHeight;
  
  return (
    <div 
      ref={containerRef}
      className="h-96 overflow-auto"
      style={{ position: 'relative' }}
    >
      <div style={{ height: items.length * itemHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(item => (
            <div key={item.id} style={{ height: itemHeight }}>
              {/* Item Content */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 13. Test-Daten generieren

```typescript
const generateTestCoupons = (count: number): Coupon[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `test-${i}`,
    title: `Test Coupon ${i + 1}`,
    description: 'Lorem ipsum dolor sit amet',
    barcode: String(Math.floor(Math.random() * 9000000000) + 1000000000),
    barcodeType: 'CODE128',
    type: ['payback', 'dm', 'rossmann', 'other'][Math.floor(Math.random() * 4)] as CouponType,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    used: Math.random() > 0.7,
    createdAt: new Date().toISOString(),
    value: Math.floor(Math.random() * 20) + 5,
  }));
};

// Verwendung
useEffect(() => {
  const testData = generateTestCoupons(20);
  setCoupons(testData);
}, []);
```