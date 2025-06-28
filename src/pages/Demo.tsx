import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Demo = () => {
  const [selectedScan, setSelectedScan] = useState('fuzzing');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [url, setUrl] = useState('https://demo.example.com');

  const scanTypes = [
    { id: 'fuzzing', name: 'Fuzzing', description: 'Búsqueda de directorios y archivos ocultos' },
    { id: 'nmap', name: 'Nmap Scan', description: 'Escaneo de puertos y servicios' },
    { id: 'whois', name: 'WHOIS Lookup', description: 'Información del dominio y registrante' },
    { id: 'sqli', name: 'SQL Injection', description: 'Detección de vulnerabilidades SQLi' },
    { id: 'xss', name: 'XSS Detection', description: 'Búsqueda de vulnerabilidades XSS' }
  ];

  const dummyResults = [
    {
      id_fuzz_result: 1,
      id_scan: 'demo_001',
      path_found: '/admin',
      http_status: 200,
      response_size: 4096,
      response_time: 0.234,
      headers: 'Content-Type: text/html; Server: Apache/2.4.41',
      is_redirect: false
    },
    {
      id_fuzz_result: 2,
      id_scan: 'demo_001',
      path_found: '/backup',
      http_status: 403,
      response_size: 1024,
      response_time: 0.156,
      headers: 'Content-Type: text/html; Server: Apache/2.4.41',
      is_redirect: false
    },
    {
      id_fuzz_result: 3,
      id_scan: 'demo_001',
      path_found: '/config.php',
      http_status: 200,
      response_size: 2048,
      response_time: 0.189,
      headers: 'Content-Type: application/x-php; Server: Apache/2.4.41',
      is_redirect: false
    },
    {
      id_fuzz_result: 4,
      id_scan: 'demo_001',
      path_found: '/login',
      http_status: 302,
      response_size: 512,
      response_time: 0.098,
      headers: 'Location: /dashboard; Content-Type: text/html',
      is_redirect: true
    }
  ];

  const handleScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    
    // Simulate scan process
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 3000);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-yellow-600';
    if (status >= 400 && status < 500) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div>
        {/* Header azul degradado */}
        <div className="bg-gradient-to-br from-[#4f8cff] to-[#3887f6] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-full text-sm font-medium mb-6 text-yellow-800">
              ⚠️ Modo Demo - Datos simulados para demostración
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Demo de Escáner de Seguridad
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Experimenta las capacidades de nuestra herramienta de ciberseguridad con datos de demostración
            </p>
          </div>
        </div>

        {/* Scanner Form */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
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
                  value={selectedScan}
                  onChange={(e) => setSelectedScan(e.target.value)}
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                >
                  {isScanning ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Escaneando...
                    </>
                  ) : (
                    'Iniciar Escaneo Demo'
                  )}
                </button>

                <div className="pt-4 border-t border-gray-200">
                  <Link to="/register" className="w-full border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 text-center block">
                    Crear Cuenta Completa
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Resultados del Escaneo</h2>
              {scanComplete && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-sm">
                  ✅ Completado
                </span>
              )}
            </div>

            {!scanComplete && !isScanning && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">Inicia un escaneo para ver los resultados</p>
              </div>
            )}

            {isScanning && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                  <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-blue-600 font-medium">Analizando objetivo...</p>
                <p className="text-gray-500 text-sm mt-2">Esto puede tomar unos momentos</p>
              </div>
            )}

            {scanComplete && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-4 text-gray-700 font-semibold">Ruta Encontrada</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-semibold">Status</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-semibold">Tamaño</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-semibold">Tiempo</th>
                      <th className="text-left py-4 px-4 text-gray-700 font-semibold">Redirect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dummyResults.map((result) => (
                      <tr key={result.id_fuzz_result} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-gray-900 font-mono text-sm">{result.path_found}</td>
                        <td className={`py-4 px-4 font-semibold ${getStatusColor(result.http_status)}`}>
                          {result.http_status}
                        </td>
                        <td className="py-4 px-4 text-gray-600">{result.response_size}B</td>
                        <td className="py-4 px-4 text-gray-600">{result.response_time.toFixed(3)}s</td>
                        <td className="py-4 px-4">
                          {result.is_redirect ? (
                            <span className="text-yellow-600">✓</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 text-sm">
                    <strong>Resumen:</strong> Se encontraron {dummyResults.length} rutas. 
                    Se detectaron {dummyResults.filter(r => r.http_status === 200).length} recursos accesibles 
                    y {dummyResults.filter(r => r.is_redirect).length} redirecciones.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
