
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Acerca de <span className="text-blue-600">BLITZ SCAN</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              <span className="text-blue-600 font-bold">BLITZ SCAN</span> es una herramienta avanzada de ciberseguridad 
              diseñada por profesionales para profesionales. Nuestra plataforma combina técnicas de penetration testing 
              automatizadas con análisis inteligente para proporcionar auditorías de seguridad comprehensivas.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              Desarrollada con tecnologías modernas, nuestra arquitectura <strong>frontend ↔ backend</strong> garantiza 
              escalabilidad, rendimiento y precisión en cada escaneo. Desde la detección de vulnerabilidades OWASP Top 10 
              hasta análisis forenses avanzados, BLITZ SCAN es tu aliado en la seguridad digital.
            </p>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🛡️ Características Principales</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Escaneos automatizados con IA y python</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Reportes detallados con evidencia</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Integración con marcos de trabajo automatizados en python</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>API REST para automatización</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5-6H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900">Tecnología Avanzada</h3>
                <p className="text-gray-600">
                  Algoritmos de machine learning para detección de patrones maliciosos y análisis predictivo de vulnerabilidades.
                </p>
                
                <div className="flex justify-center space-x-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">10M+</div>
                    <div className="text-sm text-gray-500">Escaneos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">500K+</div>
                    <div className="text-sm text-gray-500">Vulnerabilidades</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">99.8%</div>
                    <div className="text-sm text-gray-500">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-blue-50 rounded-3xl p-8 border border-blue-200">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Listo para Fortalecer tu Seguridad?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Únete a miles de profesionales que confían en BLITZ SCAN para sus auditorías de seguridad.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300">
                Probar Aplicación
              </Link>
              <a 
                href="#" 
                className="border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300"
                onClick={(e) => e.preventDefault()}
              >
                Ver Documentación
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
