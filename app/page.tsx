'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Settings, Camera, Bell, BellOff, Sparkles, Wallet, TrendingUp, Clock } from 'lucide-react';
import { Coupon, CouponType } from '@/types/coupon';
import { CouponCard } from '@/components/CouponCard';
import { BarcodeDisplay } from '@/components/BarcodeDisplay';
import { AddCouponModal } from '@/components/AddCouponModal';
import { CameraScanner } from '@/components/CameraScanner';
import { SettingsModal } from '@/components/SettingsModal';
import { CouponFilter, FilterOptions, applyFilters } from '@/components/CouponFilter';
import { checkExpiringCoupons, getNotificationPermission } from '@/lib/notifications';

export default function Home() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    type: 'all',
    status: 'active',
    sortBy: 'expiry',
  });

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('payback-coupons');
    if (saved) {
      setCoupons(JSON.parse(saved));
    }
    
    // Check notification permission
    const permission = getNotificationPermission();
    setNotificationsEnabled(permission.granted);
  }, []);

  useEffect(() => {
    localStorage.setItem('payback-coupons', JSON.stringify(coupons));
    
    // Check for expiring coupons
    if (notificationsEnabled) {
      const activeCoupons = coupons.filter(c => !c.used && new Date(c.validUntil) >= new Date());
      checkExpiringCoupons(activeCoupons);
    }
  }, [coupons, notificationsEnabled]);

  // Check expiring coupons every hour
  useEffect(() => {
    if (!notificationsEnabled) return;
    
    const interval = setInterval(() => {
      const activeCoupons = coupons.filter(c => !c.used && new Date(c.validUntil) >= new Date());
      checkExpiringCoupons(activeCoupons);
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, [coupons, notificationsEnabled]);

  const addCoupon = (coupon: Omit<Coupon, 'id' | 'createdAt'>) => {
    const newCoupon: Coupon = {
      ...coupon,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setCoupons([...coupons, newCoupon]);
    setShowAddModal(false);
  };

  const deleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const showBarcodeForCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowBarcode(true);
  };

  const handleScan = (barcode: string) => {
    setShowScanner(false);
    // Pre-fill the add modal with scanned barcode
    setShowAddModal(true);
    // Store barcode temporarily - will be passed to modal
    localStorage.setItem('scanned-barcode', barcode);
  };

  const handleImport = (importedCoupons: Coupon[]) => {
    setCoupons([...coupons, ...importedCoupons]);
  };

  const filteredCoupons = applyFilters(coupons, filters);
  
  const activeCoupons = coupons.filter(c => !c.used && new Date(c.validUntil) >= new Date());
  const expiredCoupons = coupons.filter(c => new Date(c.validUntil) < new Date());
  const usedCoupons = coupons.filter(c => c.used);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="bg-gradient-to-r from-payback-red to-red-600 text-white py-6 px-4 shadow-2xl">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="animate-slide-up">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-white/20 backdrop-blur rounded-2xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">Coupon Manager</h1>
                </div>
                <p className="text-red-100 text-sm">Alle Coupons an einem Ort</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowScanner(true)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl flex items-center justify-center transition-colors"
                  title="Barcode scannen"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl flex items-center justify-center transition-colors"
                  title="Einstellungen"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto p-4">
        {/* Stats */}
        <div className={`grid grid-cols-3 gap-3 mb-6 ${mounted ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.1s' }}>
          <div className="apple-card p-4 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-apple-gray-500 text-xs font-semibold uppercase mb-1">Aktiv</p>
                <p className="text-2xl font-bold text-green-600">{activeCoupons.length}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="apple-card p-4 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-apple-gray-500 text-xs font-semibold uppercase mb-1">Abgelaufen</p>
                <p className="text-2xl font-bold text-red-500">{expiredCoupons.length}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="apple-card p-4 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-apple-gray-500 text-xs font-semibold uppercase mb-1">Gesamt</p>
                <p className="text-2xl font-bold text-apple-gray-700">{coupons.length}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/30">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`mb-6 ${mounted ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.2s' }}>
          <CouponFilter
            filters={filters}
            onFilterChange={setFilters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />
        </div>

        {/* Add Button */}
        <div className={`flex gap-3 mb-6 ${mounted ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.3s' }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 apple-button-primary text-base py-3.5 flex items-center justify-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Coupon hinzufügen</span>
          </button>
          <button
            onClick={() => setShowScanner(true)}
            className="apple-button-secondary px-4 py-3.5"
            title="Barcode scannen"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Coupons List */}
        {filteredCoupons.length > 0 ? (
          <div className={`space-y-3 ${mounted ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.4s' }}>
            {filteredCoupons.map((coupon, index) => (
              <div key={coupon.id} style={{ animationDelay: `${0.05 * index}s` }} className="animate-slide-up">
                <CouponCard
                  coupon={coupon}
                  onShowBarcode={() => showBarcodeForCoupon(coupon)}
                  onDelete={() => deleteCoupon(coupon.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 ${mounted ? 'animate-fade-in' : ''}`}>
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 float">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-apple-gray-900 mb-1">
              {filters.search || filters.type !== 'all' || filters.status !== 'all'
                ? 'Keine Coupons gefunden'
                : 'Noch keine Coupons'}
            </h3>
            <p className="text-apple-gray-500 text-sm mb-4">
              {filters.search || filters.type !== 'all' || filters.status !== 'all'
                ? 'Versuche andere Filter-Einstellungen'
                : 'Füge deinen ersten Coupon hinzu'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="apple-button-primary text-sm"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Coupon erstellen
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddCouponModal
          onClose={() => setShowAddModal(false)}
          onAdd={addCoupon}
        />
      )}

      {showBarcode && selectedCoupon && (
        <BarcodeDisplay
          coupon={selectedCoupon}
          onClose={() => setShowBarcode(false)}
        />
      )}

      {showScanner && (
        <CameraScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          coupons={coupons}
          onImport={handleImport}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  );
}