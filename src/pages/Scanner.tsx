import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import WhoisResult from '../components/WhoisResult';
import NmapResult from '../components/NmapResult';
import FuzzingResult from '../components/FuzzingResult';

import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { ChartContainer } from '../components/ui/chart';
import * as RechartsPrimitive from 'recharts';
import ChatbotModal from '../components/ChatbotModal';
import { generatePDFReport, generateScanId, Scan, ScanResult, scanFuzzing, scanNmap, scanWhois, saveWhoisScan, saveNmapScan, saveFuzzingScan } from '../utils/scanUtils';

// Extender Scan para incluir rawHarvester opcional si no está en la interfaz global
// (esto es solo para TypeScript, no afecta la lógica)
type ScanWithHarvester = Scan & { rawHarvester?: string };

const Scanner = () => {
  const [url, setUrl] = useState('');
  const [scanType, setScanType] = useState('fuzzing');
  const [isScanning, setIsScanning] = useState(false);
  const [currentScan, setCurrentScan] = useState<ScanWithHarvester | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const resultRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [scanSaved, setScanSaved] = useState(false); // Nuevo: para saber si el escaneo fue guardado
  const [saveScanClicked, setSaveScanClicked] = useState(false); // Para evitar doble guardado
  const [latestNmapScan, setLatestNmapScan] = useState<any | null>(null); // Nuevo: para guardar el escaneo Nmap más reciente
  const [chatbotOpen, setChatbotOpen] = useState(false); // Para mostrar el modal
  const [chatbotMessages, setChatbotMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  const [chatbotLoading, setChatbotLoading] = useState(false);
  const [chatInput, setChatInput] = useState(''); // Para el input del chat flotante
  const [dbScanId, setDbScanId] = useState<number | null>(null);

  // Nuevo: estado para categoría seleccionada
  const scanCategories = [
    {
      category: 'Web',
      types: [
        { id: 'fuzzing', name: 'Fuzzing', description: 'Búsqueda de directorios y archivos ocultos' },
        { id: 'subfinder', name: 'Subfinder', description: 'Enumeración de subdominios' },
        { id: 'paramspider', name: 'ParamSpider', description: 'Extracción de parámetros vulnerables' },
      ]
    },
    {
      category: 'Infraestructura',
      types: [
        { id: 'nmap', name: 'Nmap Scan', description: 'Escaneo de puertos y servicios' },
      ]
    },
    {
      category: 'Información',
      types: [
        { id: 'whois', name: 'WHOIS Lookup', description: 'Información del dominio y registrante' },
        { id: 'theharvester', name: 'theHarvester', description: 'Recolección de correos y hosts públicos' },
        { id: 'whatweb', name: 'WhatWeb', description: 'Fingerprinting de tecnologías web' },
      ]
    }
  ];
  // Cambiar el estado inicial de selectedCategory a vacío
  const [selectedCategory, setSelectedCategory] = useState('');

  // Obtener la categoría seleccionada y sus tipos
  const currentCategory = scanCategories.find(cat => cat.category === selectedCategory);
  const currentTypes = currentCategory ? currentCategory.types : [];

  // Si el scanType actual no pertenece a la categoría, resetearlo
  useEffect(() => {
    if (currentCategory && !currentTypes.some(t => t.id === scanType)) {
      setScanType(currentTypes[0]?.id || '');
    }
    // eslint-disable-next-line
  }, [selectedCategory]);

  useEffect(() => {
    if (currentScan && currentScan.status !== 'running' && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentScan]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const isNearTop = scrollTop < 200;
      const isNearBottom = scrollTop > (scrollHeight - windowHeight - 200);
      
      setShowScrollTop(!isNearTop && currentScan && currentScan.status === 'completed');
      setShowScrollBottom(isNearTop && currentScan && currentScan.status === 'completed');
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Ejecutar una vez al montar
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentScan]);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleScan = async () => {
    if (!url.trim()) {
      toast.error('Por favor, introduce una URL válida');
      return;
    }
    try {
      new URL(url);
    } catch {
      toast.error('URL no válida. Asegúrate de incluir http:// o https://');
      return;
    }
    setIsScanning(true);
    setScanSaved(false);
    setSaveScanClicked(false);
    const scanId = generateScanId();
    const newScan: ScanWithHarvester = {
      id: scanId,
      url,
      scan_type: scanType,
      timestamp: new Date().toISOString(),
      results: [],
      status: 'running'
    };
    setCurrentScan(newScan);
    toast.info('Iniciando escaneo...', { duration: 1500 });
    try {
      let results: ScanResult[] = [];
      let extraResult: any = null;
      if (scanType === 'fuzzing') {
        results = await scanFuzzing(url);
      } else if (scanType === 'nmap') {
        extraResult = await scanNmap(url);
      } else if (scanType === 'whois') {
        extraResult = await scanWhois(url);
      } else if (scanType === 'subfinder') {
        const res = await fetch('http://localhost:5000/subfinder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ objetivo: url })
        });
        const data = await res.json();
        extraResult = data.resultado;
      } else if (scanType === 'paramspider') {
        const res = await fetch('http://localhost:5000/paramspider', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ objetivo: url })
        });
        const data = await res.json();
        extraResult = data.resultado;
      } else if (scanType === 'whatweb') {
        const res = await fetch('http://localhost:5000/whatweb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ objetivo: url })
        });
        const data = await res.json();
        extraResult = data.resultado;
      } else if (scanType === 'theharvester') {
        const res = await fetch('http://localhost:5000/theharvester', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ objetivo: url })
        });
        const data = await res.json();
        extraResult = data.resultado;
      }
      const completedScan: ScanWithHarvester = {
        ...newScan,
        results,
        extraResult,
        status: 'completed'
      };
      setCurrentScan(completedScan);
      setIsScanning(false);
      toast.success('¡Escaneo completado con éxito!', { duration: 2000 });
    } catch (error) {
      console.error('Scan error:', error);
      const failedScan: ScanWithHarvester = {
        ...newScan,
        status: 'failed'
      };
      setCurrentScan(failedScan);
      setIsScanning(false);
      toast.error('Error durante el escaneo');
    }
  };

  // Boton agregar escaneo Visible al bajar una vez realizado un escaneo

  // agregar smoth scroll al Terminar un escaneo -> Directo a los resultados
  const handleSaveScan = async () => {
    if (!currentScan || !user?.id) return;
    if (scanSaved || saveScanClicked) {
      toast.info('Este escaneo ya fue guardado.');
      return;
    }
    setSaveScanClicked(true);
    let response = null;
    if (currentScan.scan_type === 'whois') {
      response = await saveWhoisScan(currentScan, parseInt(user.id));
    } else if (currentScan.scan_type === 'nmap') {
      response = await saveNmapScan(currentScan, parseInt(user.id));
    } else if (currentScan.scan_type === 'fuzzing') {
      response = await saveFuzzingScan(currentScan, parseInt(user.id));
    }
    if (response && response.success) {
      if (response.scan_id) setDbScanId(response.scan_id);
      setScanSaved(true);
      toast.success('Escaneo guardado correctamente');
    } else {
      toast.error('Error al guardar el escaneo');
      setScanSaved(false);
      setSaveScanClicked(false);
    }
  };

  // Paso 2: Obtener el escaneo Nmap más reciente al presionar 'Generar Reporte con IA'
  const handleGenerateReport = async () => {
    if (!scanSaved) {
      toast.error('Primero debes guardar el escaneo antes de generar el reporte con IA');
      return;
    }
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }
    if (!currentScan) {
      toast.error('No hay escaneo actual para generar el reporte');
      return;
    }
    setChatbotOpen(true);
    setChatbotMessages([{ sender: 'user', text: 'Genera un reporte de seguridad para mi escaneo.' }]);
    setChatbotLoading(true);
    try {
      let scanType = currentScan.scan_type;
      let scanData: any = null;
      if (scanType === 'nmap' || scanType === 'whois') {
        scanData = currentScan.extraResult;
      } else if (scanType === 'fuzzing') {
        scanData = currentScan.results;
      } else {
        scanData = currentScan.extraResult || currentScan.results;
      }
      const reportRes = await fetch('http://localhost:3001/generate_report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_type: scanType, scan_data: typeof scanData === 'string' ? scanData : JSON.stringify(scanData) })
      });
      const reportData = await reportRes.json();
      if (reportData.report) {
        setChatbotMessages(prev => [
          ...prev,
          { sender: 'bot', text: reportData.report }
        ]);
      } else {
        setChatbotMessages(prev => [
          ...prev,
          { sender: 'bot', text: 'No se pudo generar el reporte con IA.' }
        ]);
      }
    } catch (error) {
      setChatbotMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Error al generar el reporte.' }
      ]);
    } finally {
      setChatbotLoading(false);
    }
  };

  // Nuevo: función para enviar mensaje libre a Ollama
  const handleChatbotSend = async () => {
    if (!chatInput.trim() || chatbotLoading) return;
    setChatbotMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
    setChatbotLoading(true);
    const inputToSend = chatInput;
    setChatInput(''); // Limpiar input inmediatamente
    try {
      const res = await fetch('http://localhost:3001/generate_report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_type: 'chat', scan_data: inputToSend })
      });
      const data = await res.json();
      if (data.report) {
        setChatbotMessages(prev => [...prev, { sender: 'bot', text: data.report }]);
      } else {
        setChatbotMessages(prev => [...prev, { sender: 'bot', text: 'No se pudo generar respuesta.' }]);
      }
    } catch (error) {
      setChatbotMessages(prev => [...prev, { sender: 'bot', text: 'Error de conexión con Ollama.' }]);
    } finally {
      setChatbotLoading(false);
    }
  };

  // Guardar reporte IA
  const handleSaveReport = async (reportText: string) => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }
    // Buscar el id del escaneo más reciente (Nmap, Fuzzing, Whois)
    let scanId = dbScanId; // Usa el id real de la base de datos
    if (!scanId) {
      toast.error('No se encontró el escaneo para asociar el reporte');
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/save-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          scanId: scanId,
          reportText: reportText
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Reporte guardado exitosamente');
      } else {
        toast.error(data.message || 'Error al guardar el reporte');
      }
    } catch (error) {
      toast.error('Error de conexión al guardar el reporte');
    }
  };

  // Simular datos de estadísticas
  const simulatedStats = {
    yourScore: Math.floor(Math.random() * 100),
    averageScore: 65,
    sites: [
      { name: 'Tu sitio', score: Math.floor(Math.random() * 100) },
      { name: 'Sitio A', score: 80 },
      { name: 'Sitio B', score: 60 },
      { name: 'Sitio C', score: 40 },
    ],
    breakdown: [
      { type: 'Fuzzing', value: Math.floor(Math.random() * 100) },
      { type: 'Nmap', value: Math.floor(Math.random() * 100) },
      { type: 'WHOIS', value: Math.floor(Math.random() * 100) },
      { type: 'Subfinder', value: Math.floor(Math.random() * 100) },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div ref={topRef} />
      
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
              Hola de nuevo, <span className="font-semibold">
                {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}!
              </span> Analiza sitios web 
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

              {/* Reemplazar el select de tipo de escaneo por botones visuales agrupados */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categoría de escaneo
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white shadow-sm mb-4"
                >
                  <option value="" disabled>Selecciona una categoría...</option>
                  {scanCategories.map(cat => (
                    <option key={cat.category} value={cat.category}>{cat.category}</option>
                  ))}
                </select>
                {/* Mostrar el select de tipo de escaneo solo si hay categoría seleccionada */}
                {currentCategory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tipo de escaneo
                    </label>
                    <select
                      value={scanType}
                      onChange={e => setScanType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-white shadow-sm"
                    >
                      {currentTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                )}
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
                {/* Agregar validaciones para cuando un escaneo no lanze problemas. Evitar color ROJO para no confundir al usuario */}
                {currentScan && currentScan.status === 'completed' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveScan}
                      className="flex-1 btn-primary"
                      disabled={scanSaved || saveScanClicked}
                    >
                      Guardar Escaneo
                    </button>
                    <button
                      onClick={handleGenerateReport}
                      className="flex-1 btn-primary"
                      disabled={!scanSaved}
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
          <div ref={resultRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* En la cabecera de resultados, agregar el botón de estadísticas */}
              {/* Envolver el cuadro de resultados y estadísticas en un contenedor 3D para flip */}
              <div className="relative w-full overflow-hidden" style={{ perspective: '1200px', minHeight: 700, maxHeight: 900, maxWidth: 900, borderRadius: '1rem', margin: '0 auto' }}>
                <div className={`transition-transform duration-700 ease-in-out`} style={{ transformStyle: 'preserve-3d', width: '100%', minHeight: 700, maxHeight: 900, position: 'relative', transform: showStats ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                  {/* Cara frontal: resultados normales */}
                  <div className="absolute w-full h-full top-0 left-0 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 hover:scrollbar-thumb-blue-500" style={{ backfaceVisibility: 'hidden', background: '#fff', borderRadius: '1rem', boxShadow: '0 4px 24px #0001', padding: '2rem', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflow: 'auto', maxWidth: 900, scrollbarWidth: 'thin', scrollbarColor: '#60a5fa #dbeafe' }}>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Resultados del Escaneo</h2>
                      <button
                        onClick={() => setShowStats(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:scale-105 hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                      >
                        <span className="text-lg">📊</span>
                        Ver estadísticas
                      </button>
                    </div>
                    <div className="space-y-6">
                      {scanType === 'fuzzing' && currentScan.results.length > 0 && (
                        <FuzzingResult results={currentScan.results} />
                      )}
                      {scanType === 'whois' && (
                        <WhoisResult url={currentScan.url} />
                      )}
                      {scanType === 'nmap' && currentScan.extraResult && (
                        <NmapResult result={currentScan.extraResult} />
                      )}
                      {scanType === 'subfinder' && currentScan.extraResult && (
                        <div className="glass-card modern-shadow p-8 bg-gradient-to-br from-teal-50 to-cyan-100 animate-fadeInUp">
                          <div className="flex items-center space-x-4 mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-3xl flex items-center justify-center shadow-xl">
                              <span className="text-white text-4xl">🔎</span>
                            </div>
                            <div>
                              <h3 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-800 bg-clip-text text-transparent">Subdominios Encontrados</h3>
                              <p className="text-teal-800 text-base mt-1">Enumeración avanzada de subdominios</p>
                            </div>
                          </div>
                          <div className="mb-6">
                            <span className="inline-block bg-teal-200 text-teal-900 rounded-full px-4 py-2 text-lg font-semibold">{(currentScan.extraResult.match(/✅/g) || []).length} subdominios</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {currentScan.extraResult.split('\n').filter(l => l.startsWith('✅')).map((l, idx) => (
                              <div key={idx} className="bg-teal-100 rounded-xl p-4 flex items-center space-x-3 shadow-md">
                                <span className="text-teal-600 text-2xl">🌐</span>
                                <span className="text-lg font-mono text-teal-900 break-all">{l.replace('✅', '').trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {scanType === 'whatweb' && currentScan.extraResult && (
                        typeof currentScan.extraResult === 'string' ? (
                          <div className="glass-card modern-shadow p-8 bg-gradient-to-br from-green-200 via-blue-100 to-blue-200 animate-fadeInUp rounded-3xl">
                            <div className="flex items-center space-x-4 mb-6">
                              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-400 rounded-3xl flex items-center justify-center shadow-xl">
                                <span className="text-white text-4xl">🕵️‍♂️</span>
                              </div>
                              <div>
                                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">WhatWeb Resultados</h3>
                                <p className="text-blue-900 text-base mt-1">Fingerprinting de tecnologías web</p>
                              </div>
                            </div>
                            <pre className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-4 text-blue-900 whitespace-pre-wrap text-sm shadow-inner font-mono">{currentScan.extraResult}</pre>
                          </div>
                        ) : (
                          <div className="glass-card modern-shadow p-8 bg-gradient-to-br from-green-200 via-blue-100 to-blue-200 animate-fadeInUp rounded-3xl">
                            <div className="flex items-center space-x-4 mb-6">
                              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-400 rounded-3xl flex items-center justify-center shadow-xl">
                                <span className="text-white text-4xl">🕵️‍♂️</span>
                              </div>
                              <div>
                                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">WhatWeb Resultados</h3>
                                <p className="text-blue-900 text-base mt-1">Fingerprinting de tecnologías web</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {Object.entries(currentScan.extraResult).map(([cat, techs]) => (
                                Array.isArray(techs) && techs.length > 0 && (
                                  <div key={cat} className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow p-4">
                                    <div className="flex items-center mb-2">
                                      <span className="text-2xl mr-2">{getWhatwebCategoryIcon(cat)}</span>
                                      <span className="font-bold text-lg text-blue-800">{cat}</span>
                                    </div>
                                    <ul className="space-y-1">
                                      {techs.map((t, idx) => (
                                        <li key={idx} className="flex items-center space-x-2">
                                          <span className="font-semibold text-gray-900">{t.name}</span>
                                          {t.version && <span className="text-xs text-gray-500">v{t.version}</span>}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        )
                      )}
                      {scanType === 'paramspider' && currentScan.extraResult && (
                        <div className="glass-card modern-shadow p-8 bg-gradient-to-br from-violet-100 via-violet-200 to-fuchsia-100 animate-fadeInUp rounded-3xl">
                          <div className="flex items-center space-x-4 mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-400 to-violet-500 rounded-3xl flex items-center justify-center shadow-xl">
                              <span className="text-white text-4xl">🕷️</span>
                            </div>
                            <div>
                              <h3 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-700 to-violet-700 bg-clip-text text-transparent">Parámetros Encontrados</h3>
                              <p className="text-violet-900 text-base mt-1">Extracción de parámetros vulnerables</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 max-h-96 overflow-y-auto">
                            {currentScan.extraResult.split('\n').filter(l => l.startsWith('✅')).map((l, idx) => (
                              <span key={idx} className="inline-flex items-center px-4 py-2 rounded-2xl bg-gradient-to-br from-violet-200 to-fuchsia-100 shadow font-mono text-base text-violet-900 border border-violet-200">
                                <span className="text-fuchsia-600 mr-2">🔗</span>
                                <span className="break-all">{l.replace('✅', '').trim()}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {scanType === 'theharvester' && currentScan.extraResult && (
                        <div className="glass-card modern-shadow p-8 bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100 animate-fadeInUp rounded-3xl">
                          <div className="flex items-center space-x-4 mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl flex items-center justify-center shadow-xl">
                              <span className="text-white text-4xl">🔎</span>
                            </div>
                            <div>
                              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">theHarvester Resultados</h3>
                              <p className="text-cyan-900 text-base mt-1">Recolección de correos, hosts y fuentes</p>
                            </div>
                          </div>
                          <div className="space-y-6">
                            {/* Correos */}
                            <div>
                              <div className="font-bold text-cyan-700 mb-2 flex items-center"><span className="mr-2 text-2xl">✉️</span>Correos encontrados:</div>
                              {currentScan.extraResult.includes('📧') ? (
                                <ul className="space-y-1">
                                  {currentScan.extraResult.split('\n').filter(l => l.startsWith('✅') || l.startsWith('📧')).map((l, idx) => (
                                    l.startsWith('📧') ? null : (
                                      <li key={idx} className="flex items-center space-x-2">
                                        <span className="text-cyan-600">✉️</span>
                                        <span className="text-sm font-mono text-cyan-900 break-all">{l.replace('✅', '').trim()}</span>
                                      </li>
                                    )
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-cyan-500 italic">No se encontraron correos.</div>
                              )}
                            </div>
                            {/* Hosts/IPs */}
                            <div>
                              <div className="font-bold text-cyan-700 mb-2 flex items-center"><span className="mr-2 text-2xl">🌐</span>Hosts/IPs encontrados:</div>
                              {currentScan.extraResult.includes('🌐') ? (
                                <ul className="space-y-1">
                                  {currentScan.extraResult.split('\n').filter(l => l.startsWith('🌐')).map((l, idx) => (
                                    <li key={idx} className="flex items-center space-x-2">
                                      <span className="text-cyan-600">🌐</span>
                                      <span className="text-sm font-mono text-cyan-900 break-all">{l.replace('🌐', '').trim()}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-cyan-500 italic">No se encontraron hosts/IPs.</div>
                              )}
                            </div>
                            {/* Fuentes */}
                            <div>
                              <div className="font-bold text-cyan-700 mb-2 flex items-center"><span className="mr-2 text-2xl">🔗</span>Fuentes utilizadas:</div>
                              {currentScan.extraResult.includes('🔎 Fuentes') ? (
                                <ul className="space-y-1">
                                  {currentScan.extraResult.split('\n').filter(l => l.startsWith('-')).map((l, idx) => (
                                    <li key={idx} className="flex items-center space-x-2">
                                      <span className="text-cyan-600">🔗</span>
                                      <span className="text-sm font-mono text-cyan-900 break-all">{l.replace('-', '').trim()}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-cyan-500 italic">No se encontraron fuentes.</div>
                              )}
                            </div>
                            {/* RAW OUTPUT siempre disponible */}
                            {currentScan.rawHarvester && (
                              <details className="mt-6">
                                <summary className="cursor-pointer font-semibold text-cyan-700">Ver salida completa de theHarvester (RAW)</summary>
                                <pre className="bg-cyan-50 rounded-xl p-4 text-cyan-900 whitespace-pre-wrap text-xs shadow-inner mt-2 max-h-96 overflow-auto">
                                  {currentScan.rawHarvester}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
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
                  </div>
                  {/* Cara trasera: estadísticas */}
                  <div className="absolute w-full h-full top-0 left-0 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 hover:scrollbar-thumb-blue-500" style={{ backfaceVisibility: 'hidden', background: '#fff', borderRadius: '1rem', boxShadow: '0 4px 24px #0001', padding: '2rem', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', transform: 'rotateY(180deg)', overflow: 'auto', maxWidth: 900, maxHeight: 900, scrollbarWidth: 'thin', scrollbarColor: '#60a5fa #dbeafe' }}>
                    <div className="flex items-center justify-between mb-6 w-full">
                      <h2 className="text-2xl font-bold text-gray-900">Estadísticas de Vulnerabilidad</h2>
                      <button
                        onClick={() => setShowStats(false)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold shadow-lg hover:scale-105 hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                      >
                        <span className="text-lg">↩️</span>
                        Ver resultados
                      </button>
                    </div>
                    <div className="w-full flex flex-col items-center justify-center gap-8 overflow-auto" style={{ maxHeight: 700 }}>
                      <div className="w-full max-w-xl mx-auto mb-8 bg-white rounded-xl p-4 shadow-md">
                        <ChartContainer config={{ score: { color: '#3b82f6', label: 'Puntaje' } }}>
                          <RechartsPrimitive.BarChart data={simulatedStats.sites} width={400} height={250}>
                            <RechartsPrimitive.XAxis dataKey="name" />
                            <RechartsPrimitive.YAxis />
                            <RechartsPrimitive.Bar dataKey="score" fill="#3b82f6" />
                          </RechartsPrimitive.BarChart>
                        </ChartContainer>
                      </div>
                      <div className="w-full max-w-xl mx-auto bg-white rounded-xl p-4 shadow-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Sitio</TableHead>
                              <TableHead>Puntaje de Seguridad</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {simulatedStats.sites.map((site, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{site.name}</TableCell>
                                <TableCell>{site.score}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Botón flotante para volver arriba */}
      {showScrollTop && (
        <button
          onClick={() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg p-4 hover:scale-110 transition-transform flex items-center space-x-2"
          aria-label="Volver arriba"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          <span className="hidden sm:inline font-semibold">Ir arriba</span>
        </button>
      )}
      {/* Botón flotante para ir abajo */}
      {showScrollBottom && (
        <button
          onClick={() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="fixed bottom-20 right-8 z-50 bg-gradient-to-br from-cyan-500 to-teal-600 text-white rounded-full shadow-lg p-4 hover:scale-110 transition-transform flex items-center space-x-2"
          aria-label="Ir abajo"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="hidden sm:inline font-semibold">Ir abajo</span>
        </button>
      )}
      {/* Chatbot Modal flotante */}
      <ChatbotModal
        open={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        messages={chatbotMessages}
        loading={chatbotLoading}
        onSaveReport={handleSaveReport}
      >
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
            placeholder="Escribe tu mensaje..."
            onKeyDown={e => { if (e.key === 'Enter') handleChatbotSend(); }}
            disabled={chatbotLoading}
          />
          <button
            onClick={handleChatbotSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            disabled={chatbotLoading || !chatInput.trim()}
          >
            Enviar
          </button>
        </div>
      </ChatbotModal>
    </div>
  );
};

export default Scanner;

function getWhatwebCategoryIcon(cat) {
  switch (cat) {
    case 'CMS': return '📰';
    case 'Web Server': return '🌐';
    case 'Programming Language': return '💻';
    case 'JS Framework': return '⚛️';
    case 'Analytics': return '📊';
    case 'Operating System': return '🖥️';
    case 'CDN': return '🚀';
    default: return '🔧';
  }
}
