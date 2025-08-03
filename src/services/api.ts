const API_BASE_URL = 'http://34.10.172.54:8080';

// Tipos de datos específicos basados en la API real
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

export interface ApprovalResponse {
  success: boolean;
  message: string;
  data?: string;
  id?: string;
  status?: string;
  timestamp?: string;
  approvedBy?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// Interfaces específicas para proyectos basadas en Swagger
export interface ProyectoAPI {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'en-progreso' | 'completado';
  fechaEnvio: string;
  responsable: string;
  email?: string;
  identification?: string;
  presupuesto?: number;
  categoria?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  empty: boolean;
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  size: number;
  number: number;
}

export interface CreateProyectoRequest {
  nombre: string;
  descripcion: string;
  responsable?: string;
  presupuesto?: number;
  categoria?: string;
}

export interface UpdateProyectoRequest extends Partial<CreateProyectoRequest> {
  estado?: string;
}

// Interfaces para otras entidades
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

  // Método para cargar el token de autenticación desde memoria
  private loadAuthToken(): void {
    // Por defecto usar el token proporcionado o null para login dinámico
    this.authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJBVVRIMEpXVC1KVVNUSU5ERVYtQkFDS0VORCIsInN1YiI6ImFkbWluQG1haWwuY29tIiwicm9sZXMiOiJST0xFX0FETUlOIiwiaWF0IjoxNzU0MDg3OTYwLCJleHAiOjE3NTQwODk3NjAsImp0aSI6IjRiNTVhZDdjLTc3OTMtNDBmYi1hNWNmLTRlYjdjN2MyZDA4ZiIsIm5iZiI6MTc1NDA4Nzk2MH0.wHBondKwwKzvwvR9P1M8Kbiu3PXQbas0xS9QXa9J7pA';
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

  // Método para crear headers con autenticación Bearer
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

      let response: Response;
      
      try {
        response = await fetch(url, config);
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
      console.log(`📡 Status: ${response.status} ${response.statusText}`);
      
      // Información adicional de la respuesta
      const contentType = response.headers.get('content-type') || '';
      
      // Manejo mejorado de diferentes tipos de respuesta
      let data: ServerResponse | null = null;
      
      try {
        const responseText = await response.text();
        
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

  // Método de autenticación mejorado
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
      
      // Verificar conexión base
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
        '/v1/auth/login'
      ];
      
      const loginData = {
        username: credentials.username.trim(),
        password: credentials.password.trim(),
      };
      
      for (const endpoint of loginEndpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(loginData),
            mode: 'cors',
            credentials: 'include',
          });

          if (response.status === 404 || response.status === 405) {
            continue;
          }

          let responseData: ServerResponse = {};
          try {
            const responseText = await response.text();
            if (responseText.trim()) {
              responseData = JSON.parse(responseText) as ServerResponse;
            }
          } catch {
            responseData = { message: 'Error al procesar respuesta del servidor' };
          }
          
          // Login exitoso
          if (response.ok) {
            const token = (responseData as Record<string, unknown>).token as string || 
                         (responseData as Record<string, unknown>).accessToken as string;
            
            const userObj = (responseData as Record<string, unknown>).user as Record<string, unknown> || {};
            const user: User = {
              id: ((responseData as Record<string, unknown>).id || 
                  userObj.id || 
                  Date.now().toString()) as string,
              username: ((responseData as Record<string, unknown>).username || 
                       userObj.username || 
                       credentials.username) as string,
              email: ((responseData as Record<string, unknown>).email || 
                     userObj.email) as string,
              role: ((responseData as Record<string, unknown>).role || 
                    userObj.role || 
                    'user') as string,
            };
            
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
          if (response.status === 401 || response.status === 403) {
            return {
              success: false,
              message: 'Credenciales incorrectas. Verifique su usuario y contraseña.',
            };
          }
          
        } catch (endpointError) {
          console.error(`Error con endpoint ${endpoint}:`, endpointError);
          continue;
        }
      }
      
