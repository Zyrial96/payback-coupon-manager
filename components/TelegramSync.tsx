'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Download, Check, AlertCircle, Bot } from 'lucide-react';
import { Coupon } from '@/types/coupon';

interface TelegramSyncProps {
  onImport: (coupons: Coupon[]) => void;
  apiUrl?: string;
  apiKey?: string;
}

export function TelegramSync({ onImport, apiUrl, apiKey }: TelegramSyncProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [couponsCount, setCouponsCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  // Load last sync from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('telegram-sync-last');
    if (saved) {
      setLastSync(new Date(saved));
    }
    
    const savedIds = localStorage.getItem('telegram-sync-ids');
    if (savedIds) {
      setImportedIds(new Set(JSON.parse(savedIds)));
    }
  }, []);

  const fetchFromTelegram = async () => {
    if (!apiUrl || !apiKey) {
      setError('API nicht konfiguriert. Bitte in den Einstellungen hinterlegen.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/coupons/latest?limit=50`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('API Fehler');
      }

      const data = await response.json();
      
      if (data.success) {
        // Filter already imported coupons
        const newCoupons = data.coupons.filter(
          (c: any) => !importedIds.has(c.id)
        );
        
        setCouponsCount(newCoupons.length);
        
        if (newCoupons.length > 0) {
          // Convert to app format
          const convertedCoupons: Coupon[] = newCoupons.map((c: any) => ({
            id: crypto.randomUUID(), // Generate new ID for app
            title: c.title,
            description: c.description,
            barcode: c.barcode,
            barcodeType: c.barcodeType || 'CODE128',
            store: c.store || c.type || 'other',
            discountType: c.discountType || 'percent',
            discountValue: c.discountValue,
            validFrom: c.validFrom,
            validUntil: c.validUntil,
            used: false,
            createdAt: new Date().toISOString(),
            value: c.value,
            notes: `Importiert aus Telegram: ${c.source}`,
          }));

          onImport(convertedCoupons);
          
          // Mark as imported
          const newIds = new Set(importedIds);
          data.coupons.forEach((c: any) => newIds.add(c.id));
          setImportedIds(newIds);
          localStorage.setItem('telegram-sync-ids', JSON.stringify(Array.from(newIds)));
          
          // Save last sync
          const now = new Date();
          setLastSync(now);
          localStorage.setItem('telegram-sync-last', now.toISOString());
        }
      }
    } catch (err) {
      setError('Verbindung zum Telegram-Bot fehlgeschlagen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="apple-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-apple-gray-900">Telegram Sync</h3>
          <p className="text-sm text-apple-gray-500">
            {lastSync 
              ? `Letzter Sync: ${lastSync.toLocaleString('de-DE')}`
              : 'Noch nicht synchronisiert'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {couponsCount > 0 && !isLoading && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          <p className="text-sm text-green-700">
            {couponsCount} neue Coupon(s) importiert!
          </p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={fetchFromTelegram}
          disabled={isLoading}
          className="w-full apple-button-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {isLoading ? 'Synchronisiere...' : 'Aus Telegram importieren'}
        </button>

        <p className="text-xs text-apple-gray-500 text-center">
          Holt die neuesten Coupons aus der Telegram-Gruppe
        </p>
      </div>

      {!apiUrl && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            <strong>Hinweis:</strong> Um diese Funktion zu nutzen, muss der Telegram-Bot 
            eingerichtet und die API-URL in den Einstellungen hinterlegt werden.
          </p>
        </div>
      )}
    </div>
  );
}