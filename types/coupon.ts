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
  createdAt: string;
}