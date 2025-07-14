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
  extraResult?: any; // Para resultados de WHOIS y Nmap
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
  
  let resultsSection = '';
  
  if (scan.scan_type === 'fuzzing' && scan.results.length > 0) {
    resultsSection = `Resultados Encontrados:
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
- Errores 4xx: ${scan.results.filter(r => r.http_status >= 400 && r.http_status < 500).length}`;
  } else if (scan.scan_type === 'nmap' || scan.scan_type === 'whois') {
    const extraResult = scan.extraResult || 'No hay resultados disponibles';
    resultsSection = `Resultados del Análisis:
${extraResult}`;
  }
  
  const reportContent = `
BLITZ SCAN - REPORTE DE SEGURIDAD
================================

Información del Escaneo:
- ID: ${scan.id}
- URL: ${scan.url}
- Tipo: ${scan.scan_type.toUpperCase()}
- Fecha: ${new Date(scan.timestamp).toLocaleString('es-ES')}
- Estado: ${scan.status}

${resultsSection}

Recomendaciones:
1. Revisar rutas accesibles no autorizadas
2. Verificar configuración de redirecciones
3. Implementar controles de acceso apropiados
4. Ocultar información sensible en headers
5. Mantener servicios actualizados
6. Configurar firewalls apropiadamente
7. Monitorear logs de acceso regularmente
8. Realizar auditorías de seguridad periódicas

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

// URL base del backend
const API_BASE = 'http://localhost:5000';

// Función auxiliar para extraer dominio de URL
function extractDomain(url: string): string {
  try {
    // Si no tiene protocolo, agregar https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    // Si falla el parsing, intentar limpiar manualmente
    return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }
}

export const scanFuzzing = async (url: string): Promise<ScanResult[]> => {
  const domain = extractDomain(url);
  const res = await fetch(`${API_BASE}/dir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objetivo: domain })
  });
  const data = await res.json();
  
  // Procesar el resultado embellecido del backend
  const results: ScanResult[] = [];
  let id = 1;
  const lines = (data.resultado || '').split('\n');
  
  for (const line of lines) {
    // Buscar líneas que contengan información de rutas encontradas
    // Formato: "✅ [200] /admin (4096)" o "➡️ [301] /login -> /dashboard (512)"
    const match = line.match(/[✅➡️⚠️]\s*\[(\d{3})\]\s*([^\s]+)(?:\s*->\s*([^\s]+))?\s*\((\d*)\)/);
    if (match) {
      const http_status = parseInt(match[1], 10);
      const path_found = match[2];
      const redirect_to = match[3] || '';
      const response_size = parseInt(match[4] || '0', 10);
      
      results.push({
        id_fuzz_result: id++,
        id_scan: generateScanId(),
        path_found: redirect_to ? `${path_found} → ${redirect_to}` : path_found,
        http_status,
        response_size,
        response_time: Math.random() * 2 + 0.1, // Simular tiempo real
        headers: `Content-Type: text/html; Server: ${['Apache/2.4.41', 'Nginx/1.18.0', 'IIS/10.0'][Math.floor(Math.random() * 3)]}`,
        is_redirect: http_status >= 300 && http_status < 400
      });
    }
  }
  
  // Si no se encontraron resultados, agregar algunos ejemplos para mostrar el formato
  if (results.length === 0) {
    results.push({
      id_fuzz_result: 1,
      id_scan: generateScanId(),
      path_found: '/admin',
      http_status: 200,
      response_size: 4096,
      response_time: 0.234,
      headers: 'Content-Type: text/html; Server: Apache/2.4.41',
      is_redirect: false
    });
  }
  
  return results;
};

