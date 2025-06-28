import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Hero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section
      className="w-full bg-gradient-to-br from-[#4f8cff] to-[#3887f6] pt-0 pb-0"
      style={{ minHeight: '420px' }}
      id="hero"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between w-full py-16 md:py-0" style={{ minHeight: '620px' }}>
        {/* Hero Content */}
        <div className="flex-1 md:pr-8 text-left flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight" style={{ letterSpacing: 0 }}>
            Detecta vulnerabilidades web con facilidad
          </h1>
          <p className="text-base md:text-lg text-white/90 mb-7 max-w-xl">
            TestWeb Secure es una aplicación orientada a la detección de vulnerabilidades web como herramienta profesional para la ciberseguridad de tu sitio web.
          </p>
          <div className="flex flex-row gap-3">
            <Link to={isAuthenticated ? "/scanner" : "/register"}>
              <button className="bg-white text-blue-600 border border-white font-semibold py-2 px-6 rounded-full text-base shadow-sm hover:bg-blue-50 transition-all">
                Comenzar Ahora
              </button>
            </Link>
            <Link to="/demo">
              <button className="bg-transparent text-white border border-white font-semibold py-2 px-6 rounded-full text-base shadow-sm hover:bg-white hover:text-blue-600 transition-all">
                Ver Demo
              </button>
            </Link>
          </div>
        </div>
        {/* Hero Card */}
        <div className="flex-1 flex justify-center md:justify-end mt-10 md:mt-0">
          <div className="bg-white rounded-xl shadow-lg p-5 max-w-xs w-full flex flex-col items-center relative animate-bounce-slow" style={{ minWidth: 270 }}>
            <div className="flex items-center justify-center w-16 h-16 bg-white border-4 border-blue-200 rounded-full mb-2 -mt-8 shadow" style={{ zIndex: 2 }}>
              <img src="/Logo.svg" alt="Blitz Scan Logo" className="w-10 h-10" />
            </div>
            <div className="w-full text-center mt-2">
              <div className="text-lg font-bold text-gray-900 mb-0.5">Análisis de Seguridad</div>
              <div className="text-sm text-gray-500 mb-3">Escaneo en progreso...</div>
              <div className="bg-gray-200 rounded-full h-1 w-full mb-2">
                <div className="bg-blue-600 h-1 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="absolute -bottom-4 right-0 bg-white rounded-full p-1.5 shadow-lg flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
