// components/login/ApiService.ts
import { LoginRequest, LoginResponse, ApiResponse, User } from './interfaces';

export class ApiService {
  private readonly API_BASE_URL = 'http://34.10.172.54:8080';

  // Función para obtener token 
  private getAuthToken(): string | null {
    return null;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  public async healthCheck(): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      console.log('🏥 Verificando salud del servidor...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Reducido a 3 segundos

      try {
        const response = await fetch(this.API_BASE_URL, {
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
  }

  public async login(credentials: LoginRequest): Promise<LoginResponse> {
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
          console.log(`🎯 Probando endpoint: ${this.API_BASE_URL}${endpoint}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
          
          const requestBody = JSON.stringify({
            username: credentials.username.trim(),
            password: credentials.password.trim()
          });
          
          console.log('📦 Request body:', requestBody);
          
          const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
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
  }
}