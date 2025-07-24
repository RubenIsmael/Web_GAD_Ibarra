const API_BASE_URL = 'http://34.10.172.54:8080';

// Tipos de datos específicos
export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// Interfaces específicas para cada entidad
export interface Requerimiento {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
  usuario?: string;
  prioridad?: 'alta' | 'media' | 'baja';
  categoria?: string;
}

export interface CreateRequerimientoRequest {
  titulo: string;
  descripcion: string;
  prioridad?: 'alta' | 'media' | 'baja';
  categoria?: string;
}

export interface UpdateRequerimientoRequest extends Partial<CreateRequerimientoRequest> {
  estado?: string;
}

export interface Mensaje {
  id: string;
  contenido: string;
  remitente: string;
  destinatario: string;
  fechaEnvio: string;
  leido: boolean;
  asunto?: string;
}

export interface SendMensajeRequest {
  contenido: string;
  destinatario: string;
  asunto?: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  estado: string;
  fechaInicio: string;
  fechaFin?: string;
  responsable?: string;
  presupuesto?: number;
}

export interface CreateProyectoRequest {
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin?: string;
  responsable?: string;
  presupuesto?: number;
}

export interface Feria {
  id: string;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  estado: string;
  organizador?: string;
}

export interface CreateFeriaRequest {
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  organizador?: string;
}

export interface LocalComercial {
  id: string;
  nombre: string;
  direccion: string;
  propietario: string;
  telefono?: string;
  email?: string;
  tipoNegocio: string;
  estado: string;
  fechaRegistro: string;
  licencia?: string;
}

export interface CreateLocalComercialRequest {
  nombre: string;
  direccion: string;
  propietario: string;
  telefono?: string;
  email?: string;
  tipoNegocio: string;
  licencia?: string;
}

export interface DashboardData {
  totalRequerimientos: number;
  totalProyectos: number;
  totalFerias: number;
  totalLocalesComerciales: number;
  requerimientosRecientes: Requerimiento[];
  mensajesNoLeidos: number;
  estadisticas: {
    requerimientosPorEstado: Record<string, number>;
    proyectosPorEstado: Record<string, number>;
    feriasPorMes: Record<string, number>;
  };
  actividadReciente: Array<{
    tipo: string;
    descripcion: string;
    fecha: string;
  }>;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  version?: string;
  uptime?: number;
  database?: string;
}

// Interfaz para respuestas de servidor genéricas
interface ServerResponse {
  message?: string;
  error?: string;
  detail?: string;
  type?: string;
  rawResponse?: string;
  [key: string]: unknown;
}

