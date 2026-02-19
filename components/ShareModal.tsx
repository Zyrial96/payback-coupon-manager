'use client';

import { useState } from 'react';
import { X, Share2, Copy, Check, QrCode } from 'lucide-react';
import { Coupon } from '@/types/coupon';
import QRCode from 'qrcode';
import { useEffect, useRef } from 'react';

interface ShareModalProps {
  coupon: Coupon;
  onClose: () => void;
}

export function ShareModal({ coupon, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');
  const qrRef = useRef<HTMLCanvasElement>(null);

  const shareData = {
    title: coupon.title,
    text: `Coupon: ${coupon.title}${coupon.description ? ` - ${coupon.description}` : ''}`,
    barcode: coupon.barcode,
  };

  const shareUrl = `${window.location.origin}/import?data=${encodeURIComponent(
    JSON.stringify({
      title: coupon.title,
      description: coupon.description,
      barcode: coupon.barcode,
      type: coupon.type,
      validUntil: coupon.validUntil,
    })
  )}`;

  useEffect(() => {
    if (activeTab === 'qr' && qrRef.current) {
      QRCode.toCanvas(qrRef.current, shareUrl, {
        width: 250,
        margin: 2,
      });
    }
  }, [activeTab, shareUrl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">Coupon teilen</h2>
            </div>
            <button onClick={onClose} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Coupon Preview */}
          <div className="bg-apple-gray-50 rounded-2xl p-4 mb-6">
            <p className="font-semibold text-apple-gray-900">{coupon.title}</p>
            {coupon.description && (
              <p className="text-sm text-apple-gray-500 mt-1">{coupon.description}</p>
            )}
            <p className="text-xs text-apple-gray-400 mt-2">
              Gültig bis: {new Date(coupon.validUntil).toLocaleDateString('de-DE')}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-apple-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'link' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-apple-gray-500'
              }`}
            >
              Link
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'qr' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-apple-gray-500'
              }`}
            >
              QR-Code
            </button>
          </div>

          {/* Content */}
          {activeTab === 'link' ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-apple-gray-50 border border-apple-gray-200 rounded-xl px-4 py-3 text-sm text-apple-gray-600"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    copied 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              {typeof navigator.share !== 'undefined' && (
                <button
                  onClick={shareViaWebShare}
                  className="w-full apple-button-primary bg-green-500 hover:bg-green-600"
                >
                  <Share2 className="w-5 h-5 inline mr-2" />
                  Teilen...
                </button>
              )}

              <p className="text-xs text-apple-gray-500 text-center">
                Der Empfänger kann den Coupon mit einem Klick importieren
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <canvas ref={qrRef} className="mx-auto" />
              <p className="text-sm text-apple-gray-500">
                Scan den QR-Code mit der Kamera-App um den Coupon zu importieren
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}