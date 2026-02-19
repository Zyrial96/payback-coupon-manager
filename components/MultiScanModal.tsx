'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Camera, Layers, Check, Trash2, ArrowRight, Barcode } from 'lucide-react';
import { Coupon } from '@/types/coupon';
import { Html5Qrcode } from 'html5-qrcode';
import JsBarcode from 'jsbarcode';

interface MultiScanModalProps {
  existingCoupons: Coupon[];
  onAddCoupons: (coupons: Omit<Coupon, 'id' | 'createdAt'>[]) => void;
  onClose: () => void;
}

export function MultiScanModal({ existingCoupons, onAddCoupons, onClose }: MultiScanModalProps) {
  const [mode, setMode] = useState<'select' | 'scan' | 'combine'>('select');
  const [selectedCoupons, setSelectedCoupons] = useState<Coupon[]>([]);
  const [scannedBarcodes, setScannedBarcodes] = useState<Array<{ barcode: string; type: string }>>([]);
  const [combinedName, setCombinedName] = useState('');
  const combinedRef = useRef<SVGSVGElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Filter for coupons that can be combined (same type, not expired)
  const availableCoupons = existingCoupons.filter(
    c => !c.used && new Date(c.validUntil) >= new Date()
  );

  const toggleCoupon = (coupon: Coupon) => {
    if (selectedCoupons.find(c => c.id === coupon.id)) {
      setSelectedCoupons(selectedCoupons.filter(c => c.id !== coupon.id));
    } else {
      setSelectedCoupons([...selectedCoupons, coupon]);
    }
  };

  const generateCombinedBarcode = () => {
    // Combine all barcodes with a separator
    const combined = selectedCoupons.map(c => c.barcode).join(';');
    return combined;
  };

  useEffect(() => {
    if (mode === 'combine' && combinedRef.current && selectedCoupons.length > 0) {
      const combined = generateCombinedBarcode();
      JsBarcode(combinedRef.current, combined, {
        format: 'CODE128',
        lineColor: '#1C1C1E',
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 14,
        margin: 10,
      });
    }
  }, [mode, selectedCoupons]);

  const handleScanMode = async () => {
    setMode('scan');
    setIsScanning(true);
    
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        scannerRef.current = new Html5Qrcode('multi-scan-reader');
        
        await scannerRef.current.start(
          devices[0].id,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            // Add scanned barcode
            if (!scannedBarcodes.find(s => s.barcode === decodedText)) {
              setScannedBarcodes([...scannedBarcodes, { barcode: decodedText, type: 'CODE128' }]);
            }
          },
          () => {}
        );
      }
    } catch (err) {
      console.error('Scan error:', err);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
    }
    setIsScanning(false);
  };

  const handleSaveCombined = () => {
    const newCoupons: Omit<Coupon, 'id' | 'createdAt'>[] = selectedCoupons.map(c => ({
      ...c,
      title: combinedName || `Kombi: ${selectedCoupons.map(s => s.title).join(', ')}`,
      description: `Kombinierter Coupon: ${selectedCoupons.length} Coupons`,
      barcode: generateCombinedBarcode(),
      notes: `Enthält: ${selectedCoupons.map(s => s.title).join(', ')}`,
    }));
    
    onAddCoupons(newCoupons);
    onClose();
  };

  const handleSaveScanned = () => {
    const newCoupons: Omit<Coupon, 'id' | 'createdAt'>[] = scannedBarcodes.map((s, idx) => ({
      title: `Gescannter Coupon ${idx + 1}`,
      description: '',
      barcode: s.barcode,
      barcodeType: 'CODE128',
      type: 'other',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
      used: false,
    }));
    
    onAddCoupons(newCoupons);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Multi-Coupon Modus</h2>
                <p className="text-white/80 text-xs">
                  {mode === 'select' && 'Wähle Coupons zum Kombinieren'}
                  {mode === 'scan' && 'Scanne mehrere Barcodes'}
                  {mode === 'combine' && 'Kombiniere deine Coupons'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'select' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('select')}
                  className="apple-card p-4 text-center border-2 border-purple-500"
                >
                  <Layers className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="font-semibold text-sm">Bestehende kombinieren</p>
                </button>
                <button
                  onClick={handleScanMode}
                  className="apple-card p-4 text-center hover:border-blue-500 border-2 border-transparent"
                >
                  <Camera className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="font-semibold text-sm">Neue scannen</p>
                </button>
              </div>

              {availableCoupons.length > 0 ? (
                <>
                  <p className="text-sm text-apple-gray-500 font-medium">
                    Wähle Coupons zum Kombinieren ({selectedCoupons.length} ausgewählt)
                  </p>
                  <div className="space-y-2">
                    {availableCoupons.map(coupon => (
                      <button
                        key={coupon.id}
                        onClick={() => toggleCoupon(coupon)}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                          selectedCoupons.find(c => c.id === coupon.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-apple-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedCoupons.find(c => c.id === coupon.id)
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-apple-gray-300'
                          }`}>
                            {selectedCoupons.find(c => c.id === coupon.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{coupon.title}</p>
                            <p className="text-xs text-apple-gray-500">{coupon.type}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedCoupons.length >= 2 && (
                    <button
                      onClick={() => setMode('combine')}
                      className="w-full apple-button-primary py-3 flex items-center justify-center gap-2"
                    >
                      <Layers className="w-5 h-5" />
                      {selectedCoupons.length} Coupons kombinieren
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-apple-gray-500">Keine aktiven Coupons vorhanden</p>
                  <button
                    onClick={handleScanMode}
                    className="mt-3 text-purple-600 font-semibold"
                  >
                    Neue scannen →
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === 'scan' && (
            <div className="space-y-4">
              <div id="multi-scan-reader" className="w-full aspect-square bg-black rounded-2xl overflow-hidden relative">
                {/* Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-white/30 rounded-2xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-purple-500 rounded-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-lg" />
                  </div>
                  <div className="scan-line" />
                </div>
              </div>

              {scannedBarcodes.length > 0 && (
                <div className="bg-apple-gray-50 rounded-2xl p-4">
                  <p className="text-sm font-semibold mb-2">Gescannte Barcodes ({scannedBarcodes.length})</p>
                  <div className="space-y-2">
                    {scannedBarcodes.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white rounded-xl p-3">
                        <code className="text-sm font-mono">{s.barcode}</code>
                        <button
                          onClick={() => setScannedBarcodes(scannedBarcodes.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={stopScanning}
                  className="flex-1 apple-button-secondary"
                >
                  Stoppen
                </button>
                {scannedBarcodes.length > 0 && (
                  <button
                    onClick={handleSaveScanned}
                    className="flex-1 apple-button-primary"
                  >
                    {scannedBarcodes.length} Coupon(s) speichern
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === 'combine' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-apple-gray-700 mb-2">
                  Name des kombinierten Coupons
                </label>
                <input
                  type="text"
                  value={combinedName}
                  onChange={(e) => setCombinedName(e.target.value)}
                  placeholder="z.B. DM Einkauf Dezember"
                  className="apple-input w-full"
                />
              </div>

              <div className="bg-purple-50 rounded-2xl p-4">
                <p className="text-sm font-semibold text-purple-900 mb-2">Enthaltene Coupons ({selectedCoupons.length})</p>
                <ul className="space-y-1">
                  {selectedCoupons.map(c => (
                    <li key={c.id} className="text-sm text-purple-700">• {c.title}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-apple-gray-200">
                <p className="text-sm font-semibold mb-3">Kombinierter Barcode</p>
                <svg ref={combinedRef} className="w-full" />
                <p className="text-xs text-apple-gray-500 mt-2 text-center">
                  Der Kassierer scannt diesen Code und alle Coupons werden aktiviert
                </p>
              </div>

              <button
                onClick={handleSaveCombined}
                className="w-full apple-button-primary py-4"
              >
                Kombinierten Coupon speichern
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}