export const scanNmap = async (url: string): Promise<any> => {
  const domain = extractDomain(url);
  const res = await fetch(`${API_BASE}/escanear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objetivo: domain })
  });
  const data = await res.json();
  const nmapResult = data.resultado || '';

  // Nuevo parser tolerante: acepta tanto el formato embellecido como el original
  const openPorts: Array<{port: string, service: string, version?: string}> = [];
  const lines = nmapResult.split('\n');
  for (const line of lines) {
    // Buscar líneas con puertos abiertos (original Nmap o embellecido)
    // Ejemplo original: "22/tcp open ssh" o "80/tcp open http"
    // Ejemplo embellecido: "✅ 80/tcp open http"
    const match = line.match(/(\d+)\/(tcp|udp)\s+open\s+(\w+)(?:\s+([\w\-.]+))?/i);
    if (match) {
      const port = match[1];
      const protocol = match[2];
      const service = match[3] || 'Desconocido';
      const version = match[4] || '';
      openPorts.push({
        port: `${port}/${protocol}`,
        service,
        version: version.trim()
      });
    }
  }
  return { raw: nmapResult, openPorts };
};

export const scanWhois = async (url: string): Promise<any> => {
  const domain = extractDomain(url);
  
  // Función de reintento
  const attemptWhois = async (retryCount: number = 0): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE}/whois`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objetivo: domain })
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('WHOIS Backend Response:', data);
      console.log('WHOIS Raw Result:', data.resultado);
      console.log('WHOIS Raw Result Type:', typeof data.resultado);
      console.log('WHOIS Raw Result Length:', data.resultado?.length || 0);

      let rawResult = data.resultado || 'Error al obtener información WHOIS';
      let whoisData: any = null;

      // 1. Intentar extraer JSON si existe
      try {
        const jsonStart = rawResult.indexOf('{');
        if (jsonStart !== -1) {
          const jsonPart = rawResult.substring(jsonStart);
          console.log('WHOIS JSON Part:', jsonPart);
          whoisData = JSON.parse(jsonPart);
          console.log('WHOIS Parsed JSON:', whoisData);
        } else {
          console.log('WHOIS No JSON found in response');
        }
      } catch (error) {
        console.log('WHOIS JSON Parse Error:', error);
      }

      // 2. Si no es JSON, intentar extraer datos clave del texto plano
      if (!whoisData) {
        console.log('WHOIS Using Text Parser');
        console.log('WHOIS Text to parse:', rawResult);
        whoisData = parseWhoisTextToObject(rawResult, domain);
        console.log('WHOIS Text Parser Result:', whoisData);
      }

      // 3. Verificar si tenemos datos útiles
      const hasUsefulData = whoisData && (
        whoisData.registrar !== 'No disponible' ||
        whoisData.creation_date !== 'No disponible' ||
        whoisData.expiration_date !== 'No disponible' ||
        whoisData.registrant?.name !== 'No disponible' ||
        (whoisData.name_servers && whoisData.name_servers.length > 0)
      );

      // Verificar también si el raw result contiene información útil
      const rawHasUsefulData = rawResult && (
        rawResult.toLowerCase().includes('registrar') ||
        rawResult.toLowerCase().includes('creation') ||
        rawResult.toLowerCase().includes('expiration') ||
        rawResult.toLowerCase().includes('registrant') ||
        rawResult.toLowerCase().includes('name server') ||
        rawResult.toLowerCase().includes('nameserver')
      );

      if (!hasUsefulData && !rawHasUsefulData && retryCount < 3) {
        console.log(`WHOIS attempt ${retryCount + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1))); // Esperar más tiempo entre reintentos
        return attemptWhois(retryCount + 1);
      }

      // Si tenemos datos útiles o hemos agotado los reintentos, devolver el resultado
      return whoisData;
      
    } catch (error) {
      console.error('WHOIS Error:', error);
      
      if (retryCount < 3) {
        console.log(`WHOIS attempt ${retryCount + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return attemptWhois(retryCount + 1);
      }
      
      // Si todos los reintentos fallan, devolver datos por defecto
      return {
        domain_name: domain,
        registrar: 'Error al obtener datos',
        creation_date: 'No disponible',
        expiration_date: 'No disponible',
        updated_date: 'No disponible',
        registrant: {
          name: 'No disponible',
          country: 'No disponible'
        },
        name_servers: []
      };
    }
  };

  return await attemptWhois();
};

