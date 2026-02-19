'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Camera, Scan, Loader2, RefreshCw, Video } from 'lucide-react';
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
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        // Ignore
      }
      scannerRef.current = null;
    }
  }, []);

  const requestPermission = async () => {
    try {
      setStep('loading');
      
      // First, explicitly request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Stop the preview stream
      stream.getTracks().forEach(track => track.stop());
      
      // Now get available cameras
      const devices = await Html5Qrcode.getCameras();
      
      if (devices && devices.length > 0) {
        setCameras(devices);
        await startScanner(devices[0].id);
      } else {
        setErrorMsg('Keine Kamera gefunden');
        setStep('error');
      }
    } catch (err: any) {
      console.error('Permission error:', err);
      
      if (err.name === 'NotAllowedError') {
        setErrorMsg('Kamera-Zugriff verweigert. Bitte erlaube den Zugriff in den Browsereinstellungen.');
      } else if (err.name === 'NotFoundError') {
        setErrorMsg('Keine Kamera gefunden auf diesem Gerät.');
      } else {
        setErrorMsg('Fehler beim Zugriff auf die Kamera: ' + err.message);
      }
      setStep('error');
    }
  };

  const startScanner = async (cameraId: string) => {
    if (!videoContainerRef.current) return;
    
    try {
      setStep('loading');
      
      // Create unique ID for the container
      const containerId = 'qr-reader-' + Date.now();
      videoContainerRef.current.id = containerId;
      
      // Create scanner instance
      scannerRef.current = new Html5Qrcode(containerId);
      
      // Start scanning
      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Success - stop scanner and return
          stopScanner();
          onScan(decodedText);
          onClose();
        },
        (errorMessage) => {
          // QR code not found yet - this is normal, ignore
        }
      );
      
      setStep('scanning');
    } catch (err: any) {
      console.error('Start scanner error:', err);
      setErrorMsg('Scanner konnte nicht gestartet werden: ' + err.message);
      setStep('error');
    }
  };

  const switchCamera = async (cameraId: string) => {
    await stopScanner();
    await startScanner(cameraId);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={handleClose}
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
                  {step === 'scanning' && 'Halte den Code vor die Kamera'}
                  {step === 'error' && 'Fehler aufgetreten'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleClose}
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
              <h3 className="text-xl font-bold text-apple-gray-900 mb-2">Kamera-Zugriff</h3>
              <p className="text-apple-gray-500 mb-6">
                Um Barcodes zu scannen, benötigt die App Zugriff auf deine Kamera.
              </p>
              <button
                onClick={requestPermission}
                className="apple-button-primary w-full py-4 text-lg"
              >
                <Camera className="w-5 h-5 inline mr-2" />
                Kamera aktivieren
              </button>
              <p className="text-xs text-apple-gray-400 mt-4">
                Deine Kamera-Daten werden nur lokal verarbeitet und nicht gespeichert.
              </p>
            </div>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-payback-red animate-spin mb-4" />
              <p className="text-apple-gray-600 font-medium">Kamera wird gestartet...</p>
              <p className="text-apple-gray-400 text-sm mt-2">Bitte warten</p>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-apple-gray-900 mb-2">Fehler</h3>
              <p className="text-apple-gray-500 text-sm mb-6">{errorMsg}</p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setStep('permission')}
                  className="apple-button-primary flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Erneut versuchen
                </button>
                <button
                  onClick={handleClose}
                  className="apple-button-secondary"
                >
                  Schließen
                </button>
              </div>
            </div>
          )}

          {step === 'scanning' && (
            <>
              {/* Camera Switcher */}
              {cameras.length > 1 && (
                <div className="mb-4">
                  <select
                    onChange={(e) => switchCamera(e.target.value)}
                    className="w-full bg-apple-gray-50 border border-apple-gray-200 rounded-xl px-4 py-2 text-sm"
                    defaultValue={cameras[0].id}
                  >
                    {cameras.map((cam) => (
                      <option key={cam.id} value={cam.id}>
                        {cam.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Scanner Container */}
              <div 
                ref={videoContainerRef}
                className="relative rounded-2xl overflow-hidden bg-black aspect-square"
              >
                {/* Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-white/30 rounded-2xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-payback-red rounded-lg">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-t-4 border-l-4 border-payback-red rounded-tl-lg" />
                    <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-8 h-8 border-t-4 border-r-4 border-payback-red rounded-tr-lg" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 border-b-4 border-l-4 border-payback-red rounded-bl-lg" />
                    <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 w-8 h-8 border-b-4 border-r-4 border-payback-red rounded-br-lg" />
                  </div>
                  {/* Scan line animation */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-payback-red animate-ping" 
                       style={{ animationDuration: '2s' }} />
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