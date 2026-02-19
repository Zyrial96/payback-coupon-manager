'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Camera, Scan, Loader2, RefreshCw } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface CameraScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function CameraScanner({ onScan, onClose }: CameraScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Wait for ref to be set
    if (!readerRef.current) {
      return;
    }

    const initScanner = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          const cameraId = devices[0].id;
          setSelectedCamera(cameraId);
          
          // Initialize scanner with the ref
          scannerRef.current = new Html5Qrcode(readerRef.current!);
          
          await scannerRef.current.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1,
            },
            (decodedText) => {
              // Success callback
              onScan(decodedText);
              onClose();
            },
            (errorMessage) => {
              // Error callback (ignore continuous scanning errors)
              // Only log, don't show to user
            }
          );
          
          setIsLoading(false);
        } else {
          setError('Keine Kamera gefunden. Bitte stelle sicher, dass dein Gerät eine Kamera hat.');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Scanner error:', err);
        setError('Kamera-Zugriff verweigert oder nicht verfügbar. Bitte erlaube Kamera-Zugriff in den Einstellungen.');
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScan, onClose, retryCount]); // retryCount dependency allows restart

  const switchCamera = async (cameraId: string) => {
    if (!scannerRef.current) return;
    
    setIsLoading(true);
    try {
      await scannerRef.current.stop();
      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          onScan(decodedText);
          onClose();
        },
        () => {}
      );
      setSelectedCamera(cameraId);
      setIsLoading(false);
    } catch (err) {
      setError('Kamera-Wechsel fehlgeschlagen');
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
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
                <p className="text-red-100 text-xs">Halte den Code vor die Kamera</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-payback-red animate-spin mb-4" />
              <p className="text-apple-gray-600">Kamera wird initialisiert...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-apple-gray-900 font-semibold mb-2">Fehler</p>
              <p className="text-apple-gray-500 text-sm mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleRetry}
                  className="apple-button-primary text-sm flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Erneut versuchen
                </button>
                <button
                  onClick={onClose}
                  className="apple-button-secondary text-sm"
                >
                  Schließen
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Camera Selector */}
              {cameras.length > 1 && (
                <div className="mb-4">
                  <select
                    value={selectedCamera}
                    onChange={(e) => switchCamera(e.target.value)}
                    className="w-full bg-apple-gray-50 border border-apple-gray-200 rounded-xl px-4 py-2.5 text-sm"
                  >
                    {cameras.map((cam) => (
                      <option key={cam.id} value={cam.id}>
                        {cam.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Scanner - Using ref instead of id */}
              <div className="relative rounded-2xl overflow-hidden bg-black">
                <div ref={readerRef} className="w-full aspect-square" />
                
                {/* Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-white/30 rounded-2xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-payback-red rounded-lg">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-t-4 border-l-4 border-payback-red rounded-tl-lg" />
                    <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-8 h-8 border-t-4 border-r-4 border-payback-red rounded-tr-lg" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 border-b-4 border-l-4 border-payback-red rounded-bl-lg" />
                    <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 w-8 h-8 border-b-4 border-r-4 border-payback-red rounded-br-lg" />
                  </div>
                  <div className="scan-line" />
                </div>
              </div>

              <p className="text-center text-sm text-apple-gray-500 mt-4">
                Halte den Barcode innerhalb des Rahmens
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}