// Clase mejorada para manejar las peticiones a la API
class ApiService {
  private baseUrl: string;
  private isServerAvailable: boolean = false;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadAuthToken();
  }

  // Método para cargar el token de autenticación 
  private loadAuthToken(): void {
    this.authToken = null;
  }

  // Método para guardar el token de autenticación
  private saveAuthToken(token: string): void {
    this.authToken = token;
  }

  // Método para limpiar el token de autenticación
  private clearAuthToken(): void {
    this.authToken = null;
  }

  // Método para obtener el token de autenticación
  private getAuthToken(): string | null {
    return this.authToken;
  }

  // Método para crear headers mejorados
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'User-Agent': 'Ibarra-Municipal-App/1.0.2',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Método mejorado para verificar la conexión base
  private async checkBaseConnection(): Promise<boolean> {
    try {
      console.log('🔍 Verificando conexión base del servidor...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Intentar múltiples métodos para verificar la conexión
      const methods = ['HEAD', 'GET', 'OPTIONS'];
      
      for (const method of methods) {
        try {
          const response = await fetch(this.baseUrl, {
            method: method,
            signal: controller.signal,
            headers: {
              'Accept': '*/*',
              'Cache-Control': 'no-cache',
            },
          });
          
          clearTimeout(timeoutId);
          console.log(`✅ Servidor respondió con ${method}: ${response.status}`);
          
          this.isServerAvailable = true;
          return true;
        } catch (methodError) {
          console.log(`❌ Método ${method} falló:`, methodError);
          continue;
        }
      }
      
      clearTimeout(timeoutId);
      this.isServerAvailable = false;
      return false;
      
    } catch {
      console.error('❌ Error conectando al servidor base');
      this.isServerAvailable = false;
      return false;
    }
  }

  // Método genérico mejorado para hacer peticiones
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      // Configuración mejorada de la petición
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

      console.log(`🌐 Petición a: ${url}`);
      console.log(`⚙️ Método: ${config.method || 'GET'}`);
      console.log(`📋 Headers:`, config.headers);

      let response: Response;
      
      try {
        response = await fetch(url, config);
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
      console.log(`📡 Status: ${response.status} ${response.statusText}`);
      console.log(`✅ OK: ${response.ok}`);
      
      // Información adicional de la respuesta
      const contentType = response.headers.get('content-type') || '';
      const contentLength = response.headers.get('content-length') || '0';
      console.log(`📝 Content-Type: ${contentType}`);
      console.log(`📏 Content-Length: ${contentLength}`);
      
      // Manejo mejorado de diferentes tipos de respuesta
      let data: ServerResponse | null = null;
      
      try {
        const responseText = await response.text();
        console.log(`📄 Response length: ${responseText.length} chars`);
        
        if (responseText.trim()) {
          if (contentType.includes('application/json') || 
              responseText.trim().startsWith('{') || 
              responseText.trim().startsWith('[')) {
            try {
              data = JSON.parse(responseText) as ServerResponse;
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
          message: data?.message || 'Operación exitosa',
          status: response.status,
        };
      }

      // Manejo de errores HTTP
      const errorMessage = data?.message || 
                          data?.error || 
                          data?.detail ||
                          `HTTP ${response.status}: ${response.statusText}`;
      
      console.error(`❌ Error HTTP: ${errorMessage}`);
      
      // Manejo específico de códigos de error
      if (response.status === 401) {
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
      
      if (response.status === 404) {
        return {
          success: false,
          error: 'Recurso no encontrado.',
          message: 'No encontrado',
          status: response.status,
        };
      }
      
      if (response.status >= 500) {
        return {
          success: false,
          error: 'Error interno del servidor. Intente más tarde.',
          message: 'Error del servidor',
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
      
      // Manejo específico de diferentes tipos de errores
      if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          success: false,
          error: 'La petición tardó demasiado tiempo. Verifique su conexión.',
          message: 'Timeout de conexión',
        };
      }
      
      if (error instanceof TypeError) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          return {
            success: false,
            error: 'Error de red. Verifique su conexión a internet.',
            message: 'Error de conexión',
          };
        }
        
        if (error.message.includes('cors')) {
          return {
            success: false,
            error: 'Error de CORS. El servidor no permite esta petición.',
            message: 'Error de política de origen cruzado',
          };
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'Error en la operación',
      };
    }
  }

  // Método de autenticación completamente reescrito
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('🔐 Iniciando proceso de login...');
      console.log('👤 Usuario:', credentials.username);
      
      // Validaciones básicas
      if (!credentials.username?.trim()) {
        return {
          success: false,
          message: 'El nombre de usuario es requerido'
        };
      }
      
      if (!credentials.password?.trim()) {
        return {
          success: false,
          message: 'La contraseña es requerida'
        };
      }
      
      if (credentials.username.trim().length < 3) {
        return {
          success: false,
          message: 'El usuario debe tener al menos 3 caracteres'
        };
      }
      
      if (credentials.password.trim().length < 4) {
        return {
          success: false,
          message: 'La contraseña debe tener al menos 4 caracteres'
        };
      }
      
      // Verificar conexión base
      console.log('🔍 Verificando conexión con el servidor...');
      const serverAvailable = await this.checkBaseConnection();
      if (!serverAvailable) {
        return {
          success: false,
          message: 'No se puede conectar con el servidor. Verifique la conexión.',
        };
      }
      
      // Endpoints de login posibles
      const loginEndpoints = [
        '/api/auth/login',
        '/auth/login', 
        '/login',
        '/api/login',
        '/api/v1/auth/login',
        '/v1/auth/login',
        '/api/authenticate',
        '/authenticate'
      ];
      
      const loginData = {
        username: credentials.username.trim(),
        password: credentials.password.trim(),
        // Campos adicionales que algunos sistemas podrían esperar
        email: credentials.username.trim(),
        user: credentials.username.trim(),
        login: credentials.username.trim(),
      };
      
      console.log('🔍 Probando endpoints de login...');
      
      let lastError = '';
      let validEndpointFound = false;
      
      for (const endpoint of loginEndpoints) {
        try {
          console.log(`🎯 Intentando: ${this.baseUrl}${endpoint}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 segundos
          
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
            },
            body: JSON.stringify(loginData),
            signal: controller.signal,
            mode: 'cors',
            credentials: 'include',
          });

          clearTimeout(timeoutId);
          console.log(`📡 ${endpoint} -> Status: ${response.status}`);

          // Si es 404 o 405, el endpoint no existe
          if (response.status === 404 || response.status === 405) {
            console.log(`⏭️ Endpoint ${endpoint} no disponible`);
            continue;
          }
          
          validEndpointFound = true;

          // Leer respuesta
          let responseData: ServerResponse = {};
          const contentType = response.headers.get('content-type') || '';
          
          try {
            const responseText = await response.text();
            console.log(`📄 Response (${responseText.length} chars):`, responseText.substring(0, 300));
            
            if (responseText.trim()) {
              if (contentType.includes('application/json') || 
                  responseText.trim().startsWith('{') || 
                  responseText.trim().startsWith('[')) {
                responseData = JSON.parse(responseText) as ServerResponse;
              } else {
                responseData = { message: responseText };
              }
            }
          } catch {
            console.error('❌ Error parseando respuesta');
            responseData = { message: 'Error al procesar respuesta del servidor' };
          }

          console.log('📊 Datos de respuesta:', responseData);
          
          // Login exitoso
          if (response.ok && response.status >= 200 && response.status < 300) {
            console.log('✅ Login exitoso!');
            
            // Buscar token en múltiples ubicaciones posibles
            const token = (responseData as Record<string, unknown>).token as string || 
                         (responseData as Record<string, unknown>).accessToken as string || 
                         (responseData as Record<string, unknown>).access_token as string || 
                         (responseData as Record<string, unknown>).authToken as string ||
                         (responseData as Record<string, unknown>).jwt as string ||
                         (responseData as Record<string, unknown>).sessionToken as string ||
                         response.headers.get('Authorization')?.replace('Bearer ', '') ||
                         response.headers.get('X-Auth-Token');
            
            // Construir objeto de usuario
            const userObj = (responseData as Record<string, unknown>).user as Record<string, unknown> || {};
            const user: User = {
              id: ((responseData as Record<string, unknown>).id || 
                  (responseData as Record<string, unknown>).userId || 
                  userObj.id || 
                  Date.now().toString()) as string,
              username: ((responseData as Record<string, unknown>).username || 
                       userObj.username || 
                       credentials.username) as string,
              email: ((responseData as Record<string, unknown>).email || 
                     userObj.email || 
                     `${credentials.username}@ibarra.gob.ec`) as string,
              role: ((responseData as Record<string, unknown>).role || 
                    userObj.role || 
                    ((responseData as Record<string, unknown>).authorities as string[])?.[0] || 
                    'user') as string,
              firstName: ((responseData as Record<string, unknown>).firstName || 
                        userObj.firstName || 
                        (responseData as Record<string, unknown>).nombre) as string,
              lastName: ((responseData as Record<string, unknown>).lastName || 
                       userObj.lastName || 
                       (responseData as Record<string, unknown>).apellido) as string,
            };
            
            // Guardar token si existe
            if (token) {
              this.saveAuthToken(token);
            }
            
            return {
              success: true,
             token: token || undefined,
              user: user,
              message: responseData.message || 'Autenticación exitosa',
            };
          }
          
          // Manejar errores de autenticación
          const errorMessage = responseData.message || 
                              responseData.error || 
                              responseData.detail ||
                              `Error HTTP ${response.status}`;
          
          console.log(`❌ Login falló: ${errorMessage}`);
          lastError = errorMessage;
          
          // Si es error de credenciales, no seguir probando
          if (response.status === 401 || response.status === 403) {
            return {
              success: false,
              message: 'Credenciales incorrectas. Verifique su usuario y contraseña.',
            };
          }
          
          // Para errores 400, también podría ser credenciales incorrectas
          if (response.status === 400 && 
              (errorMessage.toLowerCase().includes('invalid') ||
               errorMessage.toLowerCase().includes('incorrect') ||
               errorMessage.toLowerCase().includes('wrong'))) {
            return {
              success: false,
              message: 'Credenciales incorrectas. Verifique su usuario y contraseña.',
            };
          }
          
          // Para otros errores del servidor, continuar con el siguiente endpoint
          if (response.status >= 500) {
            console.log(`🔄 Error del servidor ${response.status}, probando siguiente...`);
            continue;
          }
          
          // Para otros errores (400, etc.), devolver inmediatamente
          return {
            success: false,
            message: errorMessage,
          };
          
        } catch (endpointError) {
          console.error(`💥 Error con endpoint ${endpoint}:`, endpointError);
          
          if (endpointError instanceof DOMException && endpointError.name === 'AbortError') {
            lastError = 'Timeout de conexión';
            console.log(`⏰ Timeout para ${endpoint}`);
          } else if (endpointError instanceof TypeError) {
            lastError = 'Error de red o CORS';
            console.log(`🌐 Error de red para ${endpoint}`);
          } else {
            lastError = endpointError instanceof Error ? endpointError.message : 'Error desconocido';
          }
          
          continue;
        }
      }
      
      // Si no se encontró ningún endpoint válido
      if (!validEndpointFound) {
        return {
          success: false,
          message: 'No se encontró un endpoint de autenticación válido en el servidor',
        };
      }
      
      // Si se encontraron endpoints pero todos fallaron
      return {
        success: false,
        message: lastError || 'Error en el proceso de autenticación',
      };
      
    } catch {
      console.error('💥 Error general de login');
      return {
        success: false,
        message: 'Error de conexión con el servidor',
      };
    }
  }

  // Método de logout
  async logout(): Promise<ApiResponse<void>> {
    try {
      const result = await this.request<void>('/auth/logout', {
        method: 'POST',
      });
      
      // Limpiar token localmente independientemente del resultado
      this.clearAuthToken();
      
      return result;
    } catch {
      // Limpiar token incluso si hay error
      this.clearAuthToken();
      
      return {
        success: true, 
        message: 'Sesión cerrada localmente',
      };
    }
  }

  // Métodos HTTP básicos
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Health check mejorado
  async healthCheck(): Promise<ApiResponse<HealthCheckResponse>> {
    console.log('🏥 Iniciando health check...');
    
    // Verificar conexión base primero
    const baseConnection = await this.checkBaseConnection();
    if (!baseConnection) {
      return {
        success: false,
        error: 'No se puede conectar con el servidor',
        message: 'Servidor no disponible',
      };
    }
    
    // Endpoints de health check
    const healthEndpoints = [
      '/health',
      '/actuator/health', 
      '/api/health',
      '/status',
      '/ping',
      '/api/status',
      '/healthcheck',
      '/api/ping'
    ];
    
    for (const endpoint of healthEndpoints) {
      try {
        console.log(`🔍 Verificando: ${endpoint}`);
        const result = await this.get<HealthCheckResponse>(endpoint);
        
        if (result.success) {
          console.log(`✅ Health check exitoso en: ${endpoint}`);
          return {
            ...result,
            data: {
              status: result.data?.status || 'ok',
              timestamp: result.data?.timestamp || new Date().toISOString(),
              version: result.data?.version || '1.0.0',
              uptime: result.data?.uptime,
              database: result.data?.database,
            }
          };
        }
      } catch {
        console.log(`❌ Health check falló en: ${endpoint}`);
        continue;
      }
    }
    
    // Si no hay endpoints específicos de health, pero el servidor responde
    console.log('⚠️ No hay endpoints de health específicos, pero el servidor está disponible');
    return {
      success: true,
      data: {
        status: 'available',
        timestamp: new Date().toISOString(),
        version: 'unknown'
      },
      message: 'Servidor disponible (sin endpoint de salud específico)',
    };
  }

  // Métodos específicos de la aplicación

  // Requerimientos
  async getRequerimientos(): Promise<ApiResponse<Requerimiento[]>> {
    return this.get<Requerimiento[]>('/api/requerimientos');
  }

  async getRequerimiento(id: string): Promise<ApiResponse<Requerimiento>> {
    return this.get<Requerimiento>(`/api/requerimientos/${id}`);
  }

  async createRequerimiento(data: CreateRequerimientoRequest): Promise<ApiResponse<Requerimiento>> {
    return this.post<Requerimiento>('/api/requerimientos', data);
  }

  async updateRequerimiento(id: string, data: UpdateRequerimientoRequest): Promise<ApiResponse<Requerimiento>> {
    return this.put<Requerimiento>(`/api/requerimientos/${id}`, data);
  }

  async deleteRequerimiento(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/api/requerimientos/${id}`);
  }

  // Mensajería
  async getMensajes(): Promise<ApiResponse<Mensaje[]>> {
    return this.get<Mensaje[]>('/api/mensajes');
  }

  async getMensaje(id: string): Promise<ApiResponse<Mensaje>> {
    return this.get<Mensaje>(`/api/mensajes/${id}`);
  }

  async sendMensaje(data: SendMensajeRequest): Promise<ApiResponse<Mensaje>> {
    return this.post<Mensaje>('/api/mensajes', data);
  }

  async markMensajeAsRead(id: string): Promise<ApiResponse<void>> {
    return this.patch<void>(`/api/mensajes/${id}/read`, {});
  }

  // Proyectos
  async getProyectos(): Promise<ApiResponse<Proyecto[]>> {
    return this.get<Proyecto[]>('/api/proyectos');
  }

  async getProyecto(id: string): Promise<ApiResponse<Proyecto>> {
    return this.get<Proyecto>(`/api/proyectos/${id}`);
  }

  async createProyecto(data: CreateProyectoRequest): Promise<ApiResponse<Proyecto>> {
    return this.post<Proyecto>('/api/proyectos', data);
  }

  async updateProyecto(id: string, data: Partial<CreateProyectoRequest>): Promise<ApiResponse<Proyecto>> {
    return this.put<Proyecto>(`/api/proyectos/${id}`, data);
  }

  async deleteProyecto(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/api/proyectos/${id}`);
  }

  // Ferias
  async getFerias(): Promise<ApiResponse<Feria[]>> {
    return this.get<Feria[]>('/api/ferias');
  }

  async getFeria(id: string): Promise<ApiResponse<Feria>> {
    return this.get<Feria>(`/api/ferias/${id}`);
  }

  async createFeria(data: CreateFeriaRequest): Promise<ApiResponse<Feria>> {
    return this.post<Feria>('/api/ferias', data);
  }

  async updateFeria(id: string, data: Partial<CreateFeriaRequest>): Promise<ApiResponse<Feria>> {
    return this.put<Feria>(`/api/ferias/${id}`, data);
  }

  async deleteFeria(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/api/ferias/${id}`);
  }

  // Locales Comerciales
  async getLocalesComerciales(): Promise<ApiResponse<LocalComercial[]>> {
    return this.get<LocalComercial[]>('/api/locales-comerciales');
  }

  async getLocalComercial(id: string): Promise<ApiResponse<LocalComercial>> {
    return this.get<LocalComercial>(`/api/locales-comerciales/${id}`);
  }

  async createLocalComercial(data: CreateLocalComercialRequest): Promise<ApiResponse<LocalComercial>> {
    return this.post<LocalComercial>('/api/locales-comerciales', data);
  }

  async updateLocalComercial(id: string, data: Partial<CreateLocalComercialRequest>): Promise<ApiResponse<LocalComercial>> {
    return this.put<LocalComercial>(`/api/locales-comerciales/${id}`, data);
  }

  async deleteLocalComercial(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/api/locales-comerciales/${id}`);
  }

  // Dashboard
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return this.get<DashboardData>('/api/dashboard');
  }

  // Métodos de utilidad
  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  }

  getCurrentToken(): string | null {
    return this.getAuthToken();
  }

  setToken(token: string): void {
    this.saveAuthToken(token);
  }

  clearToken(): void {
    this.clearAuthToken();
  }
}

// Instancia del servicio API
export const apiService = new ApiService(API_BASE_URL);

// Hook personalizado para usar en componentes React
export const useApi = () => {
  return apiService;
};

// Función helper para manejar errores de API
export const handleApiError = (error: ApiResponse<unknown>): string => {
  return error.error || error.message || 'Error desconocido';
};

// Función helper para verificar si el usuario está autenticado
export const isUserAuthenticated = (): boolean => {
  return apiService.isAuthenticated();
};

export default apiService;