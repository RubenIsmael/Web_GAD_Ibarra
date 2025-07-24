import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, Wifi, WifiOff } from 'lucide-react';

// Interfaces definidas directamente en el componente
interface LoginRequest {
  username: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: User;
}

interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Servicio API simplificado y mejorado
const createApiService = () => {
  const API_BASE_URL = 'http://34.10.172.54:8080';

  // Función para obtener token 
  const getAuthToken = (): string | null => {
    
    return null;
  };

  const getHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
    };

    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  const healthCheck = async (): Promise<ApiResponse<Record<string, unknown>>> => {
    try {
      console.log('🏥 Verificando salud del servidor...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Reducido a 3 segundos

      try {
        const response = await fetch(API_BASE_URL, {
          method: 'HEAD', 
          signal: controller.signal,
          headers: { 
            'Accept': '*/*',
            'Cache-Control': 'no-cache'
          },
        });
        
        clearTimeout(timeoutId);
        console.log(`✅ Servidor respondió con status: ${response.status}`);
        
        return {
          success: true,
          message: 'Servidor disponible',
          data: { status: 'ok', timestamp: new Date().toISOString() }
        };
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
    } catch (error) {
      console.error('❌ Error en health check:', error);
      
      let errorMessage = 'No se pudo conectar con el servidor';
      if (error instanceof DOMException && error.name === 'AbortError') {
        errorMessage = 'Timeout de conexión';
      } else if (error instanceof TypeError) {
        errorMessage = 'Error de red o CORS';
      }
      
      return {
        success: false,
        error: errorMessage,
        message: 'Servidor no disponible'
      };
    }
  };

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('🔐 Intentando login con:', credentials.username);
      
      // Validaciones básicas
      if (!credentials.username?.trim() || !credentials.password?.trim()) {
        return {
          success: false,
          message: 'Usuario y contraseña son requeridos'
        };
      }

      const endpoints = [
        '/api/auth/login',
        '/auth/login', 
        '/login',
        '/api/login',
        '/api/v1/auth/login'
      ];
      
      let lastError = '';
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🎯 Probando endpoint: ${API_BASE_URL}${endpoint}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
          
          const requestBody = JSON.stringify({
            username: credentials.username.trim(),
            password: credentials.password.trim()
          });
          
          console.log('📦 Request body:', requestBody);
          
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: requestBody,
            signal: controller.signal,
            mode: 'cors', 
          });

          clearTimeout(timeoutId);
          console.log(`📡 ${endpoint} respondió con status: ${response.status}`);
          console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()));

       
          if (response.status === 404 || response.status === 405) {
            console.log(`⏭️ ${endpoint} no disponible, probando siguiente...`);
            continue;
          }

          let data: Record<string, unknown> = {};
          const contentType = response.headers.get('content-type') || '';
          
          try {
            const responseText = await response.text();
            console.log(`📄 Response text (${responseText.length} chars):`, responseText.substring(0, 500));
            
            if (responseText.trim()) {
              if (contentType.includes('application/json') || 
                  responseText.trim().startsWith('{') || 
                  responseText.trim().startsWith('[')) {
                data = JSON.parse(responseText);
              } else {
                data = { message: responseText };
              }
            } else {
              data = { message: 'Respuesta vacía del servidor' };
            }
          } catch (parseError) {
            console.error('❌ Error parseando respuesta:', parseError);
            data = { message: 'Error al procesar respuesta del servidor' };
          }

          console.log('📊 Datos procesados:', data);
          
          if (response.ok && (response.status >= 200 && response.status < 300)) {
            console.log('✅ Login exitoso!');
            
            // Buscar token en diferentes posibles ubicaciones
            const token = (data.token || 
                         data.accessToken || 
                         data.access_token || 
                         data.authToken ||
                         data.jwt ||
                         response.headers.get('Authorization') ||
                         response.headers.get('X-Auth-Token')) as string | undefined;
            
            const userData = (data.user || data.userData) as Record<string, unknown> | undefined;
            const user: User = userData ? {
              id: (userData.id as string) || Date.now().toString(),
              username: (userData.username as string) || credentials.username,
              email: (userData.email as string) || `${credentials.username}@ibarra.gob.ec`,
              role: (userData.role as string) || 'user'
            } : {
              id: (data.id || data.userId || Date.now().toString()) as string,
              username: credentials.username,
              email: (data.email as string) || `${credentials.username}@ibarra.gob.ec`,
              role: (data.role as string) || 'user'
            };
            
            return {
              success: true,
              token: token,
              user: user,
              message: (data.message as string) || 'Autenticación exitosa',
            };
          } else {
            const errorMessage = (data.message || data.error || `Error HTTP ${response.status}`) as string;
            console.log(`❌ Login falló: ${errorMessage}`);
            lastError = errorMessage;
            
            // Si es error de credenciales, no seguir probando
            if (response.status === 401 || response.status === 403) {
              return {
                success: false,
                message: 'Credenciales incorrectas. Verifique su usuario y contraseña.',
              };
            }
            
            // Para errores del servidor, seguir con el siguiente endpoint
            if (response.status >= 500) {
              console.log(`🔄 Error del servidor ${response.status}, probando siguiente...`);
              continue;
            }
            
            // Para otros errores, también devolver inmediatamente
            return {
              success: false,
              message: errorMessage,
            };
          }
          
        } catch (endpointError) {
          console.error(`💥 Error con endpoint ${endpoint}:`, endpointError);
          
          if (endpointError instanceof DOMException && endpointError.name === 'AbortError') {
            lastError = 'Timeout de conexión';
          } else if (endpointError instanceof TypeError) {
            lastError = 'Error de red o CORS';
          } else {
            lastError = endpointError instanceof Error ? endpointError.message : 'Error desconocido';
          }
          
          continue;
        }
      }
      
      return {
        success: false,
        message: lastError || 'No se encontró un endpoint de login funcional',
      };
      
    } catch (loginError) {
      console.error('💥 Error general de login:', loginError);
      return {
        success: false,
        message: loginError instanceof Error ? loginError.message : 'Error de conexión con el servidor',
      };
    }
  };

  return { healthCheck, login };
};

