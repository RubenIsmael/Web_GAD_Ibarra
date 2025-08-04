// components/login/ApiService.ts
import { LoginRequest, LoginResponse, ApiResponse, User } from './interfaces';

// *** INTERFACES ADICIONALES PARA PROYECTOS ***
interface ProyectoBase {
  nombre: string;
  descripcion: string;
  responsable: string;
  presupuesto?: number;
  categoria?: string;
}

interface Proyecto extends ProyectoBase {
  id: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'en-progreso' | 'completado';
  fechaEnvio: string;
  fechaInicio?: string;
  fechaFin?: string;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  empty: boolean;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
}

export class ApiService {
  private readonly API_BASE_URL = 'http://34.10.172.54:8080';
  private authToken: string | null = null;

  // *** MÉTODOS DE GESTIÓN DE TOKEN ***
  
  // Función para obtener token desde memoria
  private getAuthToken(): string | null {
    return this.authToken;
  }

  // Función para guardar el token en memoria
  private setAuthToken(token: string): void {
    this.authToken = token;
    console.log('🔐 Token guardado exitosamente en memoria');
    console.log('🔑 Token preview:', token.substring(0, 50) + '...');
  }

  // Función para limpiar el token
  private clearAuthToken(): void {
    this.authToken = null;
    console.log('🗑️ Token eliminado de memoria');
  }

  // *** MÉTODOS PÚBLICOS PARA GESTIÓN DE TOKEN (AGREGADOS) ***
  
  // Verificar si hay token válido y no expirado
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

  // Verificar si hay token válido (método original mantenido para compatibilidad)
  public hasValidToken(): boolean {
    return this.isAuthenticated();
  }

  // Obtener el token actual (para debugging)
  public getCurrentToken(): string | null {
    return this.getAuthToken();
  }

  // Establecer token manualmente (si es necesario)
  public setToken(token: string): void {
    this.setAuthToken(token);
  }

  // Limpiar token manualmente
  public clearToken(): void {
    this.clearAuthToken();
  }

  // *** MÉTODO PARA VERIFICAR SI EL TOKEN ESTÁ EXPIRADO ***
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
            
            // *** CAPTURA EXHAUSTIVA DEL TOKEN ***
            const token = (data.token || 
                         data.accessToken || 
                         data.access_token || 
                         data.authToken ||
                         data.jwt ||
                         data.bearerToken ||
                         data.sessionToken ||
                         response.headers.get('Authorization') ||
                         response.headers.get('X-Auth-Token') ||
                         response.headers.get('Access-Token')) as string | undefined;
            
            console.log('🔍 Buscando token en respuesta...');
            console.log('📋 Campos disponibles:', Object.keys(data));
            
            // *** GUARDAR EL TOKEN AUTOMÁTICAMENTE ***
            if (token) {
              this.setAuthToken(token);
              console.log('🎉 ¡TOKEN CAPTURADO Y GUARDADO AUTOMÁTICAMENTE!');
              console.log('🔑 Token completo:', token);
            } else {
              console.warn('⚠️ NO SE ENCONTRÓ TOKEN EN LA RESPUESTA');
              console.log('🔍 Respuesta completa para debug:', data);
              console.log('🔍 Headers completos:', Object.fromEntries(response.headers.entries()));
              
              // Intentar extraer token de cualquier campo que contenga "token"
              for (const [key, value] of Object.entries(data)) {
                if (typeof value === 'string' && key.toLowerCase().includes('token')) {
                  console.log(`🔍 Posible token encontrado en campo '${key}':`, value.substring(0, 50) + '...');
                  this.setAuthToken(value);
                  break;
                }
              }
            }
            
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
              token: this.getAuthToken() || undefined,
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

  // *** MÉTODOS ESPECÍFICOS PARA PROYECTOS (AGREGADOS) ***

  // Obtener proyectos con paginación y filtros
  public async getProyectos(page: number = 0, size: number = 10, status?: string, search?: string): Promise<ApiResponse<PaginatedResponse<Proyecto>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(status && status !== 'all' && { estado: status }),
      ...(search && { search })
    });

    return this.request<PaginatedResponse<Proyecto>>(`/api/proyectos?${params}`, {
      method: 'GET'
    });
  }

  // Obtener proyectos pendientes
  public async getProyectosPendientes(page: number = 0, size: number = 10): Promise<ApiResponse<PaginatedResponse<Proyecto>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    return this.request<PaginatedResponse<Proyecto>>(`/api/proyectos/pendientes?${params}`, {
      method: 'GET'
    });
  }

  // Aprobar proyecto
  public async aprobarProyecto(projectId: string): Promise<ApiResponse<Proyecto>> {
    return this.request<Proyecto>(`/api/proyectos/${projectId}/aprobar`, {
      method: 'PUT'
    });
  }

  // Rechazar proyecto
  public async rechazarProyecto(projectId: string): Promise<ApiResponse<Proyecto>> {
    return this.request<Proyecto>(`/api/proyectos/${projectId}/rechazar`, {
      method: 'PUT'
    });
  }

  // Crear nuevo proyecto
  public async createProyecto(projectData: ProyectoBase): Promise<ApiResponse<Proyecto>> {
    return this.request<Proyecto>('/api/proyectos', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  }

  // Obtener proyecto por ID
  public async getProyecto(projectId: string): Promise<ApiResponse<Proyecto>> {
    return this.request<Proyecto>(`/api/proyectos/${projectId}`, {
      method: 'GET'
    });
  }

  // Actualizar proyecto
  public async updateProyecto(projectId: string, projectData: Partial<ProyectoBase>): Promise<ApiResponse<Proyecto>> {
    return this.request<Proyecto>(`/api/proyectos/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
  }

  // Eliminar proyecto
  public async deleteProyecto(projectId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/api/proyectos/${projectId}`, {
      method: 'DELETE'
    });
  }

  // Método para logout que limpia el token
  public async logout(): Promise<void> {
    this.clearAuthToken();
    console.log('👋 Sesión cerrada, token eliminado');
  }
}