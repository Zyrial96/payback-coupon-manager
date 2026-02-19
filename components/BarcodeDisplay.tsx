'use client';

import { useEffect, useRef } from 'react';
import { X, Smartphone } from 'lucide-react';
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

  useEffect(() => {
    if (coupon.barcodeType === 'QR' && qrRef.current) {
      QRCode.toCanvas(qrRef.current, coupon.barcode, {
        width: 250,
        margin: 2,
      });
    } else if (barcodeRef.current && coupon.barcodeType !== 'QR') {
      JsBarcode(barcodeRef.current, coupon.barcode, {
        format: coupon.barcodeType,
        lineColor: '#000',
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 16,
      });
    }
  }, [coupon]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{coupon.title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Zeige diesen Code an der Kasse vor
          </p>

          <div className="bg-white p-4 rounded-lg inline-block">
            {coupon.barcodeType === 'QR' ? (
              <canvas ref={qrRef} className="mx-auto" />
            ) : (
              <svg ref={barcodeRef} className="w-full" />
            )}
          </div>

          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-lg font-mono font-bold tracking-wider">
              {coupon.barcode}
            </p>
          </div>

          {coupon.description && (
            <p className="text-sm text-gray-600 mt-4">
              {coupon.description}
            </p>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Smartphone className="w-4 h-4" />
            <span>Helligkeit hoch drehen für besseren Scan</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-payback-red text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}