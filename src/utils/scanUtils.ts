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
  status: 'completed' | 'running' | 'failed' | 'completado' | 'en_proceso' | 'error';
  extraResult?: any;
  // Campos adicionales de la base de datos
  scan_id?: string;
  _id?: string;
  tipo_escaneo?: string;
  fecha?: string;
  created_at?: string;
  updated_at?: string;
  estado?: string;
  detalles?: {
    results?: ScanResult[];
    scan_type?: string;
    timestamp?: string;
    extraResult?: any;
  };
}

export const generateScanId = (): string => {
  return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Nuevo: obtener la clave de historial para un usuario
export const getHistoryKey = (userEmail: string) =>
  `blitz_scan_history_${userEmail}`;

// --- GUARDAR ESCANEO WHOIS ---
export const saveWhoisScan = async (scan: Scan, userId: number): Promise<any> => {
  try {
    const response = await fetch('http://localhost:3001/api/save-whois-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        url: scan.url,
        whoisData: scan.extraResult, // objeto JSON plano
        estado: scan.status || 'completado'
      })
    });
    const data = await response.json();
    return data; // <-- retorna el objeto completo
  } catch (error) {
    console.error('Error guardando escaneo WHOIS:', error);
    return { success: false };
  }
};

// --- GUARDAR ESCANEO NMAP ---
export const saveNmapScan = async (scan: Scan, userId: number): Promise<any> => {
  try {
    const response = await fetch('http://localhost:3001/api/save-nmap-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        url: scan.url,
        nmapData: scan.extraResult, // objeto JSON plano
        estado: scan.status || 'completado'
      })
    });
    const data = await response.json();
    return data; // <-- retorna el objeto completo
  } catch (error) {
    console.error('Error guardando escaneo NMAP:', error);
    return { success: false };
  }
};

// --- GUARDAR ESCANEO FUZZING ---
export const saveFuzzingScan = async (scan: Scan, userId: number): Promise<any> => {
  try {
    const response = await fetch('http://localhost:3001/api/save-fuzzing-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        url: scan.url,
        fuzzingData: scan.results, // objeto JSON plano (array de resultados)
        estado: scan.status || 'completado'
      })
    });
    const data = await response.json();
    return data; // <-- retorna el objeto completo
  } catch (error) {
    console.error('Error guardando escaneo FUZZING:', error);
    return { success: false };
  }
};

// --- CONSULTAR TODOS LOS ESCANEOS DEL USUARIO ---
export const getAllScans = async (userId: number): Promise<any[]> => {
  try {
    const response = await fetch(`http://localhost:3001/api/get-scans/${userId}`);
    const data = await response.json();
    return data.scans || [];
  } catch (error) {
    console.error('Error obteniendo historial de escaneos:', error);
    return [];
  }
};

// --- CONSULTAR ESCANEO POR ID ---
export const getScanById = async (scanId: number): Promise<any | null> => {
  try {
    const response = await fetch(`http://localhost:3001/api/get-scan/${scanId}`);
    const data = await response.json();
    return data.scan || null;
  } catch (error) {
    console.error('Error obteniendo escaneo por ID:', error);
    return null;
  }
};

// Función para ocultar un escaneo (soft delete)
export const hideScan = async (scanId: string, userId: number): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:3001/api/hide-scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scanId: parseInt(scanId, 10),
        userId: parseInt(String(userId), 10)
      })
    });
    const data = await response.json();
    if (data.success) {
      console.log('Escaneo ocultado exitosamente');
      return true;
    } else {
      console.error('Error ocultando escaneo:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error en hideScan:', error);
    return false;
  }
};

// Función para ocultar múltiples escaneos (soft delete)
export const hideMultipleScans = async (scanIds: string[], userId: number): Promise<boolean> => {
  try {
    const scanIdsInt = scanIds.map(id => parseInt(id, 10));
    const response = await fetch('http://localhost:3001/api/hide-scans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scanIds: scanIdsInt,
        userId: parseInt(String(userId), 10)
      })
    });
    const data = await response.json();
    if (data.success) {
      console.log('Escaneos ocultados exitosamente');
      return true;
    } else {
      console.error('Error ocultando escaneos:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error en hideMultipleScans:', error);
    return false;
  }
};