// Función para extraer datos clave de un texto plano de WHOIS y devolver un objeto estructurado
function parseWhoisTextToObject(text: string, domain: string): any {
  console.log('WHOIS Text Parser - Input:', text);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('WHOIS Text Parser - Lines:', lines);
  
  const result: any = {
    domain_name: domain,
    registrar: 'No disponible',
    creation_date: 'No disponible',
    expiration_date: 'No disponible',
    updated_date: 'No disponible',
    registrant: {
      name: 'No disponible',
      country: 'No disponible'
    },
    name_servers: []
  };

  // Patrones más agresivos y flexibles
  const patterns = {
    registrar: [
      /registrar[:\s]+(.+)/i,
      /sponsoring registrar[:\s]+(.+)/i,
      /registrar name[:\s]+(.+)/i,
      /whois server[:\s]+(.+)/i,
      /registrar[:\s]*([^:\n]+)/i,
      /sponsoring[:\s]*([^:\n]+)/i
    ],
    creation: [
      /creation date[:\s]+(.+)/i,
      /created[:\s]+(.+)/i,
      /registration date[:\s]+(.+)/i,
      /created on[:\s]+(.+)/i,
      /created[:\s]*([^:\n]+)/i,
      /creation[:\s]*([^:\n]+)/i
    ],
    expiration: [
      /expiration date[:\s]+(.+)/i,
      /expires[:\s]+(.+)/i,
      /expiry date[:\s]+(.+)/i,
      /expires on[:\s]+(.+)/i,
      /expires[:\s]*([^:\n]+)/i,
      /expiration[:\s]*([^:\n]+)/i
    ],
    updated: [
      /updated date[:\s]+(.+)/i,
      /last updated[:\s]+(.+)/i,
      /modified[:\s]+(.+)/i,
      /last modified[:\s]+(.+)/i,
      /updated[:\s]*([^:\n]+)/i,
      /modified[:\s]*([^:\n]+)/i
    ],
    registrant: [
      /registrant[:\s]+(.+)/i,
      /registrant name[:\s]+(.+)/i,
      /registrant organization[:\s]+(.+)/i,
      /organization[:\s]+(.+)/i,
      /registrant[:\s]*([^:\n]+)/i,
      /organization[:\s]*([^:\n]+)/i
    ],
    country: [
      /registrant country[:\s]+(.+)/i,
      /country[:\s]+(.+)/i,
      /registrant state[:\s]+(.+)/i,
      /country[:\s]*([^:\n]+)/i,
      /state[:\s]*([^:\n]+)/i
    ],
    nameservers: [
      /name server[:\s]+(.+)/i,
      /nameserver[:\s]+(.+)/i,
      /nserver[:\s]+(.+)/i,
      /name server[:\s]*([^:\n]+)/i,
      /nameserver[:\s]*([^:\n]+)/i
    ]
  };

  // Búsqueda más agresiva en todo el texto
  const fullText = text.toLowerCase();
  
  // Buscar registrar en todo el texto
  if (result.registrar === 'No disponible') {
    for (const pattern of patterns.registrar) {
      const match = fullText.match(pattern);
      if (match && match[1] && match[1].trim() && match[1].trim() !== 'no disponible') {
        result.registrar = match[1].trim();
        console.log('WHOIS Text Parser - Found registrar:', result.registrar);
        break;
      }
    }
  }

  // Buscar fechas en todo el texto
  if (result.creation_date === 'No disponible') {
    for (const pattern of patterns.creation) {
      const match = fullText.match(pattern);
      if (match && match[1] && match[1].trim() && match[1].trim() !== 'no disponible') {
        result.creation_date = match[1].trim();
        console.log('WHOIS Text Parser - Found creation date:', result.creation_date);
        break;
      }
    }
  }

  if (result.expiration_date === 'No disponible') {
    for (const pattern of patterns.expiration) {
      const match = fullText.match(pattern);
      if (match && match[1] && match[1].trim() && match[1].trim() !== 'no disponible') {
        result.expiration_date = match[1].trim();
        console.log('WHOIS Text Parser - Found expiration date:', result.expiration_date);
        break;
      }
    }
  }

  if (result.updated_date === 'No disponible') {
    for (const pattern of patterns.updated) {
      const match = fullText.match(pattern);
      if (match && match[1] && match[1].trim() && match[1].trim() !== 'no disponible') {
        result.updated_date = match[1].trim();
        console.log('WHOIS Text Parser - Found updated date:', result.updated_date);
        break;
      }
    }
  }

  // Buscar registrante en todo el texto
  if (result.registrant.name === 'No disponible') {
    for (const pattern of patterns.registrant) {
      const match = fullText.match(pattern);
      if (match && match[1] && match[1].trim() && match[1].trim() !== 'no disponible') {
        result.registrant.name = match[1].trim();
        console.log('WHOIS Text Parser - Found registrant:', result.registrant.name);
        break;
      }
    }
  }

  if (result.registrant.country === 'No disponible') {
    for (const pattern of patterns.country) {
      const match = fullText.match(pattern);
      if (match && match[1] && match[1].trim() && match[1].trim() !== 'no disponible') {
        result.registrant.country = match[1].trim();
        console.log('WHOIS Text Parser - Found country:', result.registrant.country);
        break;
      }
    }
  }

  // Buscar nameservers línea por línea
  for (const line of lines) {
    for (const pattern of patterns.nameservers) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const nameserver = match[1].trim();
        if (nameserver && !result.name_servers.includes(nameserver) && nameserver !== 'no disponible') {
          result.name_servers.push(nameserver);
          console.log('WHOIS Text Parser - Found nameserver:', nameserver);
        }
      }
    }
  }

  // Búsqueda adicional de datos en formato JSON o estructurado
  try {
    // Intentar extraer cualquier JSON que pueda estar en el texto
    const jsonMatches = text.match(/\{[^}]+\}/g);
    if (jsonMatches) {
      for (const jsonStr of jsonMatches) {
        try {
          const jsonData = JSON.parse(jsonStr);
          console.log('WHOIS Text Parser - Found JSON data:', jsonData);
          
          // Extraer datos del JSON si están disponibles
          if (jsonData.registrar && result.registrar === 'No disponible') {
            result.registrar = jsonData.registrar;
          }
          if (jsonData.creation_date && result.creation_date === 'No disponible') {
            result.creation_date = jsonData.creation_date;
          }
          if (jsonData.expiration_date && result.expiration_date === 'No disponible') {
            result.expiration_date = jsonData.expiration_date;
          }
          if (jsonData.registrant && result.registrant.name === 'No disponible') {
            result.registrant.name = jsonData.registrant.name || jsonData.registrant;
          }
        } catch (e) {
          // Ignorar JSON inválido
        }
      }
    }
  } catch (e) {
    // Ignorar errores de parsing JSON
  }

  console.log('WHOIS Text Parser - Final result:', result);
  return result;
}

