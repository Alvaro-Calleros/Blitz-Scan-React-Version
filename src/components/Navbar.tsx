import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileAvatar from './ProfileAvatar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  const isActiveSection = (sectionId: string) => {
    if (location.pathname !== '/') return false;
    
    const element = document.getElementById(sectionId);
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return rect.top <= 100 && rect.bottom >= 100;
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const navbar = document.getElementById('navbar');
      if (navbar && !navbar.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav id="navbar" className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/Logo.svg" 
                alt="BLITZ SCAN Logo" 
                className="w-8 h-8"
              />
            </div>
            <span className="font-sans font-extrabold text-xl text-black tracking-tight uppercase">BLITZ SCAN</span>
          </Link>

          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-10">
              <Link to="/" className="relative font-semibold text-base px-1 transition-colors duration-200"
                style={{ color: location.pathname === '/' ? '#2196f3' : '#23272f' }}
              >
                Inicio
                {location.pathname === '/' && (
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-[#2196f3] rounded-full"></span>
                )}
              </Link>
              {!isAuthenticated ? (
                <>
                  <button 
                    onClick={() => scrollToSection('features')}
                    className={`font-semibold text-base px-1 transition-colors duration-200 ${isActiveSection('features') ? 'text-[#2196f3]' : 'text-[#23272f]'} hover:text-[#2196f3]`}
                  >
                    Características
                  </button>
                  <button 
                    onClick={() => scrollToSection('how-it-works')}
                    className={`font-semibold text-base px-1 transition-colors duration-200 ${isActiveSection('how-it-works') ? 'text-[#2196f3]' : 'text-[#23272f]'} hover:text-[#2196f3]`}
                  >
                    Funcionamiento
                  </button>
                  <button 
                    onClick={() => scrollToSection('about')}
                    className={`font-semibold text-base px-1 transition-colors duration-200 ${isActiveSection('about') ? 'text-[#2196f3]' : 'text-[#23272f]'} hover:text-[#2196f3]`}
                  >
                    Acerca del Proyecto
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/scanner" 
                    className={`font-semibold text-base px-1 transition-colors duration-200 ${location.pathname === '/scanner' ? 'text-[#2196f3]' : 'text-[#23272f]'} hover:text-[#2196f3]`}
                  >
                    Scanner
                  </Link>
                  <Link 
                    to="/profile" 
                    className={`font-semibold text-base px-1 transition-colors duration-200 ${location.pathname === '/profile' ? 'text-[#2196f3]' : 'text-[#23272f]'} hover:text-[#2196f3]`}
                  >
                    Perfil
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="bg-[#2196f3] hover:bg-[#1976d2] text-white font-semibold py-2 px-7 rounded-full transition-all duration-200 text-base shadow-none">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="text-[#23272f] hover:text-[#2196f3] font-semibold text-base px-2 transition-colors duration-200">
                  Registrar
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 px-4 py-2 rounded-full transition-all duration-200 group"
                >
                  <ProfileAvatar size="sm" />
                  <div className="flex flex-col">
                    <span className="text-blue-700 font-semibold group-hover:text-blue-800 transition-colors">
                      {user?.name}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-red-50 group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Cerrar Sesión</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="flex flex-col py-4 space-y-2">
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/" 
                    className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                  <Link 
                    to="/demo" 
                    className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ver Demo
                  </Link>
                  <div className="px-4 py-2 space-y-2">
                    <Link 
                      to="/login" 
                      className="block text-center text-blue-600 hover:text-blue-700 transition-colors py-2 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link 
                      to="/register" 
                      className="block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registrar
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-3 py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl transition-all duration-200 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <ProfileAvatar size="lg" />
                    <div className="flex flex-col">
                      <span className="text-blue-700 font-semibold group-hover:text-blue-800 transition-colors">
                        {user?.name}
                      </span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link 
                    to="/scanner" 
                    className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Scanner
                  </Link>
                  <Link 
                    to="/profile" 
                    className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Perfil
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center space-x-3 text-gray-700 hover:text-red-600 transition-all duration-200 py-3 px-4 font-medium text-left hover:bg-red-50 rounded-lg group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