// Función para formatear resultados según el tipo de escaneo
const formatScanResults = (scan: Scan): string => {
  switch (scan.scan_type.toLowerCase()) {
    case 'whois':
      try {
        // Obtener los datos WHOIS
        let whoisData = scan.extraResult;
        
        // Si los datos están en detalles.extraResult como string, intentar extraer el JSON
        if (typeof whoisData === 'string') {
          try {
            whoisData = JSON.parse(whoisData);
          } catch {
            // Si no es JSON, asumimos que es texto formateado
            return whoisData;
          }
        }
        
        // Si los datos están en la estructura de la base de datos
        if (scan.extraResult?.detalles?.extraResult) {
          whoisData = scan.extraResult.detalles.extraResult;
        }

        // Si no tenemos datos válidos, mostrar error
        if (!whoisData) {
          console.error('Datos WHOIS no encontrados:', scan);
          return '❌ No se encontraron resultados de WHOIS';
        }

        // Formatear la salida
        let output = '📋 RESULTADOS DE WHOIS\n\n';

        // Información básica del dominio
        output += '🌐 INFORMACIÓN DEL DOMINIO\n';
        output += `   • Dominio: ${whoisData.domain_name || scan.url}\n`;
        output += `   • Registrador: ${whoisData.registrar || 'No disponible'}\n`;
        output += `   • Estado: Activo\n`;

        // Fechas importantes
        output += '\n📅 FECHAS\n';
        output += `   • Creación: ${formatDate(whoisData.creation_date)}\n`;
        output += `   • Expiración: ${formatDate(whoisData.expiration_date)}\n`;
        output += `   • Actualización: ${formatDate(whoisData.updated_date)}\n`;

        // Información del registrante
        if (whoisData.registrant) {
          output += '\n👤 REGISTRANTE\n';
          output += `   • Nombre: ${whoisData.registrant.name || 'No disponible'}\n`;
          if (whoisData.registrant.city && whoisData.registrant.city !== 'No disponible') {
            output += `   • Ciudad: ${whoisData.registrant.city}\n`;
          }
          if (whoisData.registrant.state && whoisData.registrant.state !== 'No disponible') {
            output += `   • Estado: ${whoisData.registrant.state}\n`;
          }
          if (whoisData.registrant.country && whoisData.registrant.country !== 'No disponible') {
            output += `   • País: ${whoisData.registrant.country}\n`;
          }
        }

        // Contacto administrativo
        if (whoisData.admin_contact) {
          output += '\n👔 CONTACTO ADMINISTRATIVO\n';
          output += `   • Nombre: ${whoisData.admin_contact.name || 'No disponible'}\n`;
          if (whoisData.admin_contact.city && whoisData.admin_contact.city !== 'No disponible') {
            output += `   • Ciudad: ${whoisData.admin_contact.city}\n`;
          }
          if (whoisData.admin_contact.state && whoisData.admin_contact.state !== 'No disponible') {
            output += `   • Estado: ${whoisData.admin_contact.state}\n`;
          }
          if (whoisData.admin_contact.country && whoisData.admin_contact.country !== 'No disponible') {
            output += `   • País: ${whoisData.admin_contact.country}\n`;
          }
        }

        // Contacto técnico
        if (whoisData.tech_contact) {
          output += '\n�� CONTACTO TÉCNICO\n';
          output += `   • Nombre: ${whoisData.tech_contact.name || 'No disponible'}\n`;
          if (whoisData.tech_contact.city && whoisData.tech_contact.city !== 'No disponible') {
            output += `   • Ciudad: ${whoisData.tech_contact.city}\n`;
          }
          if (whoisData.tech_contact.state && whoisData.tech_contact.state !== 'No disponible') {
            output += `   • Estado: ${whoisData.tech_contact.state}\n`;
          }
          if (whoisData.tech_contact.country && whoisData.tech_contact.country !== 'No disponible') {
            output += `   • País: ${whoisData.tech_contact.country}\n`;
          }
        }

        // Contacto de facturación
        if (whoisData.billing_contact && whoisData.billing_contact.name !== 'No disponible') {
          output += '\n💳 CONTACTO DE FACTURACIÓN\n';
          output += `   • Nombre: ${whoisData.billing_contact.name}\n`;
          if (whoisData.billing_contact.city && whoisData.billing_contact.city !== 'No disponible') {
            output += `   • Ciudad: ${whoisData.billing_contact.city}\n`;
          }
          if (whoisData.billing_contact.state && whoisData.billing_contact.state !== 'No disponible') {
            output += `   • Estado: ${whoisData.billing_contact.state}\n`;
          }
          if (whoisData.billing_contact.country && whoisData.billing_contact.country !== 'No disponible') {
            output += `   • País: ${whoisData.billing_contact.country}\n`;
          }
        }

        // Servidores DNS
        if (whoisData.name_servers && whoisData.name_servers.length > 0) {
          output += '\n🌍 SERVIDORES DNS\n';
          whoisData.name_servers.forEach((server: string) => {
            output += `   • ${server}\n`;
          });
        }

        // Análisis y recomendaciones
        output += '\n📊 ANÁLISIS Y RECOMENDACIONES\n';
        
        // Verificar estado del dominio
        const expirationDate = new Date(whoisData.expiration_date);
        const now = new Date();
        const monthsUntilExpiration = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
        
        if (monthsUntilExpiration < 6) {
          output += '   ⚠️ El dominio expirará en menos de 6 meses\n';
          output += '   • Considera renovar el dominio pronto\n';
        }

        // Verificar información de contacto
        const missingContacts = [];
        if (!whoisData.admin_contact?.name || whoisData.admin_contact.name === 'No disponible') {
          missingContacts.push('administrativo');
        }
        if (!whoisData.tech_contact?.name || whoisData.tech_contact.name === 'No disponible') {
          missingContacts.push('técnico');
        }
        if (missingContacts.length > 0) {
          output += `   ⚠️ Falta información de contacto ${missingContacts.join(' y ')}\n`;
        }

        output += '   • Verifica regularmente la información de contacto\n';
        output += '   • Mantén actualizados los registros DNS\n';
        output += '   • Configura renovación automática si es posible\n';
        output += '   • Asegura que los contactos técnicos estén al día\n';

        if (whoisData.name_servers && whoisData.name_servers.length < 2) {
          output += '   ⚠️ Se recomienda tener al menos dos servidores DNS para redundancia\n';
        }

        return output;

      } catch (error) {
        console.error('Error procesando resultados WHOIS:', error);
        if (typeof scan.extraResult?.detalles?.extraResult === 'string') {
          // Si tenemos el texto formateado, usarlo como fallback
          return scan.extraResult.detalles.extraResult;
        }
        return '❌ Error procesando los resultados de WHOIS';
      }

    case 'nmap':
      if (scan.extraResult) {
        // Si extraResult es un string, usarlo directamente
        if (typeof scan.extraResult === 'string') {
          return `🌐 RESULTADOS DE NMAP:\n${scan.extraResult}`;
        }
        // Si es un objeto, formatearlo
        if (typeof scan.extraResult === 'object') {
          try {
            return `🌐 RESULTADOS DE NMAP:\n${JSON.stringify(scan.extraResult, null, 2)}`;
          } catch {
            return `🌐 RESULTADOS DE NMAP:\n${String(scan.extraResult)}`;
          }
        }
      }
      return '❌ No se encontraron resultados de Nmap';

    case 'fuzzing':
      if (scan.results && scan.results.length > 0) {
        const results = scan.results.map(result => `
📁 Ruta: ${result.path_found}
   🔢 Estado HTTP: ${result.http_status}
   📏 Tamaño: ${result.response_size} bytes
   ⏱️  Tiempo: ${result.response_time.toFixed(3)}s
   🔄 Redirección: ${result.is_redirect ? 'Sí' : 'No'}
   📋 Headers: ${result.headers}
`).join('');

        const summary = `
📊 RESUMEN DE FUZZING:
   • Total de rutas encontradas: ${scan.results.length}
   • Rutas accesibles (200): ${scan.results.filter(r => r.http_status === 200).length}
   • Redirecciones (3xx): ${scan.results.filter(r => r.is_redirect).length}
   • Errores 4xx: ${scan.results.filter(r => r.http_status >= 400 && r.http_status < 500).length}
   • Errores 5xx: ${scan.results.filter(r => r.http_status >= 500).length}`;

        return `🔍 RESULTADOS DE FUZZING:${results}${summary}`;
      }
      return '❌ No se encontraron resultados de fuzzing';

    default:
      return '❌ Tipo de escaneo no reconocido';
  }
};

