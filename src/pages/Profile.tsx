import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllScans, getScanById, Scan } from '../utils/scanUtils';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import Navbar from '../components/Navbar';
import AccountSettings from '../components/AccountSettings';

const Profile = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalContent, setDetailModalContent] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportModalContent, setReportModalContent] = useState<any>(null);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [selectedScanForReport, setSelectedScanForReport] = useState<Scan | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [scansWithReports, setScansWithReports] = useState<Set<string>>(new Set());

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    const loadScans = async () => {
      if (user?.id) {
        try {
          const allScans = await getAllScans(parseInt(user.id));
          setScans(allScans);
          
          // Verificar qué escaneos tienen reporte
          const reportsSet = new Set<string>();
          for (const scan of allScans) {
            const hasReport = await checkScanHasReport(scan.id);
            if (hasReport) {
              reportsSet.add(scan.id);
            }
          }
          setScansWithReports(reportsSet);
        } catch (error) {
          toast.error('Error al cargar el historial de escaneos');
        }
      }
    };
    loadScans();
    // Se recarga cada vez que entras al perfil o cambia el usuario
  }, [user?.id, location.pathname]);

  // Descargar datos del escaneo como txt plano (JSON.stringify)
  const handleDownloadScanData = async (scanId: string) => {
    const scan = await getScanById(Number(scanId));
    if (!scan) {
      toast.error('No se pudo obtener el escaneo');
      return;
    }
    // Permitir descargar siempre, pero advertir si no hay detalles
    const isEmpty =
      (scan.scan_type === 'fuzzing' && (!Array.isArray(scan.results) || scan.results.length === 0)) ||
      ((scan.scan_type === 'whois' || scan.scan_type === 'nmap') && (!scan.extraResult || Object.keys(scan.extraResult).length === 0));
    if (isEmpty) {
      toast.warning('Este escaneo no tiene detalles completos, pero puedes descargar el registro.');
    }
    const blob = new Blob([JSON.stringify(scan, null, 2)], { type: 'text/plain; charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blitzscan_data_${scanId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Datos descargados');
  };

  // Nueva función para mostrar detalles del escaneo según tipo
  const handleShowScanDetails = async (scan: Scan) => {
    let endpoint = '';
    if (scan.scan_type === 'whois') {
      endpoint = `http://localhost:3001/api/get-whois-scans/${user?.id}`;
    } else if (scan.scan_type === 'nmap') {
      endpoint = `http://localhost:3001/api/get-nmap-scans/${user?.id}`;
    } else if (scan.scan_type === 'fuzzing') {
      endpoint = `http://localhost:3001/api/get-fuzzing-scans/${user?.id}`;
    } else if (scan.scan_type === 'subfinder') {
      endpoint = `http://localhost:3001/api/get-subfinder-scans/${user?.id}`;
    } else if (scan.scan_type === 'paramspider') {
      endpoint = `http://localhost:3001/api/get-paramspider-scans/${user?.id}`;
    } else if (scan.scan_type === 'whatweb') {
      endpoint = `http://localhost:3001/api/get-whatweb-scans/${user?.id}`;
    } else if (scan.scan_type === 'theharvester') {
      endpoint = `http://localhost:3001/api/get-theharvester-scans/${user?.id}`;
    } else {
      toast.error('Tipo de escaneo no soportado');
      return;
    }
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      // Buscar el escaneo por id
      let detalle = null;
      if (Array.isArray(data.scans)) {
        detalle = data.scans.find((s: any) => String(s.id) === String(scan.id));
      }
      if (detalle) {
        setDetailModalContent(detalle);
        setShowDetailModal(true);
        toast.success('Detalle extraído.');
      } else {
        toast.error('No se encontró el detalle para este escaneo');
      }
    } catch (error) {
      toast.error('Error al obtener detalles del escaneo');
      console.error(error);
    }
  };

  // Nueva función para mostrar el reporte IA
  const handleShowReport = async (scan: Scan) => {
    try {
      const res = await fetch(`http://localhost:3001/api/get-report/${scan.id}`);
      const data = await res.json();
      if (data.success && data.reporte) {
        // Extraer solo el contenido del reporte, no el JSON completo
        let reportContent = data.reporte;
        
        // Si el reporte viene como JSON string, intentar parsearlo
        if (typeof reportContent === 'string') {
          try {
            const parsed = JSON.parse(reportContent);
            // Si tiene la propiedad 'reporte', usar esa
            if (parsed.reporte) {
              reportContent = parsed.reporte;
            } else if (parsed.report) {
              // También verificar si tiene 'report'
              reportContent = parsed.report;
            } else {
              // Si no tiene propiedades específicas, usar el contenido completo
              reportContent = reportContent;
            }
          } catch (e) {
            // Si no es JSON válido, usar el string tal como viene
            reportContent = reportContent;
          }
        } else if (typeof reportContent === 'object') {
          // Si ya es un objeto, buscar la propiedad correcta
          if (reportContent.reporte) {
            reportContent = reportContent.reporte;
          } else if (reportContent.report) {
            reportContent = reportContent.report;
          } else {
            // Si no encuentra propiedades específicas, convertir a string
            reportContent = JSON.stringify(reportContent, null, 2);
          }
        }
        
        setReportModalContent(reportContent);
        setShowReportModal(true);
        toast.success('Reporte extraído.');
      } else {
        toast.error(data.message || 'No se encontró reporte para este escaneo');
      }
    } catch (error) {
      toast.error('Error al obtener el reporte');
      console.error(error);
    }
  };

  // Nueva función para verificar si un escaneo tiene reporte
  const checkScanHasReport = async (scanId: string): Promise<boolean> => {
    try {
      const res = await fetch(`http://localhost:3001/api/get-report/${scanId}`);
      const data = await res.json();
      return data.success && data.reporte;
    } catch (error) {
      return false;
    }
  };

  // Nueva función para generar reporte
  const handleGenerateReport = async (scan: Scan) => {
    setSelectedScanForReport(scan);
    setShowGenerateReportModal(true);
  };

  // Función para ejecutar la generación del reporte
  const executeReportGeneration = async () => {
    if (!selectedScanForReport || !user?.id) return;
    
    setGeneratingReport(true);
    try {
      // Obtener los datos del escaneo
      let scanData: any = null;
      let endpoint = '';
      
      if (selectedScanForReport.scan_type === 'whois') {
        endpoint = `http://localhost:3001/api/get-whois-scans/${user.id}`;
      } else if (selectedScanForReport.scan_type === 'nmap') {
        endpoint = `http://localhost:3001/api/get-nmap-scans/${user.id}`;
      } else if (selectedScanForReport.scan_type === 'fuzzing') {
        endpoint = `http://localhost:3001/api/get-fuzzing-scans/${user.id}`;
      } else if (selectedScanForReport.scan_type === 'subfinder') {
        endpoint = `http://localhost:3001/api/get-subfinder-scans/${user.id}`;
      } else if (selectedScanForReport.scan_type === 'paramspider') {
        endpoint = `http://localhost:3001/api/get-paramspider-scans/${user.id}`;
      } else if (selectedScanForReport.scan_type === 'whatweb') {
        endpoint = `http://localhost:3001/api/get-whatweb-scans/${user.id}`;
      } else if (selectedScanForReport.scan_type === 'theharvester') {
        endpoint = `http://localhost:3001/api/get-theharvester-scans/${user.id}`;
      }

      if (endpoint) {
        const res = await fetch(endpoint);
        const data = await res.json();
        let detalle = null;
        if (Array.isArray(data.scans)) {
          detalle = data.scans.find((s: any) => String(s.id) === String(selectedScanForReport.id));
        }
        scanData = detalle;
      }

      // Preparar contexto del escaneo
      const scanContext = {
        currentScan: {
          type: selectedScanForReport.scan_type,
          url: selectedScanForReport.url,
          timestamp: selectedScanForReport.timestamp,
          data: scanData
        },
        conversationHistory: [],
        userExpertise: 'intermediate',
        focusArea: 'web_security',
        previousTopics: []
      };

      // Generar el reporte
      const reportRes = await fetch('http://localhost:3001/generate_report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scan_type: selectedScanForReport.scan_type, 
          scan_data: typeof scanData === 'string' ? scanData : JSON.stringify(scanData),
          context: scanContext
        })
      });
      
      const reportData = await reportRes.json();
      
      if (reportData.report) {
        // Guardar el reporte
        const saveRes = await fetch('http://localhost:3001/api/save-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            scanId: selectedScanForReport.id,
            reportText: reportData.report
          })
        });
        
        const saveData = await saveRes.json();
        
        if (saveData.success) {
          toast.success('Reporte generado y guardado exitosamente');
          // Usar directamente el contenido del reporte, no el JSON completo
          setReportModalContent(reportData.report);
          setShowGenerateReportModal(false);
          setShowReportModal(true);
          // Actualizar el estado para mostrar que este escaneo ahora tiene reporte
          setScansWithReports(prev => new Set([...prev, selectedScanForReport.id]));
        } else {
          toast.error('Error al guardar el reporte');
        }
      } else {
        toast.error('No se pudo generar el reporte');
      }
    } catch (error) {
      toast.error('Error al generar el reporte');
      console.error(error);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Nueva función para ocultar (soft delete) un escaneo
  const handleHideScan = async (scanId: string) => {
    if (!user?.id) return;
    try {
      const res = await fetch('http://localhost:3001/api/hide-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId, userId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Escaneo eliminado correctamente');
        // Actualizar la lista de escaneos
        setScans(prev => prev.filter(s => String(s.id) !== String(scanId)));
        setSelectedScan(null);
      } else {
        toast.error(data.message || 'No se pudo ocultar el escaneo');
      }
    } catch (error) {
      toast.error('Error al eliminar el escaneo');
      console.error(error);
    }
  };

  const getScanTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      fuzzing: '🔍',
      nmap: '🌐',
      whois: '📋',
      subfinder: '🔎',
      paramspider: '🕷️',
      whatweb: '🕵️‍♂️',
      theharvester: '🌾'
    };
    return icons[type] || '🔧';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'running': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  function truncateUrl(url: string, maxLength = 35) {
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength - 3) + '...';
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div>
        {/* Header */}
        <div className="bg-gradient-to-br from-[#4f8cff] to-[#3887f6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="pt-14 flex items-center space-x-6">
              <div className="w-20 h-20 bg-white border-4 border-blue-400 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold shadow overflow-hidden">
                {user?.profileImage ? (
                  <img src={`http://localhost:3001${user.profileImage}`} alt="Foto de perfil" className="object-cover w-full h-full" />
                ) : (
                  user?.firstName?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Perfil de Usuario
                </h1>
                <p className="text-xl text-blue-100">
                  Bienvenido, <span className="text-white font-semibold">{user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}</span>
                </p>
                <p className="text-blue-100">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Scan History */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Historial de Escaneos</h2>
                {scans.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No hay escaneos guardados</p>
                    <button 
                      onClick={() => navigate('/scanner')}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                    >
                      Realizar Primer Escaneo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scans.map((scan) => (
                      <div 
                        key={scan.id}
                        className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedScan(selectedScan?.id === scan.id ? null : scan)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">{getScanTypeIcon(scan.scan_type)}</div>
                            <div>
                              <h3 className="text-gray-900 font-medium">
                                {truncateUrl(scan.url)}
                              </h3>
                              <p className="text-gray-500 text-sm">
                                {scan.scan_type.toUpperCase()} • {new Date(scan.timestamp).toLocaleString('es-ES')}
                              </p>
                            </div>
                          </div>
                        </div>
                        {selectedScan?.id === scan.id && (
                          <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleShowScanDetails(scan);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                            >
                              Ver Detalles
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                // Verificar si tiene reporte y mostrar el botón correspondiente
                                checkScanHasReport(scan.id).then(hasReport => {
                                  if (hasReport) {
                                    handleShowReport(scan);
                                  } else {
                                    handleGenerateReport(scan);
                                  }
                                });
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                            >
                              {scansWithReports.has(scan.id) ? 'Ver Reporte' : 'Generar Reporte'}
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleHideScan(scan.id);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* User Info & Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de Cuenta</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-gray-500 text-sm">Nombre</label>
                    <p className="text-gray-900">{user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}</p>
                  </div>
                  <div>
                    <label className="text-gray-500 text-sm">Email</label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-gray-500 text-sm">Miembro desde</label>
                    <p className="text-gray-900">
                      {user?.creado_en ? new Date(user.creado_en).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : 'Desconocido'}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-gray-200 space-y-3">
                    <button 
                      onClick={() => navigate('/scanner')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                    >
                      Nuevo Escaneo
                    </button>
                    <button 
                      className="w-full border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                      onClick={() => setShowAccountSettings(true)}
                    >
                      Configurar Cuenta
                    </button>
                  </div>
                </div>
              </div>
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h3>
                <div className="space-y-3">
                  {scans.slice(0, 3).map((scan, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm">
                      <div className="text-lg">{getScanTypeIcon(scan.scan_type)}</div>
                      <div className="flex-1">
                        <p className="text-gray-900 truncate">{truncateUrl(scan.url)}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(scan.timestamp).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${
                        scan.status === 'completed' ? 'bg-green-500' : 
                        scan.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></span>
                    </div>
                  ))}
                  {scans.length === 0 && (
                    <p className="text-gray-500 text-sm">No hay actividad reciente</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal de detalles del escaneo */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fadeInUp">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
              aria-label="Cerrar detalles"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
              📄 Detalles del Escaneo
            </h2>
            <pre className="bg-gray-100 rounded-lg p-4 text-sm max-h-96 overflow-auto whitespace-pre-wrap">
              {JSON.stringify(detailModalContent, null, 2)}
            </pre>
          </div>
        </div>
      )}
      {/* Modal de reporte IA */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative animate-fadeInUp max-h-[90vh] overflow-hidden flex flex-col">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold z-10"
              aria-label="Cerrar reporte"
            >
              ×
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🧠</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Reporte IA Generado</h2>
                <p className="text-gray-600 text-sm">Análisis de seguridad con inteligencia artificial</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl p-6">
              <ReactMarkdown 
                components={{
                  h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6 first:mt-0">{children}</h1>,
                  h2: ({children}) => <h2 className="text-xl font-bold text-gray-800 mb-3 mt-5">{children}</h2>,
                  h3: ({children}) => <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">{children}</h3>,
                  p: ({children}) => <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>,
                  strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-800">{children}</em>,
                  code: ({children}) => <code className="bg-gray-200 px-2 py-1 rounded text-sm font-mono text-gray-800">{children}</code>,
                  pre: ({children}) => <pre className="bg-gray-200 p-4 rounded-lg text-sm overflow-x-auto mb-4">{children}</pre>,
                  ul: ({children}) => <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">{children}</ol>,
                  li: ({children}) => <li className="text-gray-700">{children}</li>,
                  blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4">{children}</blockquote>,
                  table: ({children}) => <div className="overflow-x-auto mb-4"><table className="min-w-full border border-gray-300">{children}</table></div>,
                  th: ({children}) => <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">{children}</th>,
                  td: ({children}) => <td className="border border-gray-300 px-4 py-2">{children}</td>,
                }}
              >
                {typeof reportModalContent === 'string' ? reportModalContent : 'Contenido del reporte no disponible en formato legible.'}
              </ReactMarkdown>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  const content = typeof reportModalContent === 'string' ? reportModalContent : JSON.stringify(reportModalContent, null, 2);
                  navigator.clipboard.writeText(content);
                  toast.success('Reporte copiado al portapapeles');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                📋 Copiar Reporte
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {showAccountSettings && (
        <AccountSettings onClose={() => setShowAccountSettings(false)} />
      )}
      
      {/* Modal para generar reporte */}
      {showGenerateReportModal && selectedScanForReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeInUp">
            <button
              onClick={() => setShowGenerateReportModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
              aria-label="Cerrar modal"
            >
              ×
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🧠</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-blue-700">
                Generar Reporte IA
              </h2>
              <p className="text-gray-600 mb-6">
                ¿Deseas generar un reporte de seguridad con IA para el escaneo de{' '}
                <span className="font-semibold">{selectedScanForReport.url}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGenerateReportModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                  disabled={generatingReport}
                >
                  Cancelar
                </button>
                <button
                  onClick={executeReportGeneration}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center"
                  disabled={generatingReport}
                >
                  {generatingReport ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generando...
                    </>
                  ) : (
                    'Generar Reporte'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
