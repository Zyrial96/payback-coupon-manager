'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Barcode, Calendar, Tag } from 'lucide-react';
import { Coupon, CouponType } from '@/types/coupon';
import { CouponCard } from '@/components/CouponCard';
import { BarcodeDisplay } from '@/components/BarcodeDisplay';
import { AddCouponModal } from '@/components/AddCouponModal';

export default function Home() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);

  useEffect(() => {
    // Lade Coupons aus localStorage (später Supabase)
    const saved = localStorage.getItem('payback-coupons');
    if (saved) {
      setCoupons(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Speichere in localStorage
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-payback-red text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-8 h-8" />
            Payback Coupon Manager
          </h1>
          <p className="text-red-100 mt-1">Persönlicher Coupon Manager</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <div className="text-2xl font-bold text-green-600">{activeCoupons.length}</div>
            <div className="text-sm text-gray-600">Aktiv</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <div className="text-2xl font-bold text-red-600">{expiredCoupons.length}</div>
            <div className="text-sm text-gray-600">Abgelaufen</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow text-center">
            <div className="text-2xl font-bold text-gray-600">{usedCoupons.length}</div>
            <div className="text-sm text-gray-600">Genutzt</div>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-payback-red text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-700 transition mb-6"
        >
          <Plus className="w-5 h-5" />
          Coupon hinzufügen
        </button>

        {/* Active Coupons */}
        {activeCoupons.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Tag className="w-5 h-5 text-green-600" />
              Aktive Coupons
            </h2>
            <div className="space-y-3">
              {activeCoupons.map(coupon => (
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

        {/* Expired Coupons */}
        {expiredCoupons.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              Abgelaufen
            </h2>
            <div className="space-y-3 opacity-60">
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
          <div className="text-center py-12 text-gray-500">
            <Tag className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Noch keine Coupons vorhanden.</p>
            <p className="text-sm">Füge deinen ersten Coupon hinzu!</p>
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