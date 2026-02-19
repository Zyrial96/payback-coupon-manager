'use client';

import { Barcode, Calendar, Trash2, ExternalLink } from 'lucide-react';
import { Coupon } from '@/types/coupon';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface CouponCardProps {
  coupon: Coupon;
  onShowBarcode: () => void;
  onDelete: () => void;
}

export function CouponCard({ coupon, onShowBarcode, onDelete }: CouponCardProps) {
  const isExpired = new Date(coupon.validUntil) < new Date();
  
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      payback: 'Payback',
      dm: 'DM',
      rossmann: 'Rossmann',
      other: 'Sonstiges',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      payback: 'bg-red-100 text-red-800',
      dm: 'bg-yellow-100 text-yellow-800',
      rossmann: 'bg-blue-100 text-blue-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${isExpired ? 'border-l-4 border-red-400' : 'border-l-4 border-green-400'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${getTypeColor(coupon.type)}`}>
              {getTypeLabel(coupon.type)}
            </span>
            {isExpired && (
              <span className="text-xs text-red-600 font-semibold">ABGELAUFEN</span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900">{coupon.title}</h3>
          {coupon.description && (
            <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Gültig bis: {format(new Date(coupon.validUntil), 'dd.MM.yyyy', { locale: de })}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onShowBarcode}
            className="p-2 bg-payback-red text-white rounded-lg hover:bg-red-700 transition"
            title="Barcode anzeigen"
          >
            <Barcode className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            title="Löschen"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}