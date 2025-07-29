import React from 'react';

interface FuzzingResultProps {
  results: Array<{
    id_fuzz_result: number;
    path_found: string;
    http_status: number;
    is_redirect: boolean;
  }>;
}

const getStatusColor = (status: number) => {
  if (status >= 200 && status < 300) return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
  if (status >= 300 && status < 400) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
  if (status >= 400 && status < 500) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
  return 'bg-gradient-to-r from-red-400 to-red-600 text-white';
};

const getStatusIcon = (status: number) => {
  if (status >= 200 && status < 300) return '✓';
  if (status >= 300 && status < 400) return '→';
  if (status >= 400 && status < 500) return '⚠';
  return '✗';
};

const getStatusText = (status: number) => {
  if (status >= 200 && status < 300) return 'Éxito';
  if (status >= 300 && status < 400) return 'Redirección';
  if (status >= 400 && status < 500) return 'Error Cliente';
  return 'Error Servidor';
};

const FuzzingResult: React.FC<FuzzingResultProps> = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="glass-card modern-shadow p-12 flex flex-col items-center justify-center animate-fadeInUp text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h4 className="text-2xl font-bold text-gray-700 mb-2">No se encontraron rutas visibles</h4>
        <p className="text-gray-500 text-lg">El escaneo no detectó información relevante para este objetivo.</p>
      </div>
    );
  }

  const successfulPaths = results.filter(r => r.http_status >= 200 && r.http_status < 300);
  const redirectPaths = results.filter(r => r.http_status >= 300 && r.http_status < 400);
  const errorPaths = results.filter(r => r.http_status >= 400);
  const totalPaths = results.length;

  return (
    <div className="space-y-8">
      {/* Header innovador */}
      <div className="glass-card modern-shadow p-10 bg-gradient-to-br from-purple-50 to-blue-50 animate-fadeInUp">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Escaneo de Directorios
              </h3>
              <p className="text-gray-600 mt-1">Búsqueda de rutas y archivos ocultos</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900">{totalPaths}</div>
            <div className="text-sm text-gray-500">Rutas encontradas</div>
          </div>
        </div>
      </div>

      {/* Estadísticas visuales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card modern-shadow p-6 bg-gradient-to-br from-green-50 to-green-100 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">{successfulPaths.length}</div>
              <div className="text-sm text-green-700">Éxitos</div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">✓</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(successfulPaths.length / totalPaths) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-card modern-shadow p-6 bg-gradient-to-br from-blue-50 to-blue-100 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">{redirectPaths.length}</div>
              <div className="text-sm text-blue-700">Redirecciones</div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">→</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(redirectPaths.length / totalPaths) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-card modern-shadow p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-yellow-600">{errorPaths.length}</div>
              <div className="text-sm text-yellow-700">Errores</div>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">⚠</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-yellow-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(errorPaths.length / totalPaths) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-card modern-shadow p-6 bg-gradient-to-br from-purple-50 to-purple-100 animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {Math.round((successfulPaths.length / totalPaths) * 100)}%
              </div>
              <div className="text-sm text-purple-700">Tasa de Éxito</div>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de resultados innovadora */}
      <div className="glass-card modern-shadow p-8 animate-fadeInUp">
        <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">Resultados Detallados</span>
          <span className="modern-badge bg-gray-100 text-gray-700">{totalPaths}</span>
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-gray-500 border-b border-gray-200">
                <th className="py-4 px-6 font-medium text-left">Ruta</th>
                <th className="py-4 px-6 font-medium text-center">Estado</th>
                <th className="py-4 px-6 font-medium text-center">Tipo</th>
                <th className="py-4 px-6 font-medium text-center">Redirección</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((r, index) => (
                <tr 
                  key={r.id_fuzz_result} 
                  className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full"></div>
                      <span className="font-mono text-gray-900 group-hover:text-purple-600 transition-colors">
                        {r.path_found}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(r.http_status)}`}>
                      <span className="mr-2">{getStatusIcon(r.http_status)}</span>
                      {r.http_status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-sm text-gray-600">{getStatusText(r.http_status)}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      r.is_redirect 
                        ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {r.is_redirect ? 'Sí' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Análisis de seguridad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`glass-card modern-shadow p-8 animate-fadeInUp ${
          successfulPaths.length > 0 
            ? 'bg-gradient-to-br from-red-50 to-red-100' 
            : 'bg-gradient-to-br from-green-50 to-green-100'
        }`}>
          <h5 className={`text-xl font-bold mb-4 flex items-center ${
            successfulPaths.length > 0 ? 'text-red-900' : 'text-green-900'
          }`}>
            <span className="mr-2">🔒</span>
            Análisis de Seguridad
          </h5>
          <div className="space-y-3">
            {successfulPaths.length > 0 ? (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-800 font-medium">
                  {successfulPaths.length} rutas accesibles encontradas
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-800 font-medium">
                  No se encontraron rutas accesibles
                </span>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${redirectPaths.length > 0 ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
              <span className="text-gray-700">
                {redirectPaths.length} redirecciones detectadas
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${errorPaths.length > 0 ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
              <span className="text-gray-700">
                {errorPaths.length} errores 4xx/5xx encontrados
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
            {successfulPaths.length > 0 ? (
              <>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-red-800">Revisar rutas accesibles no autorizadas</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span className="text-yellow-800">Implementar controles de acceso</span>
                </li>
              </>
            ) : (
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span className="text-green-800">Excelente: No se encontraron rutas accesibles</span>
              </li>
            )}
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span className="text-blue-800">Ocultar información sensible en headers</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span className="text-blue-800">Verificar configuración de redirecciones</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FuzzingResult; 