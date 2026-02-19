'use client';

import { useEffect, useRef } from 'react';
import { X, Smartphone, ScanLine, Copy, Check } from 'lucide-react';
import { Coupon } from '@/types/coupon';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { useState } from 'react';

interface BarcodeDisplayProps {
  coupon: Coupon;
  onClose: () => void;
}

export function BarcodeDisplay({ coupon, onClose }: BarcodeDisplayProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (coupon.barcodeType === 'QR' && qrRef.current) {
      QRCode.toCanvas(qrRef.current, coupon.barcode, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    } else if (barcodeRef.current && coupon.barcodeType !== 'QR') {
      JsBarcode(barcodeRef.current, coupon.barcode, {
        format: coupon.barcodeType,
        lineColor: '#1C1C1E',
        width: 2.5,
        height: 120,
        displayValue: true,
        fontSize: 20,
        font: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        margin: 10,
      });
    }
  }, [coupon]);

  const copyBarcode = () => {
    navigator.clipboard.writeText(coupon.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeColor = () => {
    const colors: Record<string, string> = {
      payback: 'from-red-500 to-red-600',
      dm: 'from-yellow-400 to-yellow-500',
      rossmann: 'from-blue-500 to-blue-600',
      other: 'from-gray-500 to-gray-600',
    };
    return colors[coupon.type] || colors.other;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl modal-content overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getTypeColor()} px-6 py-5`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{coupon.title}</h2>
              <p className="text-white/80 text-sm mt-0.5">Zeige diesen Code an der Kasse</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Barcode Display */}
          <div className="relative bg-white rounded-2xl shadow-inner border border-apple-gray-200 p-6 mb-5">
            {/* Scan Line Animation */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="scan-line" />
            </div>
            
            <div className="flex justify-center">
              {coupon.barcodeType === 'QR' ? (
                <canvas ref={qrRef} className="rounded-lg" />
              ) : (
                <svg ref={barcodeRef} className="w-full max-w-sm" />
              )}
            </div>
          </div>

          {/* Barcode Number */}
          <div className="bg-apple-gray-50 rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-apple-gray-500 font-semibold uppercase tracking-wider mb-1">Barcode-Nummer</p>
                <p className="text-xl font-mono font-bold text-apple-gray-900 tracking-wider">
                  {coupon.barcode}
                </p>
              </div>
              <button
                onClick={copyBarcode}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  copied 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-white text-apple-gray-600 hover:bg-apple-gray-100 shadow-sm'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Description */}
          {coupon.description && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
              <p className="text-blue-800 text-sm font-medium">{coupon.description}</p>
            </div>
          )}

          {/* Tips */}
          <div className="flex items-start gap-3 bg-yellow-50 rounded-2xl p-4">
            <Smartphone className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-semibold">Tipp für besseren Scan</p>
              <p className="text-sm text-yellow-700 mt-0.5">
                Stelle die Bildschirmhelligkeit auf maximum und halte den Code ca. 10-15cm vom Scanner entfernt.
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 bg-apple-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-apple-gray-800 active:scale-[0.98] transition-all duration-200"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}