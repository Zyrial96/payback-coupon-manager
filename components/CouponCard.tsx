'use client';

import { Barcode, Calendar, Trash2, Sparkles, ArrowRight } from 'lucide-react';
import { Coupon } from '@/types/coupon';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface CouponCardProps {
  coupon: Coupon;
  onShowBarcode: () => void;
  onDelete: () => void;
}

export function CouponCard({ coupon, onShowBarcode, onDelete }: CouponCardProps) {
  const isExpired = new Date(coupon.validUntil) < new Date();
  const daysLeft = differenceInDays(new Date(coupon.validUntil), new Date());
  
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      payback: 'Payback',
      dm: 'DM',
      rossmann: 'Rossmann',
      other: 'Sonstiges',
    };
    return labels[type] || type;
  };

  const getTypeGradient = (type: string) => {
    const gradients: Record<string, string> = {
      payback: 'from-red-500 to-red-600',
      dm: 'from-yellow-400 to-yellow-500',
      rossmann: 'from-blue-400 to-blue-500',
      other: 'from-gray-400 to-gray-500',
    };
    return gradients[type] || gradients.other;
  };

  const getDaysLeftColor = (days: number) => {
    if (days < 0) return 'text-gray-500';
    if (days <= 3) return 'text-red-500';
    if (days <= 7) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className="apple-card p-5 group hover:shadow-xl transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${getTypeGradient(coupon.type)} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
          <span className="text-white font-bold text-lg">
            {getTypeLabel(coupon.type).charAt(0)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${getTypeGradient(coupon.type)} text-white`}>
                  {getTypeLabel(coupon.type)}
                </span>
                {!isExpired && daysLeft <= 7 && (
                  <span className="badge-pulse text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                    Läuft bald ab
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-apple-gray-900 leading-tight group-hover:text-apple-blue transition-colors">
                {coupon.title}
              </h3>
              {coupon.description && (
                <p className="text-sm text-apple-gray-500 mt-1 line-clamp-2">{coupon.description}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <Calendar className="w-4 h-4 text-apple-gray-400" />
                {isExpired ? (
                  <span className="text-gray-400 font-medium">Abgelaufen</span>
                ) : (
                  <span className={getDaysLeftColor(daysLeft)}>
                    <span className="font-semibold">{daysLeft}</span> Tage übrig
                  </span>
                )}
              </div>
              <span className="text-apple-gray-300">•</span>
              <span className="text-sm text-apple-gray-400">
                bis {format(new Date(coupon.validUntil), 'dd.MM.', { locale: de })}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onDelete}
                className="p-2 text-apple-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Löschen"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={onShowBarcode}
                className="flex items-center gap-2 bg-apple-gray-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-apple-blue transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
              >
                <Barcode className="w-4 h-4" />
                <span className="hidden sm:inline">Anzeigen</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}