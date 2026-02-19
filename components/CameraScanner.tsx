'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Camera, Loader2, RefreshCw, Video } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface CameraScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function CameraScanner({ onScan, onClose }: CameraScannerProps) {
  const [step, setStep] = useState<'permission' | 'loading' | 'scanning' | 'error'>('permission');
  const [errorMsg, setErrorMsg] = useState('');
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = useRef('qr-scanner-' + Date.now()).current;

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.log('Stop error:', e);
      }
      scannerRef.current = null;
    }
  }, []);

  const startScanner = async () => {
    try {
      setStep('loading');
      
      // Check if element exists
      const element = document.getElementById(containerId);
      if (!element) {
        console.error('Container not found:', containerId);
        setErrorMsg('Scanner-Container nicht gefunden');
        setStep('error');
        return;
      }

      console.log('Starting scanner with container:', containerId);
      
      // Get cameras first
      const devices = await Html5Qrcode.getCameras();
      console.log('Found cameras:', devices);
      
      if (!devices || devices.length === 0) {
        setErrorMsg('Keine Kamera gefunden');
        setStep('error');
        return;
      }

      setCameras(devices);

      // Create scanner
      scannerRef.current = new Html5Qrcode(containerId);
      
      // Start with first camera
      await scannerRef.current.start(
        devices[0].id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          console.log('QR Code found:', decodedText);
          stopScanner();
          onScan(decodedText);
          onClose();
        },
        (errorMessage) => {
          // Ignore continuous errors
        }
      );
      
      console.log('Scanner started successfully');
      setStep('scanning');
      
    } catch (err: any) {
      console.error('Scanner error:', err);
      setErrorMsg('Fehler: ' + (err.message || 'Unbekannter Fehler'));
      setStep('error');
    }
  };

  const handlePermission = async () => {
    try {
      // Request camera permission explicitly
      await navigator.mediaDevices.getUserMedia({ video: true });
      await startScanner();
    } catch (err: any) {
      console.error('Permission error:', err);
      setErrorMsg('Kamera-Zugriff verweigert. Bitte erlaube den Zugriff in den Einstellungen.');
      setStep('error');
    }
  };

  const switchCamera = async (cameraId: string) => {
    await stopScanner();
    try {
      setStep('loading');
      scannerRef.current = new Html5Qrcode(containerId);
      await scannerRef.current.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopScanner();
          onScan(decodedText);
          onClose();
        },
        () => {}
      );
      setStep('scanning');
    } catch (err: any) {
      setErrorMsg('Kamera-Wechsel fehlgeschlagen: ' + err.message);
      setStep('error');
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={() => { stopScanner(); onClose(); }}
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
                  {step === 'permission' && 'Berechtigung erforderlich'}
                  {step === 'loading' && 'Wird gestartet...'}
                  {step === 'scanning' && 'Scanne...'}
                  {step === 'error' && 'Fehler'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => { stopScanner(); onClose(); }}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 'permission' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-payback-red to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Video className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-apple-gray-900 mb-2">Kamera aktivieren</h3>
              <p className="text-apple-gray-500 mb-6">
                Tippe auf den Button, um die Kamera zu starten.
              </p>
              <button
                onClick={handlePermission}
                className="apple-button-primary w-full py-4 text-lg"
              >
                <Camera className="w-5 h-5 inline mr-2" />
                Kamera starten
              </button>
            </div>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-payback-red animate-spin mb-4" />
              <p className="text-apple-gray-600">Kamera wird gestartet...</p>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-lg font-bold text-apple-gray-900 mb-2">Fehler</p>
              <p className="text-apple-gray-500 text-sm mb-6">{errorMsg}</p>
              <button
                onClick={() => setStep('permission')}
                className="apple-button-primary"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Erneut versuchen
              </button>
            </div>
          )}

          {step === 'scanning' && (
            <>
              {cameras.length > 1 && (
                <div className="mb-4">
                  <select
                    onChange={(e) => switchCamera(e.target.value)}
                    className="w-full bg-apple-gray-50 border border-apple-gray-200 rounded-xl px-4 py-2 text-sm"
                  >
                    {cameras.map((cam) => (
                      <option key={cam.id} value={cam.id}>
                        {cam.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Scanner Container - IMPORTANT: No overflow hidden, explicit dimensions */}
              <div 
                id={containerId}
                className="relative bg-black rounded-2xl"
                style={{ 
                  width: '100%', 
                  height: '350px',
                  minHeight: '350px'
                }}
              >
                {/* Overlay with scan frame */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  <div className="absolute inset-0 border-2 border-white/30 rounded-2xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-payback-red rounded-lg">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-t-4 border-l-4 border-payback-red rounded-tl-lg" />
                    <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-8 h-8 border-t-4 border-r-4 border-payback-red rounded-tr-lg" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 border-b-4 border-l-4 border-payback-red rounded-bl-lg" />
                    <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 w-8 h-8 border-b-4 border-r-4 border-payback-red rounded-br-lg" />
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-apple-gray-500 mt-4">
                Halte den Barcode in den roten Rahmen
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}