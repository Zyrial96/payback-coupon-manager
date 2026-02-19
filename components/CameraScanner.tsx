'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Camera, Loader2, RefreshCw } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface CameraScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function CameraScanner({ onScan, onClose }: CameraScannerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isStartedRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isStartedRef.current) {
      try {
        await scannerRef.current.stop();
        isStartedRef.current = false;
      } catch (e) {
        // Ignore stop errors
      }
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Check for camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Dein Browser unterstützt keine Kamera-Zugriff.');
        setIsLoading(false);
        return;
      }

      // Get cameras
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setError('Keine Kamera gefunden.');
        setIsLoading(false);
        return;
      }

      setHasCamera(true);

      // Create unique ID for container
      const scannerId = 'qr-scanner-' + Date.now();
      containerRef.current.id = scannerId;

      // Initialize scanner
      scannerRef.current = new Html5Qrcode(scannerId);

      // Start scanning
      await scannerRef.current.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success
          stopScanner();
          onScan(decodedText);
          onClose();
        },
        () => {
          // QR not found yet - ignore
        }
      );

      isStartedRef.current = true;
      setIsLoading(false);

    } catch (err: any) {
      console.error('Scanner error:', err);
      
      let errorMessage = 'Kamera konnte nicht gestartet werden.';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Kamera-Zugriff verweigert. Bitte erlaube den Zugriff in den Einstellungen.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Keine Kamera gefunden.';
      } else if (err.message?.includes('Permission')) {
        errorMessage = 'Kamera-Berechtigung erforderlich.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [onScan, onClose, stopScanner]);

  useEffect(() => {
    // Start scanner when component mounts
    const timer = setTimeout(() => {
      startScanner();
    }, 500); // Give modal time to animate in

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  const handleRetry = () => {
    stopScanner().then(() => {
      startScanner();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={() => {
          stopScanner();
          onClose();
        }}
      />
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-payback-red to-red-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Barcode scannen</h2>
                <p className="text-red-100 text-xs">
                  {isLoading ? 'Kamera wird gestartet...' : 'Halte den Code vor die Kamera'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                stopScanner();
                onClose();
              }}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading && !error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-payback-red animate-spin mb-4" />
              <p className="text-apple-gray-600">Kamera wird gestartet...</p>
              <p className="text-apple-gray-400 text-sm mt-2">Bitte warten</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-apple-gray-900 font-semibold mb-2">Kamera-Fehler</p>
              <p className="text-apple-gray-500 text-sm mb-6">{error}</p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRetry}
                  className="apple-button-primary flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Erneut versuchen
                </button>
                <button
                  onClick={() => {
                    stopScanner();
                    onClose();
                  }}
                  className="apple-button-secondary"
                >
                  Schließen
                </button>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-xl text-left">
                <p className="text-sm text-yellow-800 font-semibold mb-1">💡 Tipp:</p>
                <p className="text-sm text-yellow-700">
                  Falls die Kamera nicht funktioniert, kannst du den Barcode auch manuell eingeben.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Camera View */}
              <div 
                ref={containerRef}
                className="relative rounded-2xl overflow-hidden bg-black aspect-square"
              />

              {/* Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-2 border-white/30 rounded-2xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-payback-red rounded-lg">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-t-4 border-l-4 border-payback-red rounded-tl-lg" />
                  <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-8 h-8 border-t-4 border-r-4 border-payback-red rounded-tr-lg" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 border-b-4 border-l-4 border-payback-red rounded-bl-lg" />
                  <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 w-8 h-8 border-b-4 border-r-4 border-payback-red rounded-br-lg" />
                </div>
              </div>

              <p className="text-center text-sm text-apple-gray-500 mt-4">
                Halte den Barcode innerhalb des roten Rahmens
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}