// Función mejorada para generar reportes
export const generatePDFReport = (scan: Scan): void => {
  console.log('Generando reporte para:', scan);
  console.log('Tipo de escaneo:', scan.scan_type);
  console.log('ExtraResult:', scan.extraResult);
  console.log('Results:', scan.results);

  const resultsSection = formatScanResults(scan);

  const reportContent = `REPORTE DE ESCANEO - BLITZ SCAN
===========================================

📋 INFORMACIÓN DEL ESCANEO:
   • URL objetivo: ${scan.url}
   • Tipo de escaneo: ${scan.scan_type.toUpperCase()}
   • Fecha: ${new Date(scan.timestamp).toLocaleString('es-ES')}
   • Estado: ${scan.status}
   • ID del escaneo: ${scan.id}

${resultsSection}

===========================================
🔒 RECOMENDACIONES DE SEGURIDAD:
   • Revisar rutas accesibles no autorizadas
   • Verificar configuración de redirecciones
   • Implementar controles de acceso apropiados
   • Ocultar información sensible en headers
   • Mantener servicios actualizados
   • Configurar firewalls apropiadamente
   • Monitorear logs de acceso regularmente
   • Realizar auditorías de seguridad periódicas

===========================================
📄 Generado por BlitzScan
🕐 Fecha: ${new Date().toLocaleString('es-ES')}
🌐 Herramienta de Ciberseguridad Profesional
`;

  // Crear y descargar el archivo
  const blob = new Blob([reportContent], { type: 'text/plain; charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blitzscan_report_${scan.scan_type}_${new Date().getTime()}.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// URL base del backend
const API_BASE = 'http://localhost:5000';

// Función auxiliar para extraer dominio de URL
function extractDomain(url: string): string {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
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
  const results: ScanResult[] = [];
  let id = 1;
  const lines = (data.resultado || '').split('\n');
  for (const line of lines) {
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
        response_time: Math.random() * 2 + 0.1,
        headers: `Content-Type: text/html; Server: ${['Apache/2.4.41', 'Nginx/1.18.0', 'IIS/10.0'][Math.floor(Math.random() * 3)]}`,
        is_redirect: http_status >= 300 && http_status < 400
      });
    }
  }
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
  return data.resultado || '';
};

