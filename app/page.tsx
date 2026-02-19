'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Settings, Camera, Sparkles, Wallet, TrendingUp, Clock, 
  Layers, Moon, Sun, BarChart3, Heart
} from 'lucide-react';
import { Coupon, CouponType } from '@/types/coupon';
import { CouponCard } from '@/components/CouponCard';
import { BarcodeDisplay } from '@/components/BarcodeDisplay';
import { AddCouponModal } from '@/components/AddCouponModal';
import { CameraScanner } from '@/components/CameraScanner';
import { SettingsModal } from '@/components/SettingsModal';
import { CouponFilter, FilterOptions, applyFilters } from '@/components/CouponFilter';
import { checkExpiringCoupons, getNotificationPermission } from '@/lib/notifications';
import { MultiScanModal } from '@/components/MultiScanModal';
import { Statistics } from '@/components/Statistics';
import { ShareModal } from '@/components/ShareModal';

export default function Home() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMultiScan, setShowMultiScan] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    store: 'all',
    status: 'active',
    sortBy: 'expiry',
  });

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('payback-coupons');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: altes 'type' Feld zu neuem 'store' und 'discountType'
      const migrated = parsed.map((c: any) => ({
        ...c,
        store: c.store || c.type || 'other',
        discountType: c.discountType || 'percent',
      }));
      setCoupons(migrated);
    }
    
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('dark-mode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add('dark');
    }
    
    // Check notification permission
    const permission = getNotificationPermission();
    setNotificationsEnabled(permission.granted);
  }, []);

  useEffect(() => {
    localStorage.setItem('payback-coupons', JSON.stringify(coupons));
    
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
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [coupons, notificationsEnabled]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('dark-mode', String(newMode));
    if (newMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const addCoupon = (coupon: Omit<Coupon, 'id' | 'createdAt'>) => {
    const newCoupon: Coupon = {
      ...coupon,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setCoupons([...coupons, newCoupon]);
    setShowAddModal(false);
  };

  const addMultipleCoupons = (newCoupons: Omit<Coupon, 'id' | 'createdAt'>[]) => {
    const couponsToAdd = newCoupons.map(c => ({
      ...c,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }));
    setCoupons([...coupons, ...couponsToAdd]);
    setShowMultiScan(false);
  };

  const deleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setCoupons(coupons.map(c => 
      c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
    ));
  };

  const markAsUsed = (id: string, amount?: number) => {
    setCoupons(coupons.map(c => 
      c.id === id ? { 
        ...c, 
        used: true, 
        usedAt: new Date().toISOString(),
        usedAmount: amount
      } : c
    ));
  };

  const showBarcodeForCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowBarcode(true);
  };

  const showShareForCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowShare(true);
  };

  const handleScan = (barcode: string) => {
    setShowScanner(false);
    setShowAddModal(true);
    localStorage.setItem('scanned-barcode', barcode);
  };

  const handleImport = (importedCoupons: Coupon[]) => {
    setCoupons([...coupons, ...importedCoupons]);
  };

  const filteredCoupons = applyFilters(coupons, filters);
  
  // Sort by favorite first, then by other criteria
  const sortedCoupons = [...filteredCoupons].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });
  
  const activeCoupons = coupons.filter(c => !c.used && new Date(c.validUntil) >= new Date());
  const expiredCoupons = coupons.filter(c => !c.used && new Date(c.validUntil) < new Date());
  const usedCoupons = coupons.filter(c => c.used);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse dark:from-blue-600/10 dark:to-purple-600/10" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse dark:from-pink-600/10 dark:to-orange-600/10" style={{ animationDelay: '1s' }} />
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
                  onClick={toggleDarkMode}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl flex items-center justify-center transition-colors"
                  title={darkMode ? 'Light Mode' : 'Dark Mode'}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setShowStatistics(true)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl flex items-center justify-center transition-colors"
                  title="Statistiken"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowMultiScan(true)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl flex items-center justify-center transition-colors"
                  title="Multi-Scan"
                >
                  <Layers className="w-5 h-5" />
                </button>
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
          <div className="apple-card p-4 group cursor-pointer" onClick={() => setShowStatistics(true)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-apple-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">Aktiv</p>
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
                <p className="text-apple-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">Abgelaufen</p>
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
                <p className="text-apple-gray-500 dark:text-gray-400 text-xs font-semibold uppercase mb-1">Gespart</p>
                <p className="text-2xl font-bold text-apple-gray-700 dark:text-gray-300">
                  {usedCoupons.reduce((sum, c) => sum + (c.usedAmount || 0), 0).toFixed(0)}€
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
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
          <button
            onClick={() => setShowMultiScan(true)}
            className="apple-button-secondary px-4 py-3.5"
            title="Multi-Scan"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>

        {/* Coupons List */}
        {sortedCoupons.length > 0 ? (
          <div className={`space-y-3 ${mounted ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.4s' }}>
            {sortedCoupons.map((coupon, index) => (
              <div key={coupon.id} style={{ animationDelay: `${0.05 * index}s` }} className="animate-slide-up">
                <CouponCard
                  coupon={coupon}
                  onShowBarcode={() => showBarcodeForCoupon(coupon)}
                  onDelete={() => deleteCoupon(coupon.id)}
                  onToggleFavorite={() => toggleFavorite(coupon.id)}
                  onShare={() => showShareForCoupon(coupon)}
                  onMarkUsed={(amount) => markAsUsed(coupon.id, amount)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 ${mounted ? 'animate-fade-in' : ''}`}>
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 float">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white mb-1">
              {filters.search || filters.type !== 'all' || filters.status !== 'all'
                ? 'Keine Coupons gefunden'
                : 'Noch keine Coupons'}
            </h3>
            <p className="text-apple-gray-500 dark:text-gray-400 text-sm mb-4">
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

      {showMultiScan && (
        <MultiScanModal
          existingCoupons={coupons}
          onAddCoupons={addMultipleCoupons}
          onClose={() => setShowMultiScan(false)}
        />
      )}

      {showStatistics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowStatistics(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Statistiken
              </h2>
              <button onClick={() => setShowStatistics(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <Statistics coupons={coupons} />
            </div>
          </div>
        </div>
      )}

      {showShare && selectedCoupon && (
        <ShareModal
          coupon={selectedCoupon}
          onClose={() => setShowShare(false)}
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