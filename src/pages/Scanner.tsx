import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import WhoisResult from '../components/WhoisResult';
import NmapResult from '../components/NmapResult';
import FuzzingResult from '../components/FuzzingResult';
import { simulateScan, saveScanToStorage, generatePDFReport, generateScanId, Scan, ScanResult, scanFuzzing, scanNmap, scanWhois } from '../utils/scanUtils';

const Scanner = () => {
  const [url, setUrl] = useState('');
  const [scanType, setScanType] = useState('fuzzing');
  const [isScanning, setIsScanning] = useState(false);
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const scanTypes = [
    { id: 'fuzzing', name: 'Fuzzing', description: 'Búsqueda de directorios y archivos ocultos' },
    { id: 'nmap', name: 'Nmap Scan', description: 'Escaneo de puertos y servicios' },
    { id: 'whois', name: 'WHOIS Lookup', description: 'Información del dominio y registrante' },
  ];

  const handleScan = async () => {
    if (!url.trim()) {
      toast.error('Por favor, introduce una URL válida');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error('URL no válida. Asegúrate de incluir http:// o https://');
      return;
    }

    setIsScanning(true);
    const scanId = generateScanId();
    
    const newScan: Scan = {
      id: scanId,
      url,
      scan_type: scanType,
      timestamp: new Date().toISOString(),
      results: [],
      status: 'running'
    };

    setCurrentScan(newScan);
    toast.info('Iniciando escaneo...');

    try {
      let results: ScanResult[] = [];
      let extraResult: any = null;
      
      // Usar las funciones reales según el tipo de escaneo
      if (scanType === 'fuzzing') {
        results = await scanFuzzing(url);
      } else if (scanType === 'nmap') {
        extraResult = await scanNmap(url);
      } else if (scanType === 'whois') {
        // WHOIS ahora se maneja directamente en el componente
        extraResult = null;
      } else {
        // Fallback a simulación
        results = await simulateScan(url, scanType);
      }
      
      const completedScan: Scan = {
        ...newScan,
        results,
        extraResult,
        status: 'completed'
      };

      setCurrentScan(completedScan);
      setIsScanning(false);
      toast.success('¡Escaneo completado con éxito!');
      
    } catch (error) {
      console.error('Scan error:', error);
      const failedScan: Scan = {
        ...newScan,
        status: 'failed'
      };
      
      setCurrentScan(failedScan);
      setIsScanning(false);
      toast.error('Error durante el escaneo');
    }
  };

  const handleSaveScan = () => {
    if (!currentScan) return;
    
    saveScanToStorage(currentScan);
    toast.success('Escaneo guardado exitosamente');
  };

  const handleGenerateReport = () => {
    if (!currentScan) return;
    
    generatePDFReport(currentScan);
    toast.success('Reporte generado y descargado');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div>
        {/* Headeeerr */}
        <div className="hero-gradient text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
              v2.1.0
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Escáner de Seguridad
            </h1>
            <p className="text-xl text-blue-50 max-w-3xl mx-auto">
              Hola de nuevo, <span className="font-semibold">{user?.name}!</span> Analiza sitios web 
              como un Pentester profesional
            </p>
          </div>
        </div>

        {/* Scanner Form */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL a escanear
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de escaneo
                </label>
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white"
                >
                  {scanTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center py-4 text-lg"
                >
                  {isScanning ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciar Escaneo
                    </>
                  ) : (
                    'Iniciar Escaneo'
                  )}
                </button>

                {currentScan && currentScan.status === 'completed' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveScan}
                      className="flex-1 btn-primary"
                    >
                      Guardar Escaneo
                    </button>
                    <button
                      onClick={handleGenerateReport}
                      className="flex-1 btn-primary"
                    >
                      Generar Reporte con IA
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {currentScan && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Resultados del Escaneo</h2>
                {currentScan && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    currentScan.status === 'completed' ? 'bg-green-100 text-green-800' :
                    currentScan.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentScan.status === 'completed' && '✅ Completado'}
                    {currentScan.status === 'running' && '⏳ En progreso'}
                    {currentScan.status === 'failed' && '❌ Fallido'}
                  </span>
                )}
              </div>

              {isScanning && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <p className="text-blue-600 font-medium">Analizando {currentScan?.url}...</p>
                  <p className="text-gray-500 text-sm mt-2">Ejecutando {scanTypes.find(s => s.id === scanType)?.name}</p>
                </div>
              )}

              {currentScan && currentScan.status === 'completed' && (
                <div className="space-y-6">
                  {/* Mostrar resultados según el tipo de escaneo */}
                  {scanType === 'fuzzing' && currentScan.results.length > 0 && (
                    <FuzzingResult results={currentScan.results} />
                  )}
                  
                  {/* Mostrar resultados de WHOIS */}
                  {scanType === 'whois' && (
                    <WhoisResult url={currentScan.url} />
                  )}
                  
                  {/* Mostrar resultados de Nmap */}
                  {scanType === 'nmap' && currentScan.extraResult && (
                    <NmapResult result={currentScan.extraResult} />
                  )}
                  
                  {/* Mostrar mensaje si no hay resultados */}
                  {currentScan.results.length === 0 && !currentScan.extraResult && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron resultados</h3>
                      <p className="text-gray-500">El escaneo no detectó información relevante para este objetivo.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;