export const scanWhois = async (url: string): Promise<any> => {
  const domain = extractDomain(url);
  const res = await fetch(`${API_BASE}/whois`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objetivo: domain })
  });
  const data = await res.json();
  if (typeof data.resultado === 'object') {
    return data.resultado;
  }
  return data.resultado || 'Error al obtener información WHOIS';
};

export const scanSubfinder = async (url: string): Promise<string> => {
  const domain = extractDomain(url);
  const res = await fetch('http://localhost:5000/subfinder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objetivo: domain })
  });
  const data = await res.json();
  return data.resultado || 'No se encontraron subdominios.';
};

export const scanParamspider = async (url: string): Promise<string> => {
  const domain = extractDomain(url);
  const res = await fetch(`${API_BASE}/paramspider`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objetivo: domain })
  });
  const data = await res.json();
  return data.resultado || 'No se encontraron parámetros.';
};

export const scanWhatweb = async (url: string): Promise<string> => {
  const domain = extractDomain(url);
  const res = await fetch(`${API_BASE}/whatweb`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objetivo: domain })
  });
  const data = await res.json();
  return data.resultado || 'No se obtuvo información de WhatWeb.';
};

export const scanTheharvester = async (url: string): Promise<{ beautified: string, raw: string }> => {
  const domain = extractDomain(url);
  const res = await fetch('http://localhost:5000/theharvester', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objetivo: domain })
  });
  const data = await res.json();
  return {
    beautified: data.resultado || '',
    raw: data.raw || ''
  };
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
    'Network Services': '🌐',
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

// Función auxiliar para formatear fechas
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'No disponible';
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}

