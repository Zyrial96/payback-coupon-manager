'use client';

import { useMemo } from 'react';
import { TrendingUp, Wallet, Calendar, BarChart3, PieChart } from 'lucide-react';
import { Coupon } from '@/types/coupon';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';

interface StatisticsProps {
  coupons: Coupon[];
}

export function Statistics({ coupons }: StatisticsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const usedCoupons = coupons.filter(c => c.used);
    const activeCoupons = coupons.filter(c => !c.used && new Date(c.validUntil) >= now);
    const expiredCoupons = coupons.filter(c => !c.used && new Date(c.validUntil) < now);
    
    // Total saved
    const totalSaved = usedCoupons.reduce((sum, c) => sum + (c.usedAmount || 0), 0);
    
    // Monthly stats (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthCoupons = usedCoupons.filter(c => 
        c.usedAt && isWithinInterval(new Date(c.usedAt), { start: monthStart, end: monthEnd })
      );
      
      monthlyData.push({
        month: format(month, 'MMM', { locale: de }),
        count: monthCoupons.length,
        saved: monthCoupons.reduce((sum, c) => sum + (c.usedAmount || 0), 0),
      });
    }
    
    // Type distribution
    const typeDistribution = coupons.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Average savings per coupon
    const avgSavings = usedCoupons.length > 0 
      ? totalSaved / usedCoupons.length 
      : 0;
    
    return {
      totalSaved,
      usedCount: usedCoupons.length,
      activeCount: activeCoupons.length,
      expiredCount: expiredCoupons.length,
      totalCount: coupons.length,
      monthlyData,
      typeDistribution,
      avgSavings,
    };
  }, [coupons]);

  const maxMonthly = Math.max(...stats.monthlyData.map(d => d.saved), 1);

  const typeColors: Record<string, string> = {
    payback: 'bg-red-500',
    dm: 'bg-yellow-400',
    rossmann: 'bg-blue-500',
    other: 'bg-gray-500',
  };

  const typeLabels: Record<string, string> = {
    payback: 'Payback',
    dm: 'DM',
    rossmann: 'Rossmann',
    other: 'Sonstige',
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="apple-card p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-600 text-xs font-semibold uppercase tracking-wider">Gespart</p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                {stats.totalSaved.toFixed(2)}€
              </p>
              <p className="text-green-600 text-xs mt-1">
                {stats.usedCount} Coupon(s) eingelöst
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="apple-card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Durchschnitt</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">
                {stats.avgSavings.toFixed(2)}€
              </p>
              <p className="text-blue-600 text-xs mt-1">
                pro Coupon
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="apple-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-apple-gray-600" />
          <h3 className="font-bold text-apple-gray-900">Spar-Trend (6 Monate)</h3>
        </div>
        
        <div className="flex items-end gap-2 h-32">
          {stats.monthlyData.map((data, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-gradient-to-t from-payback-red to-red-400 rounded-t-lg transition-all hover:from-red-600 hover:to-red-500"
                style={{ height: `${(data.saved / maxMonthly) * 100}%`, minHeight: '4px' }}
              />
              <span className="text-xs text-apple-gray-500 font-medium">{data.month}</span>
              {data.saved > 0 && (
                <span className="text-xs text-apple-gray-400">{data.saved.toFixed(0)}€</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Type Distribution */}
      <div className="apple-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-apple-gray-600" />
          <h3 className="font-bold text-apple-gray-900">Coupon-Verteilung</h3>
        </div>
        
        <div className="space-y-3">
          {Object.entries(stats.typeDistribution).map(([type, count]) => {
            const percentage = (count / stats.totalCount) * 100;
            return (
              <div key={type} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${typeColors[type] || 'bg-gray-400'}`} />
                <span className="text-sm font-medium w-20">{typeLabels[type] || type}</span>
                <div className="flex-1 h-2 bg-apple-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${typeColors[type] || 'bg-gray-400'} rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-apple-gray-500 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.activeCount}</p>
          <p className="text-xs text-green-700">Aktiv</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.usedCount}</p>
          <p className="text-xs text-blue-700">Genutzt</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.expiredCount}</p>
          <p className="text-xs text-red-700">Abgelaufen</p>
        </div>
      </div>

      {/* Motivation */}
      {stats.totalSaved > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-5 text-white">
          <p className="text-lg font-bold">🎉 Super!</p>
          <p className="text-white/90 mt-1">
            Du hast insgesamt <strong>{stats.totalSaved.toFixed(2)}€</strong> gespart! 
            Weiter so!
          </p>
        </div>
      )}
    </div>
  );
}