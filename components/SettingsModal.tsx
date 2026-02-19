'use client';

import { useState, useRef } from 'react';
import { X, Download, Upload, FileJson, FileSpreadsheet, Bell, Check, AlertCircle } from 'lucide-react';
import { Coupon } from '@/types/coupon';
import { exportToJSON, exportToCSV, downloadFile, importFromJSON, importFromCSV, readFileAsText } from '@/lib/importExport';
import { getNotificationPermission, requestNotificationPermission } from '@/lib/notifications';

interface SettingsModalProps {
  coupons: Coupon[];
  onImport: (coupons: Coupon[]) => void;
  onClose: () => void;
}

export function SettingsModal({ coupons, onImport, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'notifications'>('export');
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [notificationStatus, setNotificationStatus] = useState(getNotificationPermission());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const json = exportToJSON(coupons);
    downloadFile(json, `payback-coupons-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(coupons);
    downloadFile(csv, `payback-coupons-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      let result;

      if (file.name.endsWith('.json')) {
        result = importFromJSON(content);
      } else if (file.name.endsWith('.csv')) {
        result = importFromCSV(content);
      } else {
        setImportResult({ success: false, message: 'Ungültiges Dateiformat. Bitte JSON oder CSV verwenden.' });
        return;
      }

      if (result.success && result.coupons) {
        onImport(result.coupons);
        setImportResult({ success: true, message: `${result.coupons.length} Coupons erfolgreich importiert!` });
      } else {
        setImportResult({ success: false, message: result.error || 'Import fehlgeschlagen' });
      }
    } catch (error) {
      setImportResult({ success: false, message: 'Fehler beim Lesen der Datei' });
    }
  };

  const handleRequestNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotificationStatus(permission);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-apple-gray-900 to-apple-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Einstellungen</h2>
            <button onClick={onClose} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-apple-gray-200">
          {[
            { id: 'export', label: 'Export', icon: Download },
            { id: 'import', label: 'Import', icon: Upload },
            { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-payback-red border-b-2 border-payback-red'
                  : 'text-apple-gray-500 hover:text-apple-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'export' && (
            <div className="space-y-4">
              <p className="text-apple-gray-600 text-sm">
                Exportiere deine Coupons als Backup oder zum Teilen.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportJSON}
                  className="apple-card p-4 text-center hover:border-payback-red transition-colors group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <FileJson className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="font-semibold text-apple-gray-900">Als JSON</p>
                  <p className="text-xs text-apple-gray-500 mt-1">Vollständige Daten</p>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="apple-card p-4 text-center hover:border-payback-red transition-colors group"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-semibold text-apple-gray-900">Als CSV</p>
                  <p className="text-xs text-apple-gray-500 mt-1">Für Excel</p>
                </button>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tipp:</strong> Speichere regelmäßig ein Backup deiner Coupons!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <p className="text-apple-gray-600 text-sm">
                Importiere Coupons aus einer Backup-Datei.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full apple-card p-6 text-center border-dashed border-2 border-apple-gray-300 hover:border-payback-red transition-colors"
              >
                <Upload className="w-10 h-10 text-apple-gray-400 mx-auto mb-3" />
                <p className="font-semibold text-apple-gray-900">Datei auswählen</p>
                <p className="text-xs text-apple-gray-500 mt-1">JSON oder CSV</p>
              </button>

              {importResult && (
                <div className={`rounded-2xl p-4 flex items-start gap-3 ${
                  importResult.success ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {importResult.success ? (
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {importResult.message}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className={`rounded-2xl p-4 ${
                notificationStatus.granted ? 'bg-green-50' : 'bg-yellow-50'
              }`}>
                <div className="flex items-center gap-3">
                  <Bell className={`w-6 h-6 ${
                    notificationStatus.granted ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                  <div>
                    <p className="font-semibold text-apple-gray-900">
                      {notificationStatus.granted ? 'Benachrichtigungen aktiviert' : 'Benachrichtigungen deaktiviert'}
                    </p>
                    <p className="text-sm text-apple-gray-600">
                      {notificationStatus.granted 
                        ? 'Du erhältst Erinnerungen vor Ablauf deiner Coupons.'
                        : 'Aktiviere Benachrichtigungen, um Erinnerungen zu erhalten.'}
                    </p>
                  </div>
                </div>
              </div>

              {!notificationStatus.granted && (
                <button
                  onClick={handleRequestNotifications}
                  className="w-full apple-button-primary"
                >
                  Benachrichtigungen aktivieren
                </button>
              )}

              <div className="bg-apple-gray-50 rounded-2xl p-4">
                <p className="text-sm text-apple-gray-600">
                  <strong>Erinnerungen:</strong>
                </p>
                <ul className="text-sm text-apple-gray-600 mt-2 space-y-1 list-disc list-inside">
                  <li>3 Tage vor Ablauf</li>
                  <li>1 Tag vor Ablauf</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}