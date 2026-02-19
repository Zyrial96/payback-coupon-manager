'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Smartphone, ScanLine, Copy, Check, Maximize2, Minimize2, Sun } from 'lucide-react';
import { Coupon } from '@/types/coupon';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

interface BarcodeDisplayProps {
  coupon: Coupon;
  onClose: () => void;
}

export function BarcodeDisplay({ coupon, onClose }: BarcodeDisplayProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [brightness, setBrightness] = useState(100);

  // Prevent screen from sleeping
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake Lock not supported');
      }
    };
    
    requestWakeLock();
    
    // Set max brightness
    if ('screen' in window && 'brightness' in (window.screen as any)) {
      try {
        (window.screen as any).brightness = 1;
      } catch (e) {
        console.log('Cannot set brightness');
      }
    }
    
    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, []);

  useEffect(() => {
    if (coupon.barcodeType === 'QR' && qrRef.current) {
      QRCode.toCanvas(qrRef.current, coupon.barcode, {
        width: isFullscreen ? 350 : 280,
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
        width: isFullscreen ? 3 : 2.5,
        height: isFullscreen ? 150 : 120,
        displayValue: true,
        fontSize: isFullscreen ? 24 : 20,
        font: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        margin: 10,
      });
    }
  }, [coupon, isFullscreen]);

  const copyBarcode = () => {
    navigator.clipboard.writeText(coupon.barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const getTypeColor = () => {
    const colors: Record<string, string> = {
      payback: 'from-red-500 to-red-600',
      dm: 'from-yellow-400 to-yellow-500',
      rossmann: 'from-blue-500 to-blue-600',
      rewe: 'from-red-600 to-red-700',
      penny: 'from-red-500 to-red-600',
      lidl: 'from-yellow-500 to-yellow-600',
      kaufland: 'from-orange-600 to-orange-700',
      mueller: 'from-orange-500 to-orange-600',
      other: 'from-gray-500 to-gray-600',
    };
    return colors[coupon.store] || colors.other;
  };

  const increaseBrightness = () => {
    setBrightness(prev => Math.min(prev + 20, 200));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'w-full h-full max-w-none rounded-none' : 'w-full max-w-md'
      }`}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${getTypeColor()} px-6 py-4 flex items-center justify-between ${
          isFullscreen ? 'absolute top-0 left-0 right-0 z-10' : ''
        }`}>
          <div>
            <h2 className="text-xl font-bold text-white">{coupon.title}</h2>
            <p className="text-white/80 text-sm">Zeige diesen Code an der Kasse</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={increaseBrightness}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"
              title="Helligkeit erhöhen"
            >
              <Sun className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"
              title={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className={`p-6 flex flex-col items-center justify-center ${isFullscreen ? 'h-full pt-20' : ''}`}>
          {/* Barcode Display */}
          <div 
            className="relative bg-white rounded-2xl shadow-inner border border-apple-gray-200 p-8 mb-5"
            style={{ filter: `brightness(${brightness}%)` }}
          >
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
          <div className="bg-apple-gray-50 rounded-2xl p-4 mb-5 w-full max-w-sm">
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
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5 max-w-sm w-full">
              <p className="text-blue-800 text-sm font-medium">{coupon.description}</p>
            </div>
          )}

          {/* Tips */}
          <div className="flex items-start gap-3 bg-yellow-50 rounded-2xl p-4 max-w-sm w-full">
            <Smartphone className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-semibold">Tipp für besseren Scan</p>
              <p className="text-sm text-yellow-700 mt-0.5">
                Halte das Handy ca. 10-15cm vom Scanner entfernt. Bei schlechtem Licht nutze den Helligkeits-Button oben.
              </p>
            </div>
          </div>

          {/* Close Button */}
          {!isFullscreen && (
            <button
              onClick={onClose}
              className="w-full max-w-sm mt-6 bg-apple-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-apple-gray-800 active:scale-[0.98] transition-all duration-200"
            >
              Schließen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}