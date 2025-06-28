import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('¡Bienvenido a BLITZ SCAN!');
        navigate('/scanner');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (error) {
      setError('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
      <div className="w-full max-w-4xl flex rounded-xl shadow-lg overflow-hidden bg-white">
        {/* Lado Izquierdo - Formulario */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center">
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/Logo.svg" alt="BLITZ SCAN Logo" className="h-10 w-10" />
              <span className="font-bold text-2xl text-gray-800">BLITZ SCAN</span>
            </Link>
          </div>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido de nuevo</h2>
            <p className="text-gray-600">Inicia sesión para acceder a tu cuenta</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="py-3 px-4 mb-4 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="tu@email.com"
                required
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                <Link to="#" className="text-sm text-indigo-600 hover:underline">¿Olvidaste tu contraseña?</Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Mostrar/ocultar contraseña"
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.062-4.675A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.675-.938" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="remember" name="remember" className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">Mantener sesión iniciada</label>
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
                disabled={isLoading}
                id="login-btn-modal"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Autenticando...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#4285F4" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button type="button" className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition">
                <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>
          </div>
          <p className="mt-8 text-center text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-800">Regístrate</Link>
          </p>
        </div>
        {/* Lado Derecho - Imagen/Info */}
        <div className="hidden md:block md:w-1/2 gradient-bg p-12">
          <div className="h-full flex flex-col justify-center items-center text-white">
            <div className="mb-8 animate-bounce-slow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center">Seguridad Web a tu Alcance</h3>
            <p className="text-center opacity-90">Accede a herramientas avanzadas para detectar vulnerabilidades en tus sitios web de prueba.</p>
            <div className="mt-12 w-full bg-white bg-opacity-20 p-6 rounded-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-white rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Análisis Completo</h4>
                  <p className="text-sm opacity-80">Detecta múltiples vulnerabilidades en un solo escaneo</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-white rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Resultados Rápidos</h4>
                  <p className="text-sm opacity-80">Obtén informes detallados en segundos</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Historial de Escaneos</h4>
                  <p className="text-sm opacity-80">Accede a todos tus análisis anteriores</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Fondo degradado para el lado derecho */}
      <style>{`
        .gradient-bg {
          background: linear-gradient(135deg, #5a6ff0 0%, #6a8dff 100%);
        }
      `}</style>
    </div>
  );
};

export default Login;
