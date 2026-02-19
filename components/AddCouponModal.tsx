'use client';

import { useState } from 'react';
import { X, ScanLine, Tag, Calendar, FileText } from 'lucide-react';
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

  const getTypeColor = (t: string) => {
    if (t === type) {
      const colors: Record<string, string> = {
        payback: 'bg-red-500 text-white shadow-lg shadow-red-500/30',
        dm: 'bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/30',
        rossmann: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30',
        other: 'bg-gray-500 text-white shadow-lg shadow-gray-500/30',
      };
      return colors[t] || colors.other;
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
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl modal-content overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-payback-red to-red-600 px-6 py-5">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-apple-gray-700 mb-3">Typ</label>
            <div className="grid grid-cols-4 gap-2">
              {(['payback', 'dm', 'rossmann', 'other'] as CouponType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${getTypeColor(t)}`}
                >
                  {t === 'dm' ? 'DM' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-apple-gray-700 mb-2">
              Titel *
            </label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-400" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. 10x Punkte sammeln"
                className="w-full pl-12 pr-4 py-3.5 bg-apple-gray-50 border border-apple-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-payback-red/20 focus:border-payback-red transition-all"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-apple-gray-700 mb-2">
              Beschreibung
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-3.5 w-5 h-5 text-apple-gray-400" />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="z.B. Bei Einkauf ab 20€"
                className="w-full pl-12 pr-4 py-3.5 bg-apple-gray-50 border border-apple-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-payback-red/20 focus:border-payback-red transition-all"
              />
            </div>
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-semibold text-apple-gray-700 mb-2">
              Barcode *
            </label>
            <div className="relative mb-3">
              <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-400" />
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="z.B. 123456789012"
                className="w-full pl-12 pr-4 py-3.5 bg-apple-gray-50 border border-apple-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-payback-red/20 focus:border-payback-red transition-all font-mono"
                required
              />
            </div>
            <div className="flex gap-2">
              {(['CODE128', 'QR', 'EAN13'] as const).map((bt) => (
                <button
                  key={bt}
                  type="button"
                  onClick={() => setBarcodeType(bt)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    barcodeType === bt 
                      ? 'bg-apple-gray-900 text-white' 
                      : 'bg-apple-gray-100 text-apple-gray-600 hover:bg-apple-gray-200'
                  }`}
                >
                  {bt}
                </button>
              ))}
            </div>
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-semibold text-apple-gray-700 mb-2">
              Gültig bis *
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-400" />
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-apple-gray-50 border border-apple-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-payback-red/20 focus:border-payback-red transition-all"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-payback-red to-red-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Tag className="w-5 h-5" />
            Coupon speichern
          </button>
        </form>
      </div>
    </div>
  );
}