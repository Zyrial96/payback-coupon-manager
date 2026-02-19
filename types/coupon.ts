export type CouponType = 'payback' | 'dm' | 'rossmann' | 'other';

export interface Coupon {
  id: string;
  title: string;
  description: string;
  barcode: string;
  barcodeType: 'CODE128' | 'QR' | 'EAN13';
  type: CouponType;
  validFrom: string;
  validUntil: string;
  used: boolean;
  usedAt?: string; // Wann wurde der Coupon eingelöst
  usedAmount?: number; // Wie viel wurde gespart
  createdAt: string;
  // Neue Felder
  value?: number; // Wert in € (für Statistiken)
  isFavorite?: boolean; // Angepinnt
  category?: string; // Kategorie/Ordner
  notes?: string; // Notizen
}

// Für Multi-Coupon Modus
export interface CouponStack {
  id: string;
  name: string;
  coupons: Coupon[];
  createdAt: string;
  combinedBarcode: string;
}