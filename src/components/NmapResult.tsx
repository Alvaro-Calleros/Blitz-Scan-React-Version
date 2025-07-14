import React from 'react';

interface NmapResultProps {
  result: { raw: string; openPorts: Array<{ port: string; service: string; version?: string }> };
}

// Función para calcular el riesgo según el puerto/servicio
function getRiskLevel(service: string, port: string): { label: string; color: string; bgColor: string; icon: string } {
  const criticalServices = ['telnet', 'ftp', 'rsh', 'rlogin'];
  const highRiskPorts = ['22', '23', '21', '3389', '1433', '3306', '5432'];
  
  if (criticalServices.includes(service.toLowerCase())) {
    return { 
      label: 'Crítico', 
      color: 'text-red-700', 
      bgColor: 'bg-gradient-to-r from-red-400 to-red-600',
      icon: '🚨'
    };
  }
  if (highRiskPorts.includes(port.split('/')[0])) {
    return { 
      label: 'Alto', 
      color: 'text-yellow-700', 
      bgColor: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      icon: '⚠️'
    };
  }
  return { 
    label: 'Bajo', 
    color: 'text-green-700', 
    bgColor: 'bg-gradient-to-r from-green-400 to-green-600',
    icon: '✅'
  };
}

const getServiceCategory = (service: string) => {
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
};

const getCategoryIcon = (category: string) => {
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
};

