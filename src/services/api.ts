// src/services/api.ts
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
}

export interface CreateRequerimientoRequest {
  titulo: string;
  descripcion: string;
  prioridad?: 'alta' | 'media' | 'baja';
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
}

export interface SendMensajeRequest {
  contenido: string;
  destinatario: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  estado: string;
  fechaInicio: string;
  fechaFin?: string;
  responsable?: string;
}

export interface CreateProyectoRequest {
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin?: string;
  responsable?: string;
}

export interface Feria {
  id: string;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  estado: string;
}

export interface CreateFeriaRequest {
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
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
}

export interface CreateLocalComercialRequest {
  nombre: string;
  direccion: string;
  propietario: string;
  telefono?: string;
  email?: string;
  tipoNegocio: string;
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
  };
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  version: string;
}

// Clase para manejar las peticiones a la API
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Método para obtener el token de autenticación
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  // Método para crear headers por defecto
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Método genérico para hacer peticiones con mejor manejo de errores
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      };

      console.log('Making request to:', url);
      console.log('With config:', config);

      const response = await fetch(url, config);
      
      // Log para debugging
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const contentType = response.headers.get('content-type');
      
      // Si la respuesta no es JSON, intentamos obtener texto
      let data;
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.log('Response text:', text);
          // Intentamos parsear el texto como JSON
          try {
            data = JSON.parse(text);
          } catch {
            data = { message: text };
          }
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        data = { message: 'Error al procesar la respuesta del servidor' };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
          message: data.message || `Error ${response.status}`,
        };
      }

      return {
        success: true,
        data,
        message: data.message || 'Operación exitosa',
      };
    } catch (error) {
      console.error('API request failed:', error);
      
      // Manejo específico de errores de red
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Error de conexión. Verifique su conexión a internet o que el servidor esté disponible.',
          message: 'Error de conexión con el servidor',
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'Error en la operación',
      };
    }
  }

  // Método de autenticación específico para login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Attempting login with:', credentials.username);
      
      // Probamos diferentes endpoints posibles
      const possibleEndpoints = ['/auth/login', '/login', '/api/auth/login', '/api/login'];
      
      for (const endpoint of possibleEndpoints) {
        try {
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          console.log(`Tried endpoint ${endpoint}, status: ${response.status}`);

          if (response.status === 404) {
            // Endpoint no encontrado, probar el siguiente
            continue;
          }

          const contentType = response.headers.get('content-type');
          let data;
          
          try {
            if (contentType && contentType.includes('application/json')) {
              data = await response.json();
            } else {
              const text = await response.text();
              console.log('Login response text:', text);
              try {
                data = JSON.parse(text);
              } catch {
                data = { message: text };
              }
            }
          } catch (parseError) {
            console.error('Error parsing login response:', parseError);
            data = { message: 'Error al procesar la respuesta del servidor' };
          }

          console.log('Login response data:', data);
          
          if (response.ok) {
            // Login exitoso
            return {
              success: true,
              token: data.token || data.accessToken || data.access_token,
              user: data.user || { 
                id: data.id || '1', 
                username: credentials.username,
                email: credentials.username 
              },
              message: data.message || 'Login exitoso',
            };
          } else {
            // Error en login pero endpoint válido
            return {
              success: false,
              message: data.message || data.error || 'Credenciales incorrectas',
            };
          }
        } catch (endpointError) {
          console.error(`Error with endpoint ${endpoint}:`, endpointError);
          continue;
        }
      }
      
      // Si llegamos aquí, ningún endpoint funcionó
      return {
        success: false,
        message: 'No se pudo conectar con el servidor de autenticación',
      };
      
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión con el servidor',
      };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // Métodos GET
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  // Métodos POST
  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Métodos PUT
  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Métodos DELETE
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Health check para verificar conexión
  async healthCheck(): Promise<ApiResponse<HealthCheckResponse>> {
    const endpoints = ['/health', '/actuator/health', '/api/health', '/status'];
    
    for (const endpoint of endpoints) {
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
      success: false,
      error: 'No se pudo verificar el estado del servidor',
      message: 'Error de conectividad',
    };
  }

  // Métodos específicos para tu aplicación

  // Requerimientos
  async getRequerimientos(): Promise<ApiResponse<Requerimiento[]>> {
    return this.get<Requerimiento[]>('/requerimientos');
  }

  async createRequerimiento(data: CreateRequerimientoRequest): Promise<ApiResponse<Requerimiento>> {
    return this.post<Requerimiento>('/requerimientos', data);
  }

  async updateRequerimiento(id: string, data: UpdateRequerimientoRequest): Promise<ApiResponse<Requerimiento>> {
    return this.put<Requerimiento>(`/requerimientos/${id}`, data);
  }

  async deleteRequerimiento(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/requerimientos/${id}`);
  }

  // Mensajería
  async getMensajes(): Promise<ApiResponse<Mensaje[]>> {
    return this.get<Mensaje[]>('/mensajes');
  }

  async sendMensaje(data: SendMensajeRequest): Promise<ApiResponse<Mensaje>> {
    return this.post<Mensaje>('/mensajes', data);
  }

  // Proyectos
  async getProyectos(): Promise<ApiResponse<Proyecto[]>> {
    return this.get<Proyecto[]>('/proyectos');
  }

  async createProyecto(data: CreateProyectoRequest): Promise<ApiResponse<Proyecto>> {
    return this.post<Proyecto>('/proyectos', data);
  }

  // Ferias
  async getFerias(): Promise<ApiResponse<Feria[]>> {
    return this.get<Feria[]>('/ferias');
  }

  async createFeria(data: CreateFeriaRequest): Promise<ApiResponse<Feria>> {
    return this.post<Feria>('/ferias', data);
  }

  // Locales Comerciales
  async getLocalesComerciales(): Promise<ApiResponse<LocalComercial[]>> {
    return this.get<LocalComercial[]>('/locales-comerciales');
  }

  async createLocalComercial(data: CreateLocalComercialRequest): Promise<ApiResponse<LocalComercial>> {
    return this.post<LocalComercial>('/locales-comerciales', data);
  }

  // Dashboard data
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return this.get<DashboardData>('/dashboard');
  }
}

// Instancia del servicio API
export const apiService = new ApiService(API_BASE_URL);

// Hook personalizado para usar en componentes React (opcional)
export const useApi = () => {
  return apiService;
};