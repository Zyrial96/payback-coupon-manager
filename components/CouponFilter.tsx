'use client';

import { Search, SlidersHorizontal, X, Store } from 'lucide-react';
import { CouponType, STORE_NAMES } from '@/types/coupon';

export interface FilterOptions {
  search: string;
  store: CouponType | 'all';
  status: 'all' | 'active' | 'expired' | 'used';
  sortBy: 'date' | 'expiry' | 'name';
}

interface CouponFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export function CouponFilter({ filters, onFilterChange, showFilters, onToggleFilters }: CouponFilterProps) {
  const typeColors: Record<string, string> = {
    payback: 'bg-red-500',
    dm: 'bg-yellow-400',
    rossmann: 'bg-blue-500',
    other: 'bg-gray-500',
    all: 'bg-apple-gray-400',
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray-400" />
        <input
          type="text"
          placeholder="Coupons durchsuchen..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="w-full pl-12 pr-10 py-3 bg-white rounded-2xl border border-apple-gray-200 focus:outline-none focus:ring-2 focus:ring-payback-red/20 focus:border-payback-red transition-all"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ ...filters, search: '' })}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-apple-gray-400 hover:text-apple-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <button
        onClick={onToggleFilters}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          showFilters 
            ? 'bg-payback-red text-white' 
            : 'bg-white text-apple-gray-600 hover:bg-apple-gray-50'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filter
      </button>

      {/* Filter Panel */}
      {showFilters && (
        <div className="apple-card p-4 animate-slide-up">
          {/* Store Filter */}
          <div className="mb-4">
            <label className="flex items-center gap-1 text-xs font-semibold text-apple-gray-500 uppercase tracking-wider mb-2">
              <Store className="w-3 h-3" />
              Geschäft
            </label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'dm', 'rossmann', 'rewe', 'penny', 'lidl', 'kaufland', 'mueller', 'payback', 'other'] as const).map((store) => (
                <button
                  key={store}
                  onClick={() => onFilterChange({ ...filters, store })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filters.store === store
                      ? 'bg-payback-red text-white'
                      : 'bg-apple-gray-100 text-apple-gray-600 hover:bg-apple-gray-200'
                  }`}
                >
                  {store === 'all' ? 'Alle' : STORE_NAMES[store] || store}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-apple-gray-500 uppercase tracking-wider mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'active', 'expired', 'used'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => onFilterChange({ ...filters, status })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filters.status === status
                      ? 'bg-apple-gray-900 text-white'
                      : 'bg-apple-gray-100 text-apple-gray-600 hover:bg-apple-gray-200'
                  }`}
                >
                  {status === 'all' ? 'Alle' : 
                   status === 'active' ? 'Aktiv' : 
                   status === 'expired' ? 'Abgelaufen' : 'Genutzt'}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-semibold text-apple-gray-500 uppercase tracking-wider mb-2">
              Sortieren nach
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
              className="w-full px-3 py-2 bg-apple-gray-50 border border-apple-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-payback-red/20"
            >
              <option value="date">Hinzugefügt</option>
              <option value="expiry">Ablaufdatum</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export function applyFilters(coupons: any[], filters: FilterOptions): any[] {
  let result = [...coupons];

  // Search
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(c => 
      c.title.toLowerCase().includes(searchLower) ||
      c.description?.toLowerCase().includes(searchLower) ||
      c.barcode.includes(searchLower)
    );
  }

  // Store filter
  if (filters.store !== 'all') {
    result = result.filter(c => c.store === filters.store);
  }

  // Status filter
  if (filters.status !== 'all') {
    const now = new Date();
    result = result.filter(c => {
      const isExpired = new Date(c.validUntil) < now;
      if (filters.status === 'active') return !c.used && !isExpired;
      if (filters.status === 'expired') return isExpired;
      if (filters.status === 'used') return c.used;
      return true;
    });
  }

  // Sort
  result.sort((a, b) => {
    if (filters.sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (filters.sortBy === 'expiry') {
      return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
    }
    if (filters.sortBy === 'name') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return result;
}