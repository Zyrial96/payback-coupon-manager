'use client';

import { useState } from 'react';
import { Barcode, Calendar, Trash2, Heart, Share2, CheckCircle, MoreVertical, Wallet } from 'lucide-react';
import { Coupon } from '@/types/coupon';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface CouponCardProps {
  coupon: Coupon;
  onShowBarcode: () => void;
  onDelete: () => void;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  onMarkUsed?: (amount?: number) => void;
}

export function CouponCard({ 
  coupon, 
  onShowBarcode, 
  onDelete, 
  onToggleFavorite,
  onShare,
  onMarkUsed 
}: CouponCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [usedAmount, setUsedAmount] = useState('');
  const [showUsedInput, setShowUsedInput] = useState(false);
  
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

  const handleMarkUsed = () => {
    if (showUsedInput) {
      const amount = parseFloat(usedAmount);
      onMarkUsed?.(isNaN(amount) ? undefined : amount);
      setShowUsedInput(false);
      setUsedAmount('');
    } else {
      setShowUsedInput(true);
    }
  };

  return (
    <div className={`apple-card p-4 group hover:shadow-xl transition-all duration-300 ${
      coupon.isFavorite ? 'border-l-4 border-purple-500' : ''
    } ${coupon.used ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeGradient(coupon.type)} flex items-center justify-center shadow-lg`}>
          <span className="text-white font-bold text-lg">
            {getTypeLabel(coupon.type).charAt(0)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${getTypeGradient(coupon.type)} text-white`}>
                  {getTypeLabel(coupon.type)}
                </span>
                {coupon.isFavorite && (
                  <Heart className="w-4 h-4 text-purple-500 fill-purple-500" />
                )}
                {!isExpired && daysLeft <= 7 && !coupon.used && (
                  <span className="badge-pulse text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                    Läuft bald ab
                  </span>
                )}
                {coupon.used && (
                  <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                    Genutzt
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-apple-gray-900 dark:text-white leading-tight group-hover:text-payback-red transition-colors">
                {coupon.title}
              </h3>
              {coupon.description && (
                <p className="text-sm text-apple-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{coupon.description}</p>
              )}
              {coupon.used && coupon.usedAmount && (
                <p className="text-sm text-green-600 font-semibold mt-1">
                  Gespart: {coupon.usedAmount.toFixed(2)}€
                </p>
              )}
            </div>
            
            {/* More Actions Button */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-apple-gray-400 hover:text-apple-gray-600 hover:bg-apple-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {/* Actions Dropdown */}
              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-apple-gray-200 dark:border-gray-700 py-1 z-10 min-w-[140px]">
                  {onToggleFavorite && (
                    <button
                      onClick={() => { onToggleFavorite(); setShowActions(false); }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-apple-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Heart className={`w-4 h-4 ${coupon.isFavorite ? 'fill-purple-500 text-purple-500' : ''}`} />
                      {coupon.isFavorite ? 'Favorit entfernen' : 'Als Favorit'}
                    </button>
                  )}
                  {onShare && !coupon.used && (
                    <button
                      onClick={() => { onShare(); setShowActions(false); }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-apple-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Teilen
                    </button>
                  )}
                  {onMarkUsed && !coupon.used && !isExpired && (
                    <button
                      onClick={() => { handleMarkUsed(); setShowActions(false); }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-apple-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-green-600"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Als genutzt markieren
                    </button>
                  )}
                  <button
                    onClick={() => { onDelete(); setShowActions(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-500 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Löschen
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Used Amount Input */}
          {showUsedInput && (
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-gray-400" />
                <input
                  type="number"
                  value={usedAmount}
                  onChange={(e) => setUsedAmount(e.target.value)}
                  placeholder="Gesparter Betrag (€)"
                  className="w-full pl-9 pr-4 py-2 bg-apple-gray-50 dark:bg-gray-700 border border-apple-gray-200 dark:border-gray-600 rounded-xl text-sm"
                  autoFocus
                />
              </div>
              <button
                onClick={handleMarkUsed}
                className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600"
              >
                Speichern
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm">
                <Calendar className="w-4 h-4 text-apple-gray-400" />
                {isExpired ? (
                  <span className="text-gray-400 font-medium">Abgelaufen</span>
                ) : coupon.used ? (
                  <span className="text-green-600 font-medium">Eingelöst</span>
                ) : (
                  <span className={getDaysLeftColor(daysLeft)}>
                    <span className="font-semibold">{daysLeft}</span> Tage
                  </span>
                )}
              </div>
              <span className="text-apple-gray-300">•</span>
              <span className="text-sm text-apple-gray-400">
                bis {format(new Date(coupon.validUntil), 'dd.MM.', { locale: de })}
              </span>
            </div>

            {/* Show Barcode Button */}
            {!coupon.used && (
              <button
                onClick={onShowBarcode}
                className="flex items-center gap-2 bg-apple-gray-900 dark:bg-white text-white dark:text-apple-gray-900 px-4 py-2 rounded-xl font-medium hover:bg-payback-red dark:hover:bg-gray-200 transition-all text-sm"
              >
                <Barcode className="w-4 h-4" />
                <span>Anzeigen</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}