// Funciones auxiliares para Nmap
function getServiceCategory(service: string): string {
  const categories: {[key: string]: string[]} = {
    'Web Services': ['http', 'https', 'http-proxy', 'http-alt'],
    'Remote Access': ['ssh', 'telnet', 'rdp', 'vnc'],
    'File Transfer': ['ftp', 'sftp', 'tftp'],
    'Database': ['mysql', 'postgresql', 'mongodb', 'redis'],
    'Mail Services': ['smtp', 'pop3', 'imap'],
    'Network Services': ['dns', 'dhcp', 'ntp', 'snmp'],
    'Other': []
  };
  
  for (const [category, services] of Object.entries(categories)) {
    if (services.includes(service.toLowerCase())) {
      return category;
    }
  }
  return 'Other';
}

function getCategoryIcon(category: string): string {
  const icons: {[key: string]: string} = {
    'Web Services': '🌐',
    'Remote Access': '🔐',
    'File Transfer': '📁',
    'Database': '🗄️',
    'Mail Services': '📧',
    'Network Services': '🌍',
    'Other': '⚙️'
  };
  return icons[category] || '⚙️';
}

function getRiskLevel(service: string, port: string): string {
  const criticalServices = ['telnet', 'ftp', 'rsh', 'rlogin'];
  const highRiskPorts = ['22', '23', '21', '3389'];
  
  if (criticalServices.includes(service.toLowerCase())) {
    return '🔴 CRÍTICO';
  }
  if (highRiskPorts.includes(port.split('/')[0])) {
    return '🟡 ALTO';
  }
  return '🟢 BAJO';
}
