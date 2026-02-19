export type CouponType = 'payback' | 'dm' | 'rossmann' | 'rewe' | 'penny' | 'lidl' | 'aldi' | 'kaufland' | 'mueller' | 'budni' | 'other';
export type DiscountType = 'percent' | 'points' | 'fixed' | 'buyXgetY' | 'free';

export interface Coupon {
  id: string;
  title: string;
  description: string;
  barcode: string;
  barcodeType: 'CODE128' | 'QR' | 'EAN13';
  store: CouponType; // Geschäft wo eingelöst wird
  discountType: DiscountType; // Art des Rabatts
  discountValue?: number; // Wert (z.B. 10 für 10% oder 10€)
  minPurchase?: number; // Mindestbestellwert
  validFrom: string;
  validUntil: string;
  used: boolean;
  usedAt?: string;
  usedAmount?: number;
  createdAt: string;
  // Zusatzfelder
  value?: number;
  isFavorite?: boolean;
  category?: string;
  notes?: string;
}

// Für Multi-Coupon Modus
export interface CouponStack {
  id: string;
  name: string;
  coupons: Coupon[];
  createdAt: string;
  combinedBarcode: string;
}

// Hilfsfunktionen für Stores
export const STORE_NAMES: Record<CouponType, string> = {
  payback: 'PAYBACK Partner',
  dm: 'dm Drogerie',
  rossmann: 'Rossmann',
  rewe: 'REWE',
  penny: 'Penny',
  lidl: 'Lidl',
  aldi: 'Aldi',
  kaufland: 'Kaufland',
  mueller: 'Müller',
  budni: 'BUDNI',
  other: 'Sonstiges',
};

export const STORE_COLORS: Record<CouponType, string> = {
  payback: 'bg-blue-500',
  dm: 'bg-yellow-500',
  rossmann: 'bg-red-500',
  rewe: 'bg-red-600',
  penny: 'bg-red-400',
  lidl: 'bg-yellow-400',
  aldi: 'bg-blue-400',
  kaufland: 'bg-red-700',
  mueller: 'bg-orange-500',
  budni: 'bg-green-500',
  other: 'bg-gray-500',
};

export const DISCOUNT_NAMES: Record<DiscountType, string> = {
  percent: '% Rabatt',
  points: 'Punkte',
  fixed: '€ Rabatt',
  buyXgetY: 'Kaufen X, bekomme Y',
  free: 'Gratis',
};