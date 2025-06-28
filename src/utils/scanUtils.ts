export interface ScanResult {
  id_fuzz_result: number;
  id_scan: string;
  path_found: string;
  http_status: number;
  response_size: number;
  response_time: number;
  headers: string;
  is_redirect: boolean;
}

export interface Scan {
  id: string;
  url: string;
  scan_type: string;
  timestamp: string;
  results: ScanResult[];
  status: 'completed' | 'running' | 'failed';
}

export const generateScanId = (): string => {
  return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const simulateScan = async (url: string, scanType: string): Promise<ScanResult[]> => {
  // Simulate scan delay
  await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

  const paths = ['/admin', '/backup', '/config', '/login', '/dashboard', '/api', '/uploads', '/test'];
  const results: ScanResult[] = [];

  for (let i = 0; i < Math.min(paths.length, 5 + Math.floor(Math.random() * 3)); i++) {
    const path = paths[i];
    const status = [200, 301, 302, 403, 404, 500][Math.floor(Math.random() * 6)];
    
    results.push({
      id_fuzz_result: i + 1,
      id_scan: generateScanId(),
      path_found: path,
      http_status: status,
      response_size: Math.floor(Math.random() * 10000) + 500,
      response_time: Math.random() * 2,
      headers: `Content-Type: text/html; Server: ${['Apache/2.4.41', 'Nginx/1.18.0', 'IIS/10.0'][Math.floor(Math.random() * 3)]}`,
      is_redirect: status >= 300 && status < 400
    });
  }

  return results;
};

export const saveScanToStorage = (scan: Scan): void => {
  const existingScans = getSavedScans();
  existingScans.unshift(scan); // Add to beginning
  
  // Keep only last 50 scans
  if (existingScans.length > 50) {
    existingScans.splice(50);
  }
  
  localStorage.setItem('blitz_scan_history', JSON.stringify(existingScans));
};

export const getSavedScans = (): Scan[] => {
  const saved = localStorage.getItem('blitz_scan_history');
  return saved ? JSON.parse(saved) : [];
};

export const generatePDFReport = (scan: Scan): void => {
  // In a real application, this would generate a proper PDF
  // For now, we'll create a downloadable text report
  
  const reportContent = `
BLITZ SCAN - REPORTE DE SEGURIDAD
================================

Información del Escaneo:
- ID: ${scan.id}
- URL: ${scan.url}
- Tipo: ${scan.scan_type.toUpperCase()}
- Fecha: ${new Date(scan.timestamp).toLocaleString('es-ES')}
- Estado: ${scan.status}

Resultados Encontrados:
${scan.results.map(result => `
- Ruta: ${result.path_found}
  Estado HTTP: ${result.http_status}
  Tamaño: ${result.response_size} bytes
  Tiempo de respuesta: ${result.response_time.toFixed(3)}s
  Es redirección: ${result.is_redirect ? 'Sí' : 'No'}
  Headers: ${result.headers}
`).join('')}

Resumen:
- Total de rutas encontradas: ${scan.results.length}
- Rutas accesibles (200): ${scan.results.filter(r => r.http_status === 200).length}
- Redirecciones: ${scan.results.filter(r => r.is_redirect).length}
- Errores 4xx: ${scan.results.filter(r => r.http_status >= 400 && r.http_status < 500).length}

Recomendaciones:
1. Revisar rutas accesibles no autorizadas
2. Verificar configuración de redirecciones
3. Implementar controles de acceso apropiados
4. Ocultar información sensible en headers

---
Generado por BLITZ SCAN - Herramienta de Ciberseguridad
  `.trim();

  // Create and download the report
  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blitz-scan-report-${scan.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
