import React from 'react';
import { getTechLogo, getCategoryColor } from '../utils/techLogos';
import './WhatWebResult.css';

interface Technology {
  name: string;
  version?: string;
}

interface WhatWebResultProps {
  result: Record<string, Technology[]> | string;
}

const WhatWebResult: React.FC<WhatWebResultProps> = ({ result }) => {
  // Si el resultado es un string, mostrarlo como texto plano
  if (typeof result === 'string') {
    return (
      <div className="wappalyzer-container">
        <div className="wappalyzer-header">
          <div className="wappalyzer-logo">
            <span className="wappalyzer-icon">🕵️‍♂️</span>
            <span className="wappalyzer-title">WhatWeb</span>
          </div>
        </div>
        <div className="wappalyzer-content">
          <pre className="wappalyzer-text-result">{result}</pre>
        </div>
      </div>
    );
  }

  // Si es un objeto, mostrar con estilo Wappalyzer
  const categories = Object.entries(result).filter(([_, techs]) => 
    Array.isArray(techs) && techs.length > 0
  );

  // Ordenar categorías por prioridad
  const priorityCategories = ['Web Server', 'CMS', 'Programming Language', 'JS Framework', 'Analytics', 'CDN', 'Database', 'Security'];
  const sortedCategories = categories.sort(([a], [b]) => {
    const aPriority = priorityCategories.indexOf(a);
    const bPriority = priorityCategories.indexOf(b);
    if (aPriority === -1 && bPriority === -1) return 0;
    if (aPriority === -1) return 1;
    if (bPriority === -1) return -1;
    return aPriority - bPriority;
  });

  // Dividir categorías en dos columnas
  const midPoint = Math.ceil(sortedCategories.length / 2);
  const leftColumn = sortedCategories.slice(0, midPoint);
  const rightColumn = sortedCategories.slice(midPoint);

  return (
    <div className="wappalyzer-container">
      {/* Header estilo Wappalyzer */}
      <div className="wappalyzer-header">
        <div className="wappalyzer-logo">
          <span className="wappalyzer-icon">🕵️‍♂️</span>
          <span className="wappalyzer-title">WhatWeb</span>
        </div>
        <div className="wappalyzer-actions">
          <span className="wappalyzer-count">{sortedCategories.length} categorías</span>
        </div>
      </div>

      {/* Contenido en dos columnas */}
      <div className="wappalyzer-content">
        <div className="wappalyzer-columns">
          {/* Columna izquierda */}
          <div className="wappalyzer-column">
            {leftColumn.map(([category, technologies]) => (
              <div key={category} className="wappalyzer-category">
                <h3 className="wappalyzer-category-title">{category}</h3>
                <div className="wappalyzer-technologies">
                  {technologies.map((tech, idx) => {
                    const techLogo = getTechLogo(tech.name);
                    return (
                      <div key={idx} className="wappalyzer-technology">
                        <div className="wappalyzer-tech-logo">
                          <img 
                            src={techLogo.logo} 
                            alt={techLogo.name}
                            className="wappalyzer-logo-img"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLElement;
                              target.style.display = 'none';
                              const nextSibling = target.nextElementSibling as HTMLElement;
                              if (nextSibling) {
                                nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div 
                            className="wappalyzer-logo-fallback"
                            style={{ display: 'none' }}
                          >
                            <span className="fallback-icon">🔧</span>
                          </div>
                        </div>
                        <div className="wappalyzer-tech-info">
                          <span className="wappalyzer-tech-name">{tech.name}</span>
                          {tech.version && (
                            <span className="wappalyzer-tech-version">{tech.version}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Columna derecha */}
          <div className="wappalyzer-column">
            {rightColumn.map(([category, technologies]) => (
              <div key={category} className="wappalyzer-category">
                <h3 className="wappalyzer-category-title">{category}</h3>
                <div className="wappalyzer-technologies">
                  {technologies.map((tech, idx) => {
                    const techLogo = getTechLogo(tech.name);
                    return (
                      <div key={idx} className="wappalyzer-technology">
                        <div className="wappalyzer-tech-logo">
                          <img 
                            src={techLogo.logo} 
                            alt={techLogo.name}
                            className="wappalyzer-logo-img"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLElement;
                              target.style.display = 'none';
                              const nextSibling = target.nextElementSibling as HTMLElement;
                              if (nextSibling) {
                                nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                          <div 
                            className="wappalyzer-logo-fallback"
                            style={{ display: 'none' }}
                          >
                            <span className="fallback-icon">🔧</span>
                          </div>
                        </div>
                        <div className="wappalyzer-tech-info">
                          <span className="wappalyzer-tech-name">{tech.name}</span>
                          {tech.version && (
                            <span className="wappalyzer-tech-version">{tech.version}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatWebResult; 