// components/login/ApiService.ts
import { 
  LoginRequest, 
  LoginResponse, 
  ApiResponse, 
  User, 
  ProyectoBase, 
  ProyectoAPI, 
  PaginatedResponse 
} from './interfaces';

export class ApiService {
  private readonly API_BASE_URL = 'http://34.10.172.54:8080';
  private authToken: string | null = null;

  // *** MÉTODOS DE GESTIÓN DE TOKEN MEJORADOS ***
  
  private getAuthToken(): string | null {
    // Prioridad: memoria > sessionStorage > localStorage
    if (this.authToken) {
      return this.authToken;
    }
    
    // Intentar recuperar de sessionStorage
    try {
      const sessionToken = sessionStorage.getItem('auth_token');
      if (sessionToken) {
        this.authToken = sessionToken;
        console.log('🔄 Token recuperado desde sessionStorage');
        return sessionToken;
      }
    } catch (error) {
      console.warn('⚠️ Error accediendo sessionStorage:', error);
    }
    
    // Intentar recuperar de localStorage como respaldo
    try {
      const localToken = localStorage.getItem('auth_token');
      if (localToken) {
        this.authToken = localToken;
        console.log('🔄 Token recuperado desde localStorage');
        return localToken;
      }
    } catch (error) {
      console.warn('⚠️ Error accediendo localStorage:', error);
    }
    
    return null;
  }

  private setAuthToken(token: string): void {
    this.authToken = token;
    console.log('🔐 Token guardado exitosamente en memoria');
    console.log('🔑 Token preview:', token.substring(0, 50) + '...');
    
    // Guardar en sessionStorage (prioridad alta)
    try {
      sessionStorage.setItem('auth_token', token);
      console.log('💾 Token guardado en sessionStorage');
    } catch (error) {
      console.warn('⚠️ Error guardando en sessionStorage:', error);
    }
    
    // Guardar en localStorage como respaldo
    try {
      localStorage.setItem('auth_token', token);
      console.log('💾 Token guardado en localStorage');
    } catch (error) {
      console.warn('⚠️ Error guardando en localStorage:', error);
    }
  }

  private clearAuthToken(): void {
    this.authToken = null;
    console.log('🗑️ Token eliminado de memoria');
    
    // Limpiar de sessionStorage
    try {
      sessionStorage.removeItem('auth_token');
      console.log('🗑️ Token eliminado de sessionStorage');
    } catch (error) {
      console.warn('⚠️ Error limpiando sessionStorage:', error);
    }
    
    // Limpiar de localStorage
    try {
      localStorage.removeItem('auth_token');
      console.log('🗑️ Token eliminado de localStorage');
    } catch (error) {
      console.warn('⚠️ Error limpiando localStorage:', error);
    }
  }

  // *** MÉTODOS PÚBLICOS PARA GESTIÓN DE TOKEN ***
  
  public isAuthenticated(): boolean {
    const token = this.getAuthToken();
    if (!token) {
      console.log('🔍 No hay token disponible');
      return false;
    }
    
    if (this.isTokenExpired()) {
      console.log('🔍 Token expirado');
      this.clearAuthToken();
      return false;
    }
    
    console.log('🔍 Token válido y no expirado');
    return true;
  }

  public hasValidToken(): boolean {
    return this.isAuthenticated();
  }

  public getCurrentToken(): string | null {
    return this.getAuthToken();
  }

  public setToken(token: string): void {
    this.setAuthToken(token);
  }

  public clearToken(): void {
    this.clearAuthToken();
  }

  // *** VERIFICACIÓN DE EXPIRACIÓN DE TOKEN ***
  public isTokenExpired(): boolean {
    const token = this.getAuthToken();
    if (!token) return true;
    
    try {
      // Decodificar el payload del JWT (sin validar la firma)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;
      
      if (isExpired) {
        console.log('⚠️ Token expirado');
      }
      
      return isExpired;
    } catch (error) {
      console.error('Error al verificar expiración del token:', error);
      return true;
    }
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
      console.log('🔑 Header Authorization agregado con token');
    } else {
      console.warn('⚠️ No hay token disponible para agregar a headers');
    }