      return {
        success: false,
        message: 'Error en el proceso de autenticación',
      };
      
    } catch {
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
      
      this.clearAuthToken();
      return result;
    } catch {
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

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
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

  // Health check
  async healthCheck(): Promise<ApiResponse<HealthCheckResponse>> {
    const baseConnection = await this.checkBaseConnection();
    if (!baseConnection) {
      return {
        success: false,
        error: 'No se puede conectar con el servidor',
        message: 'Servidor no disponible',
      };
    }
    
    const healthEndpoints = ['/health', '/actuator/health', '/api/health', '/status'];
    
    for (const endpoint of healthEndpoints) {
      try {
        const result = await this.get<HealthCheckResponse>(endpoint);
        if (result.success) {
          return result;
        }
      } catch {
        continue;
      }
    }
    
    return {
      success: true,
      data: {
        status: 'available',
        timestamp: new Date().toISOString(),
      },
      message: 'Servidor disponible',
    };
  }

  // ========== MÉTODOS ESPECÍFICOS PARA PROYECTOS (basados en Swagger) ==========
  
  // Obtener proyectos pendientes con paginación (basado en swagger)
  async getProyectosPendientes(page: number = 0, size: number = 10): Promise<ApiResponse<PaginatedResponse<ProyectoAPI>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    return this.get<PaginatedResponse<ProyectoAPI>>(`/admin/pending?${params.toString()}`);
  }

  // Aprobar usuario/proyecto (basado en swagger)
  async aprobarProyecto(userId: string): Promise<ApiResponse<ApprovalResponse>> {
    return this.post<ApprovalResponse>(`/admin/approve/${userId}`, {});
  }

  // Rechazar usuario/proyecto (basado en swagger)
  async rechazarProyecto(userId: string): Promise<ApiResponse<ApprovalResponse>> {
    return this.delete<ApprovalResponse>(`/admin/reject/${userId}`);
  }

  // Obtener todos los proyectos con filtros y paginación
  async getProyectos(
    page: number = 0, 
    size: number = 10, 
    estado?: string, 
    search?: string
  ): Promise<ApiResponse<PaginatedResponse<ProyectoAPI>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    if (estado && estado !== 'all') {
      params.append('estado', estado);
    }
    
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    return this.get<PaginatedResponse<ProyectoAPI>>(`/api/proyectos?${params.toString()}`);
  }

  // Obtener proyecto específico
  async getProyecto(id: string): Promise<ApiResponse<ProyectoAPI>> {
    return this.get<ProyectoAPI>(`/api/proyectos/${id}`);
  }

  // Crear nuevo proyecto
  async createProyecto(data: CreateProyectoRequest): Promise<ApiResponse<ProyectoAPI>> {
    return this.post<ProyectoAPI>('/api/proyectos', data);
  }

  // Actualizar proyecto
  async updateProyecto(id: string, data: UpdateProyectoRequest): Promise<ApiResponse<ProyectoAPI>> {
    return this.put<ProyectoAPI>(`/api/proyectos/${id}`, data);
  }

  // Eliminar proyecto
  async deleteProyecto(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/api/proyectos/${id}`);
  }

  // ========== MÉTODOS PARA OTRAS ENTIDADES ==========

  // Requerimientos
  async getRequerimientos(page: number = 0, size: number = 10): Promise<ApiResponse<PaginatedResponse<Requerimiento>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    return this.get<PaginatedResponse<Requerimiento>>(`/api/requerimientos?${params.toString()}`);
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

  // Método para verificar si el token está expirado
  isTokenExpired(): boolean {
    const token = this.getAuthToken();
    if (!token) {
      return true;
    }
    
    try {
      // Decodificar el JWT para verificar la expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      // Verificar si el token expira en los próximos 5 minutos
      return payload.exp && (payload.exp - now) < 300;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return true; 
    }
  }

  // Método para refrescar el token
  refreshToken(): void {
    console.log('🔄 Refrescando token de autenticación...');

    this.clearAuthToken();
    
    // Redirigir al login o mostrar mensaje
    console.log('⚠️ Token expirado. Es necesario autenticarse nuevamente.');
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