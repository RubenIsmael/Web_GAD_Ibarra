import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, Wifi, WifiOff } from 'lucide-react';
import { LoginPageProps, LoginRequest, ServerStatus } from './interfaces';
import { ApiService } from './ApiService'; 
import './login.scss';

// *** CREAR INSTANCIA DEL SERVICIO ***
const apiService = new ApiService();

export class LoginPageController {
  // *** USAR EL SERVICIO UNIFICADO EN LUGAR DE CREAR UNO NUEVO ***
  constructor() {

  }

  public async checkServerHealth() {
    return await apiService.healthCheck();
  }

  public async performLogin(credentials: LoginRequest) {
    // *** CAPTURA Y PERSISTE EL TOKEN AUTOMÁTICAMENTE ***
    console.log('🔐 Iniciando login con captura y persistencia automática de token...');
    const result = await apiService.login(credentials);
    
    if (result.success && result.token) {
      console.log('✅ Token capturado y persistido automáticamente durante el login');
      console.log('🔑 Token preview:', result.token.substring(0, 50) + '...');
      console.log('🗃️ Token guardado en memoria y sessionStorage para persistencia');
    }
    
    return result;
  }

  public validateCredentials(username: string, password: string): string | null {
    if (!username.trim() || !password.trim()) {
      return 'Por favor, complete todos los campos';
    }

    if (username.length < 3) {
      return 'El usuario debe tener al menos 3 caracteres';
    }

    if (password.length < 4) {
      return 'La contraseña debe tener al menos 4 caracteres';
    }

    return null;
  }
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // Estados del componente
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');

  // Instancia del controlador
  const [controller] = useState(() => new LoginPageController());

  // *** VERIFICAR SI YA HAY UNA SESIÓN VÁLIDA AL CARGAR ***
  useEffect(() => {
    console.log('🔍 Verificando sesión existente...');
    if (apiService.isAuthenticated()) {
      console.log('✅ Sesión válida encontrada, usuario ya autenticado');
      onLogin(true, apiService.getCurrentToken() || undefined);
      return;
    }
    console.log('❌ No hay sesión válida, mostrando login');
  }, [onLogin]);

  // Efecto para verificar conexión con el servidor
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        setServerStatus('checking');
        const healthCheck = await controller.checkServerHealth();
        