    return headers;
  }

  public async healthCheck(): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      console.log('🏥 Verificando salud del servidor...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

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

      // *** ENDPOINT ESPECÍFICO BASADO EN LA DOCUMENTACIÓN SWAGGER ***
      const endpoint = '/auth/login';
      
      try {
        console.log(`🎯 Usando endpoint: ${this.API_BASE_URL}${endpoint}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const requestBody = JSON.stringify({
          username: credentials.username.trim(),
          password: credentials.password.trim()
        });
        
        console.log('📦 Request body:', requestBody);
        
        const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          body: requestBody,
          signal: controller.signal,
          mode: 'cors', 
        });

        clearTimeout(timeoutId);
        console.log(`📡 ${endpoint} respondió con status: ${response.status}`);
        console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()));

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
          
          // *** BÚSQUEDA MEJORADA Y ESPECÍFICA DEL TOKEN JWT ***
          let token: string | undefined;
          
          // 🎯 PRIORIDAD 1: Buscar específicamente 'jwt' (según swagger)
          if (data.jwt && typeof data.jwt === 'string') {
            token = data.jwt as string;
            console.log('🔍 ¡TOKEN JWT ENCONTRADO en campo "jwt"!');
          }
          
          // 🎯 PRIORIDAD 2: Buscar en campos comunes de respuesta
          if (!token) {
            const tokenFields = [
              'token', 'accessToken', 'access_token', 'authToken', 
              'bearerToken', 'sessionToken', 'apiToken', 'authenticationToken'
            ];
            
            for (const field of tokenFields) {
              if (data[field] && typeof data[field] === 'string') {
                token = data[field] as string;
                console.log(`🔍 Token encontrado en campo '${field}'`);
                break;
              }
            }
          }
          
          // 🎯 PRIORIDAD 3: Buscar en headers
          if (!token) {
            const headerFields = [
              'Authorization', 'X-Auth-Token', 'Access-Token', 
              'X-Access-Token', 'Bearer', 'X-JWT-Token'
            ];
            
            for (const headerField of headerFields) {
              const headerValue = response.headers.get(headerField);
              if (headerValue) {
                token = headerValue.replace(/^Bearer\s+/i, '');
                console.log(`🔍 Token encontrado en header '${headerField}'`);
                break;
              }
            }
          }
          
          // 🎯 PRIORIDAD 4: Búsqueda recursiva en objetos anidados
          if (!token && typeof data === 'object') {
            const findTokenRecursive = (obj: Record<string, unknown>, depth = 0): string | undefined => {
              if (depth > 3) return undefined; // Limitar profundidad
              
              for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string' && (
                  key.toLowerCase().includes('token') || 
                  key.toLowerCase().includes('jwt') ||
                  key.toLowerCase() === 'jwt'
                )) {
                  return value;
                }
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                  const nestedToken = findTokenRecursive(value as Record<string, unknown>, depth + 1);
                  if (nestedToken) return nestedToken;
                }
              }
              return undefined;
            };
            
            token = findTokenRecursive(data);
            if (token) {
              console.log('🔍 Token encontrado en búsqueda recursiva');
            }
          }
          
          // *** GUARDAR EL TOKEN AUTOMÁTICAMENTE SI SE ENCUENTRA ***
          if (token && token.length > 10) { // Validación básica de longitud
            this.setAuthToken(token);
            console.log('🎉 ¡TOKEN CAPTURADO Y GUARDADO AUTOMÁTICAMENTE!');
            console.log('🔑 Token completo:', token);
            
            // *** VALIDACIÓN ADICIONAL: Verificar que es un JWT válido ***
            try {
              const parts = token.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                console.log('✅ Token JWT válido detectado');
                console.log('📋 Payload del token:', payload);
              } else {
                console.warn('⚠️ Token no parece ser un JWT válido (no tiene 3 partes)');
              }
            } catch (jwtError) {
              console.warn('⚠️ Error validando estructura JWT:', jwtError);
              // Aún así mantener el token por si es válido en el servidor
            }
            
          } else {
            console.warn('⚠️ NO SE ENCONTRÓ TOKEN VÁLIDO EN LA RESPUESTA');
            console.log('🔍 Respuesta completa para debug:', data);
            console.log('🔍 Headers completos:', Object.fromEntries(response.headers.entries()));
            
            // *** RESPUESTA EXITOSA PERO SIN TOKEN - CONTINUAR ***
            console.log('⚠️ Login exitoso pero sin token, continuando...');
          }
          
          // Extraer información del usuario
          const userData = (data.user || data.userData || data) as Record<string, unknown>;
          const user: User = {
            id: (userData.id || userData.userId || Date.now().toString()) as string,
            username: (userData.username as string) || credentials.username,
            email: (userData.email as string) || `${credentials.username}@ibarra.gob.ec`,
            role: (userData.role as string) || 'user'
          };
          
          return {
            success: true,
            token: this.getAuthToken() || undefined,
            user: user,
            message: (data.message as string) || 'Autenticación exitosa',
          };
        } else {
          const errorMessage = (data.message || data.error || `Error HTTP ${response.status}`) as string;
          console.log(`❌ Login falló: ${errorMessage}`);
          
          // Si es error de credenciales, devolver error específico
          if (response.status === 401 || response.status === 403) {
            return {
              success: false,
              message: 'Credenciales incorrectas. Verifique su usuario y contraseña.',
            };
          }
          
          return {
            success: false,
            message: errorMessage,
          };
        }
        
      } catch (endpointError) {
        console.error(`💥 Error con endpoint ${endpoint}:`, endpointError);
        
        if (endpointError instanceof DOMException && endpointError.name === 'AbortError') {
          return {
            success: false,
            message: 'Timeout de conexión. Intente nuevamente.',
          };
        } else if (endpointError instanceof TypeError) {
          return {
            success: false,
            message: 'Error de red o CORS. Verifique la conexión.',
          };
        } else {
          return {
            success: false,
            message: endpointError instanceof Error ? endpointError.message : 'Error desconocido',
          };
        }
      }
      
    } catch (loginError) {
      console.error('💥 Error general de login:', loginError);
      return {
        success: false,
        message: loginError instanceof Error ? loginError.message : 'Error de conexión con el servidor',
      };
    }
  }

  // *** MÉTODO GENÉRICO PARA PETICIONES CON TOKEN ***
  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.API_BASE_URL}${endpoint}`;
      
      console.log(`🌐 Petición a: ${url}`);
      console.log(`⚙️ Método: ${options.method || 'GET'}`);
      console.log(`🔑 Token presente: ${this.isAuthenticated()}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
        mode: 'cors',
        credentials: 'include',
      };

      let response: Response;
      
      try {
        response = await fetch(url, config);
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
      console.log(`📡 Status: ${response.status} ${response.statusText}`);
      
      const contentType = response.headers.get('content-type') || '';
      let data: Record<string, unknown> | null = null;
      
      try {
        const responseText = await response.text();
        
        if (responseText.trim()) {
          if (contentType.includes('application/json') || 
              responseText.trim().startsWith('{') || 
              responseText.trim().startsWith('[')) {
            try {
              data = JSON.parse(responseText);
              console.log('📊 JSON parseado exitosamente');
            } catch (parseError) {
              console.error('❌ Error parseando JSON:', parseError);
              data = { 
                message: 'Error al parsear respuesta JSON',
                rawResponse: responseText.substring(0, 200)
              };
            }
          } else {
            console.log('📝 Respuesta no es JSON');
            data = { 
              message: responseText,
              type: 'text'
            };
          }
        } else {
          console.log('📭 Respuesta vacía');
          data = { message: 'Respuesta vacía del servidor' };
        }
      } catch (readError) {
        console.error('❌ Error leyendo respuesta:', readError);
        data = { message: 'Error al leer la respuesta del servidor' };
      }

      // Manejo de respuestas exitosas
      if (response.ok) {
        console.log('✅ Petición exitosa');
        return {
          success: true,
          data: data as T,
          message: data?.message as string || 'Operación exitosa',
          status: response.status,
        };
      }

      // Manejo de errores HTTP
      const errorMessage = (data?.message || 
                          data?.error || 
                          data?.detail ||
                          `HTTP ${response.status}: ${response.statusText}`) as string;
      
      console.error(`❌ Error HTTP: ${errorMessage}`);
      
      // Manejo específico de códigos de error
      if (response.status === 401) {
        console.warn('🚫 Token expirado o inválido, limpiando...');
        this.clearAuthToken();
        return {
          success: false,
          error: 'Sesión expirada. Inicie sesión nuevamente.',
          message: 'No autorizado',
          status: response.status,
        };
      }
      
      if (response.status === 403) {
        return {
          success: false,
          error: 'No tiene permisos para realizar esta operación.',
          message: 'Acceso denegado',
          status: response.status,
        };
      }
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
        status: response.status,
      };
      
    } catch (error) {
      console.error('💥 Error en petición:', error);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          success: false,
          error: 'La petición tardó demasiado tiempo. Verifique su conexión.',
          message: 'Timeout de conexión',
        };
      }
      
      if (error instanceof TypeError) {
        return {
          success: false,
          error: 'Error de red. Verifique su conexión a internet.',
          message: 'Error de conexión',
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'Error en la operación',
      };
    }
  }

  // *** MÉTODOS ESPECÍFICOS PARA PROYECTOS ***
  public async getProyectos(page: number = 0, size: number = 10, status?: string, search?: string): Promise<ApiResponse<PaginatedResponse<ProyectoAPI>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(status && status !== 'all' && { estado: status }),
      ...(search && { search })
    });

    return this.request<PaginatedResponse<ProyectoAPI>>(`/api/proyectos?${params}`, {
      method: 'GET'
    });
  }

  public async getProyectosPendientes(page: number = 0, size: number = 10): Promise<ApiResponse<PaginatedResponse<ProyectoAPI>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    return this.request<PaginatedResponse<ProyectoAPI>>(`/admin/pending?${params}`, {
      method: 'GET'
    });
  }

  public async aprobarProyecto(projectId: string): Promise<ApiResponse<ProyectoAPI>> {
    return this.request<ProyectoAPI>(`/admin/approve/${projectId}`, {
      method: 'POST'
    });
  }

  public async rechazarProyecto(projectId: string): Promise<ApiResponse<ProyectoAPI>> {
    return this.request<ProyectoAPI>(`/admin/reject/${projectId}`, {
      method: 'POST'
    });
  }

  public async createProyecto(projectData: ProyectoBase): Promise<ApiResponse<ProyectoAPI>> {
    return this.request<ProyectoAPI>('/api/proyectos', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  }

  public async getProyecto(projectId: string): Promise<ApiResponse<ProyectoAPI>> {
    return this.request<ProyectoAPI>(`/api/proyectos/${projectId}`, {
      method: 'GET'
    });
  }

  public async updateProyecto(projectId: string, projectData: Partial<ProyectoBase>): Promise<ApiResponse<ProyectoAPI>> {
    return this.request<ProyectoAPI>(`/api/proyectos/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
  }

  public async deleteProyecto(projectId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/api/proyectos/${projectId}`, {
      method: 'DELETE'
    });
  }

  public async logout(): Promise<void> {
    this.clearAuthToken();
    console.log('👋 Sesión cerrada, token eliminado');
  }
}