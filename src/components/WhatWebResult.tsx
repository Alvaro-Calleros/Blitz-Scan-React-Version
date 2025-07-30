import React from 'react';
import { getTechLogo, getCategoryIcon } from '../utils/techLogos';

interface Technology {
  name: string;
  version?: string;
}

interface WhatWebResultProps {
  result: Record<string, Technology[]> | string;
}

const WhatWebResult: React.FC<WhatWebResultProps> = ({ result }) => {
  // Si el resultado es un string, mostrar como texto plano
  if (typeof result === 'string') {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🕵️‍♂️</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">WhatWeb Resultados</h3>
            <p className="text-gray-600 text-sm">Fingerprinting de tecnologías web</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="text-gray-700 whitespace-pre-wrap text-sm font-mono">
            {result}
          </pre>
        </div>
      </div>
    );
  }

  // Contar total de tecnologías
  const totalTechnologies = Object.values(result).flat().length;

  // Si no hay tecnologías detectadas
  if (totalTechnologies === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🕵️‍♂️</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">WhatWeb Resultados</h3>
            <p className="text-gray-600 text-sm">Fingerprinting de tecnologías web</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-2">🔍</div>
          <p className="text-gray-600">No se detectaron tecnologías web</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🕵️‍♂️</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Resultados WhatWeb</h2>
              <p className="text-blue-100 text-sm">Tecnologías detectadas</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/80 text-sm">
              {Object.keys(result).filter(cat => result[cat]?.length > 0).length} categorías
            </div>
            <div className="text-white/60 text-xs">
              {totalTechnologies} tecnologías
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(result)
            .filter(([category, technologies]) => Array.isArray(technologies) && technologies.length > 0)
            .map(([category, technologies]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* Header de categoría */}
                <div className="flex items-center mb-3">
                  <span className="text-lg mr-2">{getCategoryIcon(category)}</span>
                  <h3 className="font-medium text-gray-900 text-sm">{category}</h3>
                  <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {technologies.length}
                  </span>
                </div>
                
                {/* Lista de tecnologías */}
                <div className="space-y-2">
                  {technologies.map((tech, idx) => {
                    const techLogo = getTechLogo(tech.name);
                    return (
                      <div key={idx} className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                        {/* Logo de la tecnología */}
                        <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                          <img 
                            src={techLogo.logo} 
                            alt={techLogo.name}
                            className="w-4 h-4"
                            style={{ 
                              objectFit: 'contain'
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'w-4 h-4 bg-gray-300 rounded flex items-center justify-center';
                              fallback.innerHTML = '<span class="text-gray-500 text-xs">?</span>';
                              target.parentNode?.appendChild(fallback);
                            }}
                          />
                        </div>
                        
                        {/* Información de la tecnología */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 text-sm truncate">
                              {tech.name}
                            </span>
                            {tech.version && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                v{tech.version}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Total: <strong className="text-gray-900">{totalTechnologies}</strong> tecnologías detectadas</span>
            <span className="text-green-600 font-medium">✓ Escaneo completado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatWebResult; 