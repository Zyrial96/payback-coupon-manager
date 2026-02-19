'use client';

import { useState } from 'react';
import { X, Camera } from 'lucide-react';
import { CouponType } from '@/types/coupon';

interface AddCouponModalProps {
  onClose: () => void;
  onAdd: (coupon: {
    title: string;
    description: string;
    barcode: string;
    barcodeType: 'CODE128' | 'QR' | 'EAN13';
    type: CouponType;
    validFrom: string;
    validUntil: string;
    used: boolean;
  }) => void;
}

export function AddCouponModal({ onClose, onAdd }: AddCouponModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [barcode, setBarcode] = useState('');
  const [barcodeType, setBarcodeType] = useState<'CODE128' | 'QR' | 'EAN13'>('CODE128');
  const [type, setType] = useState<CouponType>('payback');
  const [validUntil, setValidUntil] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !barcode || !validUntil) return;

    onAdd({
      title,
      description,
      barcode,
      barcodeType,
      type,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil,
      used: false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Coupon hinzufügen</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Typ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CouponType)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-payback-red focus:border-transparent"
            >
              <option value="payback">Payback</option>
              <option value="dm">DM</option>
              <option value="rossmann">Rossmann</option>
              <option value="other">Sonstiges</option>
            </select>
          </div>

          {/* Titel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. 10x Punkte"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-payback-red focus:border-transparent"
              required
            />
          </div>

          {/* Beschreibung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="z.B. Bei Einkauf ab 20€"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-payback-red focus:border-transparent"
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barcode *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="z.B. 123456789"
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-payback-red focus:border-transparent"
                required
              />
            </div>
            <select
              value={barcodeType}
              onChange={(e) => setBarcodeType(e.target.value as 'CODE128' | 'QR' | 'EAN13')}
              className="w-full border rounded-lg px-3 py-2 mt-2 focus:ring-2 focus:ring-payback-red focus:border-transparent"
            >
              <option value="CODE128">CODE128 (Standard)</option>
              <option value="QR">QR Code</option>
              <option value="EAN13">EAN-13</option>
            </select>
          </div>

          {/* Gültig bis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gültig bis *</label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-payback-red focus:border-transparent"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-payback-red text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Coupon speichern
          </button>
        </form>
      </div>
    </div>
  );
}