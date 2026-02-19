'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Barcode, Calendar, Tag, Sparkles, Wallet, TrendingUp, Clock } from 'lucide-react';
import { Coupon, CouponType } from '@/types/coupon';
import { CouponCard } from '@/components/CouponCard';
import { BarcodeDisplay } from '@/components/BarcodeDisplay';
import { AddCouponModal } from '@/components/AddCouponModal';

export default function Home() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('payback-coupons');
    if (saved) {
      setCoupons(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('payback-coupons', JSON.stringify(coupons));
  }, [coupons]);

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

  const activeCoupons = coupons.filter(c => !c.used && new Date(c.validUntil) >= new Date());
  const expiredCoupons = coupons.filter(c => new Date(c.validUntil) < new Date());
  const usedCoupons = coupons.filter(c => c.used);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Animated Header Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="bg-gradient-to-r from-payback-red to-red-600 text-white py-8 px-6 shadow-2xl">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="animate-slide-up">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 backdrop-blur rounded-2xl">
                    <Tag className="w-7 h-7" />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">Coupon Manager</h1>
                </div>
                <p className="text-red-100 text-sm font-medium">Alle Coupons an einem Ort</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 animate-fade-in">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium">{activeCoupons.length} aktiv</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto p-6">
        {/* Stats Cards */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 ${mounted ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.1s' }}>
          <div className="apple-card p-5 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-apple-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Aktive Coupons</p>
                <p className="text-3xl font-bold text-apple-green">{activeCoupons.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="apple-card p-5 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-apple-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Abgelaufen</p>
                <p className="text-3xl font-bold text-apple-red">{expiredCoupons.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="apple-card p-5 group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-apple-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Genutzt</p>
                <p className="text-3xl font-bold text-apple-gray-600">{usedCoupons.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-500/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <div className={`mb-8 ${mounted ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full apple-button-primary text-lg py-4 flex items-center justify-center gap-3 group"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
              <Plus className="w-5 h-5" />
            </div>
            <span>Neuen Coupon hinzufügen</span>
          </button>
        </div>

        {/* Active Coupons */}
        {activeCoupons.length > 0 && (
          <section className={`mb-8 ${mounted ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-apple-gray-900">Aktive Coupons</h2>
                <p className="text-sm text-apple-gray-500">Bereit zum Einlösen</p>
              </div>
              <div className="ml-auto">
                <span className="bg-apple-green/10 text-apple-green px-3 py-1 rounded-full text-sm font-semibold">
                  {activeCoupons.length}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {activeCoupons.map((coupon, index) => (
                <div key={coupon.id} style={{ animationDelay: `${0.1 * index}s` }} className="animate-slide-up">
                  <CouponCard
                    coupon={coupon}
                    onShowBarcode={() => showBarcodeForCoupon(coupon)}
                    onDelete={() => deleteCoupon(coupon.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Expired Coupons */}
        {expiredCoupons.length > 0 && (
          <section className={`mb-8 ${mounted ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-apple-gray-900">Abgelaufen</h2>
                <p className="text-sm text-apple-gray-500">Nicht mehr gültig</p>
              </div>
            </div>
            <div className="space-y-3 opacity-70">
              {expiredCoupons.map(coupon => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onShowBarcode={() => showBarcodeForCoupon(coupon)}
                  onDelete={() => deleteCoupon(coupon.id)}
                />
              ))}
            </div>
          </section>
        )}

        {coupons.length === 0 && (
          <div className={`text-center py-16 ${mounted ? 'animate-fade-in' : ''}`}>
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 float">
              <Tag className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-apple-gray-900 mb-2">Noch keine Coupons</h3>
            <p className="text-apple-gray-500 mb-6 max-w-sm mx-auto">
              Füge deinen ersten Coupon hinzu und behalte alle Angebote im Blick
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="apple-button-primary"
            >
              <Plus className="w-5 h-5 inline mr-2" />
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
    </main>
  );
}