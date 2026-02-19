'use client';

import { useState } from 'react';
import { X, ScanLine, Tag, Calendar, FileText, Store, Percent } from 'lucide-react';
import { CouponType, DiscountType, STORE_NAMES, DISCOUNT_NAMES } from '@/types/coupon';

interface AddCouponModalProps {
  onClose: () => void;
  onAdd: (coupon: {
    title: string;
    description: string;
    barcode: string;
    barcodeType: 'CODE128' | 'QR' | 'EAN13';
    store: CouponType;
    discountType: DiscountType;
    discountValue?: number;
    validFrom: string;
    validUntil: string;
    used: boolean;
  }) => void;
}

const STORES: CouponType[] = [
  'dm', 'rossmann', 'rewe', 'penny', 'lidl', 'kaufland', 'mueller', 'payback', 'other'
];

const DISCOUNT_TYPES: DiscountType[] = ['percent', 'fixed', 'points', 'buyXgetY', 'free'];

export function AddCouponModal({ onClose, onAdd }: AddCouponModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [barcode, setBarcode] = useState('');
  const [barcodeType, setBarcodeType] = useState<'CODE128' | 'QR' | 'EAN13'>('CODE128');
  const [store, setStore] = useState<CouponType>('dm');
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !barcode || !validUntil) return;

    onAdd({
      title,
      description,
      barcode,
      barcodeType,
      store,
      discountType,
      discountValue: discountValue ? parseFloat(discountValue) : undefined,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil,
      used: false,
    });
  };

  const getStoreColor = (s: CouponType) => {
    if (s === store) {
      const colors: Record<CouponType, string> = {
        dm: 'bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/30',
        rossmann: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30',
        rewe: 'bg-red-600 text-white shadow-lg shadow-red-600/30',
        penny: 'bg-red-500 text-white shadow-lg shadow-red-500/30',
        lidl: 'bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/30',
        aldi: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30',
        kaufland: 'bg-orange-600 text-white shadow-lg shadow-orange-600/30',
        mueller: 'bg-orange-500 text-white shadow-lg shadow-orange-500/30',
        payback: 'bg-red-500 text-white shadow-lg shadow-red-500/30',
        budni: 'bg-green-500 text-white shadow-lg shadow-green-500/30',
        other: 'bg-gray-500 text-white shadow-lg shadow-gray-500/30',
      };
      return colors[s];
    }
    return 'bg-apple-gray-100 text-apple-gray-600 hover:bg-apple-gray-200';
  };

  const getDiscountColor = (d: DiscountType) => {
    if (d === discountType) {
      return 'bg-payback-red text-white shadow-lg shadow-payback-red/30';
    }
    return 'bg-apple-gray-100 text-apple-gray-600 hover:bg-apple-gray-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl modal-content overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-payback-red to-red-600 px-6 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Neuer Coupon</h2>
                <p className="text-red-100 text-sm">Füge einen neuen Coupon hinzu</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Store Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-apple-gray-900 mb-3">
              <Store className="w-4 h-4 text-payback-red" />
              Geschäft *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STORES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStore(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${getStoreColor(s)}`}
                >
                  {STORE_NAMES[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Discount Type */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-apple-gray-900 mb-3">
              <Percent className="w-4 h-4 text-payback-red" />
              Rabatt-Typ *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DISCOUNT_TYPES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiscountType(d)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${getDiscountColor(d)}`}
                >
                  {DISCOUNT_NAMES[d]}
                </button>
              ))}
            </div>
          </div>

          {/* Discount Value */}
          {(discountType === 'percent' || discountType === 'fixed') && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-apple-gray-900 mb-2">
                <Percent className="w-4 h-4 text-payback-red" />
                Wert {discountType === 'percent' ? '(%)' : '(€)'}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percent' ? 'z.B. 10' : 'z.B. 5.99'}
                className="w-full bg-apple-gray-50 border border-apple-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-payback-red focus:ring-2 focus:ring-payback-red/20 transition-all"
                min="0"
                step={discountType === 'percent' ? '1' : '0.01'}
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-apple-gray-900 mb-2">
              <ScanLine className="w-4 h-4 text-payback-red" />
              Titel *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. 20% auf Pflegeprodukte"
              className="w-full bg-apple-gray-50 border border-apple-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-payback-red focus:ring-2 focus:ring-payback-red/20 transition-all"
              required
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-apple-gray-900 mb-2">
              <ScanLine className="w-4 h-4 text-payback-red" />
              Barcode *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Coupon-Code eingeben"
                className="flex-1 bg-apple-gray-50 border border-apple-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-payback-red focus:ring-2 focus:ring-payback-red/20 transition-all"
                required
              />
              <select
                value={barcodeType}
                onChange={(e) => setBarcodeType(e.target.value as 'CODE128' | 'QR' | 'EAN13')}
                className="bg-apple-gray-50 border border-apple-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-payback-red"
              >
                <option value="CODE128">CODE128</option>
                <option value="QR">QR</option>
                <option value="EAN13">EAN13</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-apple-gray-900 mb-2">
              <FileText className="w-4 h-4 text-payback-red" />
              Beschreibung
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Weitere Details zum Coupon..."
              rows={2}
              className="w-full bg-apple-gray-50 border border-apple-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-payback-red focus:ring-2 focus:ring-payback-red/20 transition-all resize-none"
            />
          </div>

          {/* Valid Until */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-apple-gray-900 mb-2">
              <Calendar className="w-4 h-4 text-payback-red" />
              Gültig bis *
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full bg-apple-gray-50 border border-apple-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-payback-red focus:ring-2 focus:ring-payback-red/20 transition-all"
              required
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-payback-red to-red-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-payback-red/30 hover:shadow-xl hover:shadow-payback-red/40 active:scale-[0.98] transition-all duration-200"
            >
              Coupon hinzufügen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}