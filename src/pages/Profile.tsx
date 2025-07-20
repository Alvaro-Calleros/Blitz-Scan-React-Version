import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSavedScans, generatePDFReport, Scan } from '../utils/scanUtils';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import AccountSettings from '../components/AccountSettings';

const Profile = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAccountSettings, setShowAccountSettings] = useState(false); // Added state for AccountSettings modal

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    if (user?.email) {
      const savedScans = getSavedScans(user.email);
      setScans(savedScans);
    }
  }, [user]);

  const handleGenerateReport = (scan: Scan) => {
    generatePDFReport(scan);
    toast.success('Reporte generado y descargado');
  };

  const getScanTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      fuzzing: '🔍',
      nmap: '🌐',
      whois: '📋'
      //sqli: '🛡️',
      //xss: '⚠️'
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

  // Función para truncar URLs largas
  function truncateUrl(url: string, maxLength = 35) {
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength - 3) + '...';
  }

  // Agregar funcion para eliminar escaneos
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
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">{scans.length}</div>
              <div className="text-gray-600">Escaneos Totales</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-200">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {scans.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-gray-600">Completados</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-200">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {scans.reduce((total, scan) => total + scan.results.length, 0)}
              </div>
              <div className="text-gray-600">Vulnerabilidades</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {scans.filter(s => s.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).length}
              </div>
              <div className="text-gray-600">Última Semana</div>
            </div>
          </div>

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
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getStatusColor(scan.status)}`}>
                              {scan.status === 'completed' && 'Completado'}
                              {scan.status === 'running' && 'En progreso'}
                              {scan.status === 'failed' && 'Fallido'}
                            </span>
                            <span className="text-gray-500 text-sm">{scan.results.length} resultados</span>
                          </div>
                        </div>

                        {selectedScan?.id === scan.id && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <span className="text-gray-500 text-sm">Total</span>
                                <p className="text-gray-900 font-medium">{scan.results.length}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 text-sm">Accesibles</span>
                                <p className="text-green-600 font-medium">
                                  {scan.results.filter(r => r.http_status === 200).length}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500 text-sm">Redirecciones</span>
                                <p className="text-yellow-600 font-medium">
                                  {scan.results.filter(r => r.is_redirect).length}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500 text-sm">Errores</span>
                                <p className="text-red-600 font-medium">
                                  {scan.results.filter(r => r.http_status >= 400).length}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateReport(scan);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                            >
                              Generar Reporte
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
                    
                    <button className="w-full text-gray-500 hover:text-gray-700 transition-colors py-2">
                      Descargar Todos los Reportes
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

      {showAccountSettings && (
        <AccountSettings onClose={() => setShowAccountSettings(false)} />
      )}
    </div>
  );
};

export default Profile;
