import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { apiService, LoginRequest } from '../services/api.ts';

interface LoginPageProps {
  onLogin: (success: boolean, token?: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const quotes = [
    "Ibarra es el alma de la Sierra Norte; su historia es ejemplo de resurgimiento - Benjamín Carrión",
    "El terremoto de 1868 destruyó la ciudad, pero no el espíritu ibarreño. Esa ciudad se reconstruyó con el corazón de su pueblo - Pedro Moncayo",
    "Ibarra es la cuna de hombres libres y pensamiento ilustrado - Eloy Alfaro",
    "Entre Yahuarcocha y el Imbabura se respira historia. Ibarra no olvida su origen ni su destino - Luis Felipe Borja",
    "El blanco de Ibarra no es solo su cal, es la limpieza de su cultura - Jorge Icaza",
    "Ibarra vive en mi memoria como el lugar donde el cielo toca la tierra - Oswaldo Guayasamín",
    "Si Ecuador tiene un norte con dignidad, ese es Ibarra - Alfonso Moreno Mora",
    "En la Ciudad Blanca cada piedra habla; basta escuchar con respeto - Luis Alberto Costales",
    "De las cenizas nació la nueva Ibarra, como el ave fénix de los Andes - Manuel Jijón Larrea",
    "Ibarra no necesita testigos, su belleza habla por sí sola - Julio Pazos Barrera"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  // Verificar conexión con el servidor al cargar el componente
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        console.log('Verificando conexión con el servidor...');
        const healthCheck = await apiService.healthCheck();
        if (healthCheck.success) {
          console.log('✅ Servidor conectado');
        } else {
          console.warn('⚠️ Servidor no responde correctamente:', healthCheck.message);
        }
      } catch (error) {
        console.error('❌ Error verificando servidor:', error);
      }
    };

    checkServerConnection();
  }, []);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const credentials: LoginRequest = {
        username: username.trim(),
        password: password.trim()
      };

      // Validación básica
      if (!credentials.username || !credentials.password) {
        setError('Por favor, complete todos los campos');
        setIsLoading(false);
        onLogin(false);
        return;
      }

      console.log('🔐 Intentando login...');
      console.log('📧 Usuario:', credentials.username);
      console.log('🔗 API Service:', apiService);
      console.log('🔗 Login method exists:', typeof apiService.login === 'function');

      // Verificar que apiService y login existen
      if (!apiService || typeof apiService.login !== 'function') {
        console.error('❌ apiService.login no es una función:', apiService);
        setError('Error interno: Servicio de autenticación no disponible');
        setIsLoading(false);
        onLogin(false);
        return;
      }

      // Llamada a la API
      const response = await apiService.login(credentials);
      
      console.log('📝 Respuesta del login:', response);
      
      if (response.success && response.token) {
        console.log('✅ Login exitoso');
        
        // Guardar token en localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('authToken', response.token);
          
          // Guardar datos del usuario si existen
          if (response.user) {
            localStorage.setItem('userData', JSON.stringify(response.user));
          }
        }
        
        onLogin(true, response.token);
      } else {
        console.log('❌ Login fallido:', response.message);
        setError(response.message || 'Credenciales incorrectas');
        onLogin(false);
      }
    } catch (error) {
      console.error('💥 Error durante login:', error);
      console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Error más específico
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          setError('Error de conexión. Verifique que el servidor esté disponible.');
        } else if (error.message.includes('JSON')) {
          setError('Error procesando respuesta del servidor.');
        } else {
          setError(`Error: ${error.message}`);
        }
      } else {
        setError('Error desconocido durante el login');
      }
      
      onLogin(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 relative overflow-hidden flex items-center justify-center p-4">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-slate-100/30 to-gray-200/50"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-32 h-32 bg-slate-300/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gray-300/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-slate-200/25 rounded-full blur-lg animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-white/20 rounded-full blur-xl animate-pulse delay-700"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 relative overflow-hidden">
          {/* Borde superior decorativo */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 via-gray-500 to-slate-600"></div>
          
          {/* Elementos decorativos internos */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-slate-200/30 to-gray-300/20 rounded-full blur-sm"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-tr from-white/40 to-slate-100/30 rounded-full blur-sm"></div>
          
          {/* Logo y encabezado */}
          <div className="text-center mb-8 relative z-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full flex items-center justify-center mb-4 shadow-xl relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-full"></div>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Escudo_de_Ibarra_%28Ecuador%29.png/250px-Escudo_de_Ibarra_%28Ecuador%29.png" 
                alt="Escudo GAD Ibarra" 
                className="w-12 h-12 relative z-10"
                onError={handleImageError}
              />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-gray-800 to-slate-900 bg-clip-text text-transparent mb-2">
              Bienvenido
            </h1>
            <p className="text-slate-600 text-sm font-medium">
              Municipalidad de Ibarra
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Gestión de Locales Comerciales y Emprendimientos
            </p>
          </div>

          {/* Frase rotativa */}
          <div className="mb-6 h-12 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 via-white/30 to-slate-50/50 rounded-lg"></div>
            <p className="text-xs text-slate-600 text-center italic animate-pulse relative z-10 px-3">
              "{quotes[currentQuote]}"
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg relative z-10 animate-shake">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all duration-200 hover:border-slate-400 bg-white/70 backdrop-blur-sm"
                  placeholder="Ingrese su usuario"
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all duration-200 hover:border-slate-400 bg-white/70 backdrop-blur-sm"
                  placeholder="Ingrese su contraseña"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-slate-500 hover:text-slate-700 transition-colors duration-200"
                  disabled={isLoading}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-slate-600 via-gray-700 to-slate-800 text-white py-3 rounded-xl font-semibold hover:from-slate-700 hover:via-gray-800 hover:to-slate-900 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center relative z-10">
            <p className="text-xs text-slate-500">
              © 2025 GAD Municipal de Ibarra
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Versión 1.0.0
            </p>
          </div>
        </div>
      </div>
      
      {/* CSS personalizado para animación shake */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;