// Crear instancia del servicio API
const apiService = createApiService();

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
  const [serverStatus, setServerStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

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

  // Verificar conexión con el servidor
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        console.log('🔍 Verificando conexión con el servidor...');
        setServerStatus('checking');
        
        const healthCheck = await apiService.healthCheck();
        
        if (healthCheck.success) {
          console.log('✅ Servidor conectado');
          setServerStatus('connected');
          setError(''); // Limpiar errores previos
        } else {
          console.warn('⚠️ Servidor no disponible:', healthCheck.message);
          setServerStatus('disconnected');
          setError(healthCheck.error || 'Servidor no disponible');
        }
      } catch (err) {
        console.error('❌ Error verificando servidor:', err);
        setServerStatus('disconnected');
        setError('Error verificando conexión con el servidor');
      }
    };

    checkServerConnection();
    
    // Verificar cada 15 segundos en lugar de 30
    const interval = setInterval(checkServerConnection, 15000);
    return () => clearInterval(interval);
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

      // Validaciones del lado del cliente
      if (!credentials.username || !credentials.password) {
        setError('Por favor, complete todos los campos');
        setIsLoading(false);
        onLogin(false);
        return;
      }

      if (credentials.username.length < 3) {
        setError('El usuario debe tener al menos 3 caracteres');
        setIsLoading(false);
        onLogin(false);
        return;
      }

      if (credentials.password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres');
        setIsLoading(false);
        onLogin(false);
        return;
      }

      if (serverStatus === 'disconnected') {
        setError('No hay conexión con el servidor. Verifique el estado de la red.');
        setIsLoading(false);
        onLogin(false);
        return;
      }

      console.log('🔐 Iniciando proceso de login...');
      console.log('📧 Usuario:', credentials.username);

      const response = await apiService.login(credentials);
      console.log('📝 Respuesta del login:', response);
      
      if (response.success) {
        console.log('✅ Login exitoso');

        
        onLogin(true, response.token);
      } else {
        console.log('❌ Login fallido:', response.message);
        setError(response.message || 'Error en el proceso de autenticación');
        onLogin(false);
      }
    } catch (err) {
      console.error('💥 Error durante login:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('fetch') || err.message.includes('network')) {
          setError('Error de conexión. Verifique que el servidor esté disponible.');
          setServerStatus('disconnected');
        } else if (err.message.includes('timeout') || err.message.includes('AbortError')) {
          setError('La conexión tardó demasiado tiempo. Intente nuevamente.');
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError('Error desconocido durante el login');
      }
      
      onLogin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      case 'checking': default: return 'text-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'connected': return 'Servidor conectado';
      case 'disconnected': return 'Servidor desconectado';
      case 'checking': default: return 'Verificando conexión...';
    }
  };

  const getStatusIcon = () => {
    switch (serverStatus) {
      case 'connected': return <Wifi size={16} className="text-green-500" />;
      case 'disconnected': return <WifiOff size={16} className="text-red-500" />;
      case 'checking': default: 
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>;
    }
  };

  const handleRetryConnection = async () => {
    setServerStatus('checking');
    setError('');
    
    try {
      const healthCheck = await apiService.healthCheck();
      
      if (healthCheck.success) {
        setServerStatus('connected');
        setError('');
      } else {
        setServerStatus('disconnected');
        setError(healthCheck.error || 'No se pudo conectar con el servidor');
      }
    } catch (retryError) {
      console.error('Error al reintentar conexión:', retryError);
      setServerStatus('disconnected');
      setError('Error al reintentar la conexión');
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
          
          {/* Indicador de estado del servidor */}
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1">
            {getStatusIcon()}
            <span className={`text-xs font-medium ${getStatusColor()}`}>
              {serverStatus === 'checking' ? '...' : serverStatus === 'connected' ? '●' : '●'}
            </span>
          </div>
          
          {/* Elementos decorativos internos */}
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

          {/* Estado de conexión detallado */}
          <div className="mb-4 p-3 bg-white/50 rounded-lg border border-white/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
              {serverStatus === 'disconnected' && (
                <button
                  onClick={handleRetryConnection}
                  className="text-xs text-slate-600 hover:text-slate-800 underline transition-colors"
                  disabled={isLoading}
                >
                  Reintentar
                </button>
              )}
            </div>
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
              <div className="flex items-start space-x-2">
                <div className="text-red-500 mt-0.5">⚠️</div>
                <div className="flex-1">{error}</div>
              </div>
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
                  minLength={3}
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
                  minLength={4}
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
              disabled={isLoading || serverStatus === 'disconnected'}
              className="w-full bg-gradient-to-r from-slate-600 via-gray-700 to-slate-800 text-white py-3 rounded-xl font-semibold hover:from-slate-700 hover:via-gray-800 hover:to-slate-900 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Ingresando...</span>
                </>
              ) : serverStatus === 'disconnected' ? (
                <>
                  <WifiOff size={20} />
                  <span>Sin conexión</span>
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
              Versión 1.0.2
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