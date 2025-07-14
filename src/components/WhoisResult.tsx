import React, { useState, useEffect } from 'react';
import { scanWhois } from '../utils/scanUtils';

interface WhoisResultProps {
  url: string;
  onComplete?: () => void;
}

const WhoisResult: React.FC<WhoisResultProps> = ({ url, onComplete }) => {
  const [whoisData, setWhoisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [domainName, setDomainName] = useState('');

  useEffect(() => {
    const fetchWhoisData = async () => {
      setLoading(true);
      setError(null);
      setRetryCount(0);
      
      try {
        console.log('WHOIS Component - Starting scan for:', url);
        const data = await scanWhois(url);
        
        if (data && data.domain_name) {
          setDomainName(data.domain_name);
          setWhoisData(data);
          console.log('WHOIS Component - Success:', data);
        } else {
          throw new Error('No se pudieron obtener datos del dominio');
        }
      } catch (err) {
        console.error('WHOIS Component - Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
        onComplete?.();
      }
    };

    fetchWhoisData();
  }, [url, onComplete]);

  // Función para reintentar manualmente
  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    setError(null);
    
    try {
      console.log('WHOIS Component - Manual retry attempt:', retryCount + 1);
      const data = await scanWhois(url);
      
      if (data && data.domain_name) {
        setDomainName(data.domain_name);
        setWhoisData(data);
        console.log('WHOIS Component - Retry success:', data);
      } else {
        throw new Error('No se pudieron obtener datos del dominio');
      }
    } catch (err) {
      console.error('WHOIS Component - Retry error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Loading Header */}
          <div className="glass-card modern-shadow p-10 flex items-center space-x-8 animate-pulse">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center shadow-2xl">
              <div className="w-14 h-14 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card modern-shadow p-8 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Error Header */}
          <div className="glass-card modern-shadow p-10 flex items-center space-x-8">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-14 h-14 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-red-600 mb-2">Error en WHOIS</h3>
              <p className="text-red-500 text-lg">{error}</p>
              <p className="text-gray-500 mt-2">Intentos realizados: {retryCount}</p>
            </div>
          </div>

          {/* Retry Button */}
          <div className="glass-card modern-shadow p-8 mt-8 text-center">
            <button
              onClick={handleRetry}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Reintentar WHOIS
            </button>
            <p className="text-gray-500 mt-4">El servidor WHOIS puede estar temporalmente no disponible</p>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje amigable
  if (!whoisData || typeof whoisData !== 'object') {
    return (
      <div className="glass-card modern-shadow p-8 mb-6 animate-fadeInUp text-center">
        <h3 className="text-2xl font-bold gradient-text mb-2">Información WHOIS</h3>
        <p className="text-gray-500">No se pudo obtener información del dominio.</p>
      </div>
    );
  }

  // Valores seguros por defecto
  const registrar = whoisData.registrar || 'No disponible';
  const creationDate = whoisData.creation_date || 'No disponible';
  const expirationDate = whoisData.expiration_date || 'No disponible';
  const updatedDate = whoisData.updated_date || 'No disponible';
  const registrant = whoisData.registrant || {};
  const registrantName = registrant.name || 'No disponible';
  const registrantCountry = registrant.country || 'No disponible';
  const nameServers = Array.isArray(whoisData.name_servers) ? whoisData.name_servers : [];

  // Estado visual para expiración
  let expiryBadge = null;
  if (expirationDate && expirationDate !== 'No disponible') {
    try {
      const expiryDate = new Date(expirationDate);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        expiryBadge = <span className="modern-badge bg-red-100 text-red-700 ml-2 animate-pulse">Expirado</span>;
      } else if (diffDays < 30) {
        expiryBadge = <span className="modern-badge bg-yellow-100 text-yellow-700 ml-2 animate-pulse">Expira pronto</span>;
      } else {
        expiryBadge = <span className="modern-badge bg-green-100 text-green-700 ml-2">Activo</span>;
      }
    } catch {}
  }

  return (
    <div className="space-y-10">
      {/* Header Apple style */}
      <div className="glass-card modern-shadow p-10 flex items-center space-x-8 animate-fadeInUp">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-2xl">
          <svg className="w-14 h-14 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12h.01" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16h.01" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12h.01" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16h.01" />
          </svg>
        </div>
        <div>
          <h3 className="text-4xl font-bold gradient-text mb-2">Información WHOIS</h3>
          <div className="flex items-center space-x-3">
            <span className="font-mono text-2xl text-gray-900">{domainName}</span>
            {expiryBadge}
          </div>
          <p className="text-gray-500 mt-2 text-lg">Visualización minimalista y profesional del dominio</p>
        </div>
      </div>

      {/* Cards Apple style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="glass-card modern-shadow p-8 flex flex-col items-start animate-fadeInUp">
          <div className="flex items-center mb-3">
            <span className="modern-badge bg-blue-100 text-blue-700 mr-2">Dominio</span>
            <span className="font-mono font-semibold text-gray-900 text-lg">{domainName}</span>
          </div>
          <div className="flex items-center mb-3">
            <span className="modern-badge bg-purple-100 text-purple-700 mr-2">Registrador</span>
            <span className="font-semibold text-purple-900 text-base">{registrar}</span>
          </div>
        </div>
        <div className="glass-card modern-shadow p-8 flex flex-col items-start animate-fadeInUp">
          <div className="flex items-center mb-3">
            <span className="modern-badge bg-green-100 text-green-700 mr-2">Creación</span>
            <span className="font-semibold text-green-900 text-base">{creationDate}</span>
          </div>
          <div className="flex items-center mb-3">
            <span className="modern-badge bg-yellow-100 text-yellow-700 mr-2">Expiración</span>
            <span className="font-semibold text-yellow-900 text-base">{expirationDate}</span>
          </div>
          <div className="flex items-center mb-3">
            <span className="modern-badge bg-indigo-100 text-indigo-700 mr-2">Actualización</span>
            <span className="font-semibold text-indigo-900 text-base">{updatedDate}</span>
          </div>
        </div>
        <div className="glass-card modern-shadow p-8 flex flex-col items-start animate-fadeInUp">
          <div className="flex items-center mb-3">
            <span className="modern-badge bg-pink-100 text-pink-700 mr-2">Registrante</span>
            <span className="font-semibold text-pink-900 text-base">{registrantName}</span>
          </div>
          <div className="flex items-center mb-3">
            <span className="modern-badge bg-gray-100 text-gray-700 mr-2">País</span>
            <span className="font-semibold text-gray-900 text-base">{registrantCountry}</span>
          </div>
        </div>
        <div className="glass-card modern-shadow p-8 flex flex-col items-start animate-fadeInUp">
          <div className="flex items-center mb-3">
            <span className="modern-badge bg-teal-100 text-teal-700 mr-2">DNS</span>
            <span className="font-mono text-teal-900 text-base">
              {nameServers.length > 0
                ? nameServers.slice(0, 2).join(', ')
                : 'No disponible'}
            </span>
          </div>
          {nameServers.length > 2 && (
            <span className="text-xs text-gray-500 mt-1">+{nameServers.length - 2} más</span>
          )}
        </div>
      </div>

      {/* Card de análisis y recomendaciones Apple style */}
      <div className="glass-card modern-shadow p-8 mt-6 animate-fadeInUp">
        <div className="flex items-center mb-4">
          <span className="modern-badge bg-yellow-100 text-yellow-700 mr-2">Análisis</span>
          <span className="font-semibold text-yellow-900">{expiryBadge}</span>
        </div>
        <ul className="list-disc pl-8 text-gray-700 space-y-2 text-base">
          <li>Verifica la información de contacto regularmente</li>
          <li>Configura renovación automática si es posible</li>
          <li>Monitorea cambios en la información del dominio</li>
          <li>Mantén el registro actualizado</li>
        </ul>
      </div>
    </div>
  );
};

export default WhoisResult; 