const NmapResult: React.FC<NmapResultProps> = ({ result }) => {
  const openPorts = result.openPorts || [];
  const hasOpenPorts = openPorts.length > 0;

  // Análisis de datos
  const criticalPorts = openPorts.filter(p => getRiskLevel(p.service, p.port).label === 'Crítico');
  const highRiskPorts = openPorts.filter(p => getRiskLevel(p.service, p.port).label === 'Alto');
  const lowRiskPorts = openPorts.filter(p => getRiskLevel(p.service, p.port).label === 'Bajo');
  
  const portsByCategory = openPorts.reduce((acc, port) => {
    const category = getServiceCategory(port.service);
    if (!acc[category]) acc[category] = [];
    acc[category].push(port);
    return acc;
  }, {} as Record<string, typeof openPorts>);

  return (
    <div className="space-y-8">
      {/* Header innovador */}
      <div className="glass-card modern-shadow p-10 bg-gradient-to-br from-blue-50 to-indigo-50 animate-fadeInUp">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Escaneo de Puertos
              </h3>
              <p className="text-gray-600 mt-1">Análisis profesional de servicios abiertos</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900">{openPorts.length}</div>
            <div className="text-sm text-gray-500">Puertos abiertos</div>
          </div>
        </div>
      </div>

      {/* Dashboard de métricas */}
      {hasOpenPorts ? (
        <>
          {/* Métricas de riesgo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card modern-shadow p-6 bg-gradient-to-br from-red-50 to-red-100 animate-fadeInUp">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-red-600">{criticalPorts.length}</div>
                  <div className="text-sm text-red-700">Críticos</div>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-xl">🚨</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(criticalPorts.length / openPorts.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="glass-card modern-shadow p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 animate-fadeInUp">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-yellow-600">{highRiskPorts.length}</div>
                  <div className="text-sm text-yellow-700">Alto Riesgo</div>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-xl">⚠️</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-yellow-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(highRiskPorts.length / openPorts.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="glass-card modern-shadow p-6 bg-gradient-to-br from-green-50 to-green-100 animate-fadeInUp">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600">{lowRiskPorts.length}</div>
                  <div className="text-sm text-green-700">Bajo Riesgo</div>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-xl">✅</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(lowRiskPorts.length / openPorts.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="glass-card modern-shadow p-6 bg-gradient-to-br from-purple-50 to-purple-100 animate-fadeInUp">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-600">{Object.keys(portsByCategory).length}</div>
                  <div className="text-sm text-purple-700">Categorías</div>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-xl">📊</span>
                </div>
              </div>
            </div>
          </div>

          {/* Distribución por categorías */}
          <div className="glass-card modern-shadow p-8 animate-fadeInUp">
            <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">Distribución por Categorías</span>
              <span className="modern-badge bg-gray-100 text-gray-700">{Object.keys(portsByCategory).length}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(portsByCategory).map(([category, ports]) => (
                <div key={category} className="glass-card modern-shadow p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-blue-100 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      <h5 className="text-lg font-semibold text-gray-900">{category}</h5>
                    </div>
                    <span className="modern-badge bg-blue-100 text-blue-700">{ports.length}</span>
                  </div>
                  <div className="space-y-2">
                    {ports.slice(0, 3).map((port, index) => {
                      const risk = getRiskLevel(port.service, port.port);
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <span className="font-mono text-sm text-gray-700">{port.port}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${risk.bgColor} text-white`}>
                            {risk.icon} {risk.label}
                          </span>
                        </div>
                      );
                    })}
                    {ports.length > 3 && (
                      <div className="text-center text-sm text-gray-500">
                        +{ports.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla detallada */}
          <div className="glass-card modern-shadow p-8 animate-fadeInUp">
            <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">Análisis Detallado</span>
              <span className="modern-badge bg-gray-100 text-gray-700">{openPorts.length}</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-200">
                    <th className="py-4 px-6 font-medium text-left">Puerto</th>
                    <th className="py-4 px-6 font-medium text-left">Servicio</th>
                    <th className="py-4 px-6 font-medium text-left">Versión</th>
                    <th className="py-4 px-6 font-medium text-center">Riesgo</th>
                    <th className="py-4 px-6 font-medium text-center">Categoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {openPorts.map((p, index) => {
                    const risk = getRiskLevel(p.service, p.port);
                    const category = getServiceCategory(p.service);
                    return (
                      <tr 
                        key={index} 
                        className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 group"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                            <span className="font-mono text-gray-900 group-hover:text-blue-600 transition-colors">
                              {p.port}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-700">{p.service}</td>
                        <td className="py-4 px-6 text-gray-700">{p.version || '-'}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${risk.bgColor} text-white`}>
                            <span className="mr-2">{risk.icon}</span>
                            {risk.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <span className="mr-1">{getCategoryIcon(category)}</span>
                            {category}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card modern-shadow p-12 flex flex-col items-center justify-center animate-fadeInUp">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
            </svg>
          </div>
          <h4 className="text-2xl font-bold text-green-700 mb-2">¡Excelente!</h4>
          <p className="text-gray-600 text-lg">No se detectaron puertos abiertos. El servidor está bien configurado.</p>
        </div>
      )}

      {/* Análisis de seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card modern-shadow p-8 bg-gradient-to-br from-red-50 to-red-100 animate-fadeInUp">
          <h5 className="text-xl font-bold text-red-900 mb-4 flex items-center">
            <span className="mr-2">🔒</span>
            Análisis de Seguridad
          </h5>
          <div className="space-y-3">
            {criticalPorts.length > 0 && (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-800 font-medium">
                  {criticalPorts.length} puertos críticos detectados
                </span>
              </div>
            )}
            {highRiskPorts.length > 0 && (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-800 font-medium">
                  {highRiskPorts.length} puertos de alto riesgo
                </span>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${hasOpenPorts ? 'bg-blue-500' : 'bg-green-500'}`}></div>
              <span className="text-gray-700">
                {hasOpenPorts ? `${openPorts.length} servicios expuestos` : 'No se detectaron servicios expuestos'}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card modern-shadow p-8 bg-gradient-to-br from-blue-50 to-blue-100 animate-fadeInUp">
          <h5 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Recomendaciones
          </h5>
          <ul className="space-y-2 text-sm">
            {criticalPorts.length > 0 && (
              <li className="flex items-start space-x-2">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-red-800">URGENTE: Bloquear puertos críticos</span>
              </li>
            )}
            {highRiskPorts.length > 0 && (
              <li className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-yellow-800">Configurar autenticación fuerte</span>
              </li>
            )}
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span className="text-blue-800">Configurar firewall apropiadamente</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span className="text-blue-800">Mantener servicios actualizados</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NmapResult; 