        if (healthCheck.success) {
          setServerStatus('connected');
          setError('');
        } else {
          setServerStatus('disconnected');
          // No mostrar errores de conexión automáticamente
        }
      } catch (err) {
        console.error('Error al verificar conexión del servidor:', err);
        setServerStatus('disconnected');
        // No mostrar errores de conexión automáticamente
      }
    };

    checkServerConnection();
    const interval = setInterval(checkServerConnection, 15000);
    return () => clearInterval(interval);
  }, [controller]);

  // Funciones de utilidad
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  };

  const getStatusColor = (): string => {
    switch (serverStatus) {
      case 'connected': return 'connected';
      case 'disconnected': return 'disconnected';
      case 'checking': default: return 'checking';
    }
  };

  const getStatusText = (): string => {
    switch (serverStatus) {
      case 'connected': return 'Servidor conectado';
      case 'disconnected': return 'Servidor desconectado';
      case 'checking': default: return 'Verificando conexión...';
    }
  };

  const getStatusIcon = () => {
    switch (serverStatus) {
      case 'connected': return <Wifi size={16} className="status-icon connected" />;
      case 'disconnected': return <WifiOff size={16} className="status-icon disconnected" />;
      case 'checking': default: 
        return <div className="status-icon spinning"></div>;
    }
  };

  const handleRetryConnection = async () => {
    setServerStatus('checking');
    setError('');
    
    try {
      const healthCheck = await controller.checkServerHealth();
      
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

  // *** FUNCIÓN PRINCIPAL DE LOGIN CON PERSISTENCIA AUTOMÁTICA ***
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const credentials: LoginRequest = {
        username: username.trim(),
        password: password.trim()
      };

      // Validaciones del lado del cliente usando el controlador
      const validationError = controller.validateCredentials(credentials.username, credentials.password);
      if (validationError) {
        setError(validationError);
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

      // *** EJECUTA EL LOGIN CON CAPTURA Y PERSISTENCIA AUTOMÁTICA DE TOKEN ***
      console.log('🚀 Ejecutando login con captura y persistencia automática de token...');
      const response = await controller.performLogin(credentials);
      
      if (response.success) {
        console.log('🎉 Login exitoso - Token capturado y persistido automáticamente');
        console.log('🔍 Estado del token después del login:', {
          tokenPresent: apiService.isAuthenticated(),
          tokenPreview: apiService.getCurrentToken()?.substring(0, 50) + '...',
          tokenPersisted: 'En memoria y sessionStorage'
        });
        
        // *** VERIFICAR QUE EL TOKEN SE PERSISTIÓ CORRECTAMENTE ***
        if (!apiService.isAuthenticated()) {
          console.error('❌ Error: Token no se persistió correctamente');
          setError('Error al persistir la sesión. Intente nuevamente.');
          onLogin(false);
          return;
        }
        
        console.log('✅ Token persistido correctamente, redirigiendo...');
        onLogin(true, response.token);
        
        // Limpiar formulario tras login exitoso
        setUsername('');
        setPassword('');
        
      } else {
        console.error('❌ Login falló:', response.message);
        setError(response.message || 'Credenciales incorrectas');
        onLogin(false);
      }
    } catch (err) {
      console.error('💥 Error durante el proceso de login:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('fetch') || err.message.includes('network')) {
          setError('Error de conexión. Verifique que el servidor esté disponible.');
          setServerStatus('disconnected');
        } else if (err.message.includes('timeout') || err.message.includes('AbortError')) {
          setError('La conexión tardó demasiado tiempo. Intente nuevamente.');
        } else {
          setError('Error de autenticación');
        }
      } else {
        setError('Error de autenticación');
      }
      
      onLogin(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Elementos decorativos de fondo */}
      <div className="bg-decorations">
        <div className="decoration decoration-1"></div>
        <div className="decoration decoration-2"></div>
        <div className="decoration decoration-3"></div>
        <div className="decoration decoration-4"></div>
        <div className="decoration decoration-5"></div>
        <div className="decoration decoration-6"></div>
      </div>
      
      <div className="login-card">
        {/* Indicador de estado del servidor */}
        <div className="server-status">
          {getStatusIcon()}
          <span className={`status-text ${getStatusColor()}`}>
            {serverStatus === 'checking' ? '...' : serverStatus === 'connected' ? '●' : '●'}
          </span>
        </div>
        
        {/* Logo y encabezado */}
        <div className="header-section">
          <div className="logo-container">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Escudo_de_Ibarra_%28Ecuador%29.png/250px-Escudo_de_Ibarra_%28Ecuador%29.png" 
              alt="Escudo GAD Ibarra" 
              className="logo-image"
              onError={handleImageError}
            />
          </div>
          <h1 className="main-title">Bienvenido</h1>
          <p className="subtitle">Municipalidad de Ibarra</p>
          <p className="description">
            Gestión de Locales Comerciales y Emprendimientos
          </p>
        </div>

        {/* Estado de conexión detallado */}
        <div className="connection-status">
          <div className="status-row">
            <div className="status-info">
              {getStatusIcon()}
              <span className={`status-label ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            {serverStatus === 'disconnected' && (
              <button
                onClick={handleRetryConnection}
                className="retry-button"
                disabled={isLoading}
              >
                Reintentar
              </button>
            )}
          </div>
        </div>

        {/* Mensaje de error (solo cuando es necesario) */}
        {error && (
          <div className="error-message">
            <div className="error-content">
              <div className="error-icon">⚠️</div>
              <div className="error-text">{error}</div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-fields">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Usuario
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="Ingrese su usuario"
                required
                disabled={isLoading}
                autoComplete="username"
                minLength={3}
              />
            </div>
            
            <div className="form-group password-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input password-input"
                placeholder="Ingrese su contraseña"
                required
                disabled={isLoading}
                autoComplete="current-password"
                minLength={4}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
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
            className="submit-button"
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
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

        <div className="footer-section">
          <p className="copyright">
            © 2025 GAD Municipal de Ibarra
          </p>
          <p className="version">
            Versión 1.0.3 - 🔐 Token persistente
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;