import { Coupon } from '@/types/coupon';

export interface ExportData {
  version: string;
  exportDate: string;
  coupons: Coupon[];
}

export function exportToJSON(coupons: Coupon[]): string {
  const data: ExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    coupons,
  };
  
  return JSON.stringify(data, null, 2);
}

export function exportToCSV(coupons: Coupon[]): string {
  const headers = ['Titel', 'Beschreibung', 'Barcode', 'Typ', 'Gültig bis', 'Genutzt'];
  
  const rows = coupons.map(c => [
    `"${c.title}"`,
    `"${c.description || ''}"`,
    `"${c.barcode}"`,
    c.type,
    c.validUntil,
    c.used ? 'Ja' : 'Nein',
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importFromJSON(jsonString: string): { success: boolean; coupons?: Coupon[]; error?: string } {
  try {
    const data: ExportData = JSON.parse(jsonString);
    
    if (!data.coupons || !Array.isArray(data.coupons)) {
      return { success: false, error: 'Ungültiges Format: Keine Coupons gefunden' };
    }
    
    // Validate coupon structure
    const validCoupons = data.coupons.filter(c => 
      c.title && c.barcode && c.validUntil
    );
    
    return { 
      success: true, 
      coupons: validCoupons.map(c => ({
        ...c,
        id: crypto.randomUUID(), // Generate new IDs
        createdAt: new Date().toISOString(),
      }))
    };
  } catch (error) {
    return { success: false, error: 'Fehler beim Parsen der JSON-Datei' };
  }
}

export function importFromCSV(csvString: string): { success: boolean; coupons?: Coupon[]; error?: string } {
  try {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) {
      return { success: false, error: 'CSV-Datei ist leer oder ungültig' };
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    const coupons: Coupon[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      const coupon: Coupon = {
        id: crypto.randomUUID(),
        title: values[0] || '',
        description: values[1] || '',
        barcode: values[2] || '',
        type: (values[3] as any) || 'other',
        validUntil: values[4] || new Date().toISOString().split('T')[0],
        used: values[5] === 'Ja',
        barcodeType: 'CODE128',
        validFrom: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
      
      if (coupon.title && coupon.barcode) {
        coupons.push(coupon);
      }
    }
    
    return { success: true, coupons };
  } catch (error) {
    return { success: false, error: 'Fehler beim Parsen der CSV-Datei' };
  }
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}