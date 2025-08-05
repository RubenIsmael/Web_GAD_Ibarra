import React, { useState, useEffect, useCallback } from 'react';
import { FolderOpen, Plus, Search, Filter, Calendar, User, TrendingUp, Eye, Edit, Trash2, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ApiService } from './login/ApiService'; 
import '../styles/proyectos.css';

// Usar la misma instancia global del servicio
const apiService = new ApiService();

// Interfaces actualizadas basadas en la API
interface ProyectoAPI {
  id: string;
  nombre: string;
  descripcion: string;
  estado?: 'pendiente' | 'aprobado' | 'rechazado' | 'en-progreso' | 'completado';
  fechaEnvio?: string;
  responsable?: string;
  presupuesto?: number;
  categoria?: string;
  fechaInicio?: string;
  fechaFin?: string;
  email?: string;
  cedula?: string;
  telefono?: string;
  address?: string;
}

interface ProyectoStats {
  totalProyectos: number;
  pendientes: number;
  aprobados: number;
  rechazados: number;
}

const Proyectos: React.FC = () => {
  // Estados para datos
  const [proyectos, setProyectos] = useState<ProyectoAPI[]>([]);
  const [proyectosFiltrados, setProyectosFiltrados] = useState<ProyectoAPI[]>([]);
  const [stats, setStats] = useState<ProyectoStats>({
    totalProyectos: 0,
    pendientes: 0,
    aprobados: 0,
    rechazados: 0
  });
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Estados para UI
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string>('');
  const [renderError, setRenderError] = useState<string>('');
  
  // Estados para nuevo proyecto
  const [newProyecto, setNewProyecto] = useState({
    nombre: '',
    descripcion: '',
    responsable: '',
    presupuesto: '',
    categoria: '',
    email: '',
    cedula: '',
    telefono: '',
    address: ''
  });

  // Estados para modales
  const [selectedProyecto, setSelectedProyecto] = useState<ProyectoAPI | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Función unificada para verificar token
  const verificarToken = (): boolean => {
    console.log('🔍 Verificando estado de autenticación...');
    
    const token = apiService.getCurrentToken();
    const isAuth = apiService.isAuthenticated();
    
    console.log('🔑 Token actual:', token ? `${token.substring(0, 50)}...` : 'NO HAY TOKEN');
    console.log('✅ ¿Está autenticado?:', isAuth);
    
    if (!isAuth || !token) {
      console.error('❌ No hay token de autenticación válido');
      setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
      return false;
    }
    
    // Verificar si el token está expirado
    if (apiService.isTokenExpired()) {
      console.warn('⚠️ Token expirado');
      setError('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
      apiService.clearToken();
      return false;
    }
    
    console.log('✅ Token válido y no expirado');
    return true;
  };

  // Cargar proyectos con verificación de token mejorada
  const loadProyectos = async (page: number = currentPage, size: number = pageSize) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🚀 Iniciando carga de proyectos...');
      
      // Verificar token antes de hacer la petición
      if (!verificarToken()) {
        setLoading(false);
        return;
      }
      
      console.log('📊 Parámetros de consulta:', { page, size, searchTerm });
      
      // Usar endpoints corregidos basados en swagger
      // Siempre usar el endpoint de proyectos pendientes para obtener datos reales
      console.log('🔍 Usando endpoint de proyectos pendientes...');
      const response = await apiService.getProyectosPendientes(page, size);
      
      console.log('📡 Respuesta de la API:', response);
      
      if (response.success && response.data) {
        console.log('✅ Proyectos cargados exitosamente');
        console.log('📋 Cantidad de proyectos:', response.data.content.length);
        console.log('🔍 Datos de proyectos recibidos:', response.data.content);
        
        // Validar y limpiar datos antes de setear
        const proyectosLimpios = response.data.content.filter(proyecto => {
          if (!proyecto || !proyecto.id) {
            console.warn('⚠️ Proyecto filtrado por datos incompletos:', proyecto);
            return false;
          }
          
          // Debug: Verificar estructura de datos
          console.log('🔍 Estructura del proyecto recibido:', {
            hasId: !!proyecto.id,
            hasNombre: !!proyecto.nombre,
            hasDescripcion: !!proyecto.descripcion,
            hasEstado: !!proyecto.estado,
            hasResponsable: !!proyecto.responsable,
            hasCategoria: !!proyecto.categoria,
            nombreValue: proyecto.nombre,
            categoriaValue: proyecto.categoria,
            responsableValue: proyecto.responsable
          });
          
          return true;
        });
        
        console.log('📋 Proyectos después del filtrado:', proyectosLimpios.length);
        
        // Normalizar datos de proyectos para asegurar compatibilidad
        const proyectosNormalizados = proyectosLimpios.map(proyecto => ({
          id: proyecto.id,
          nombre: proyecto.nombre || proyecto.name || proyecto.titulo || proyecto.title || '',
          descripcion: proyecto.descripcion || proyecto.description || proyecto.desc || '',
          estado: proyecto.estado || proyecto.status || 'pendiente',
          fechaEnvio: proyecto.fechaEnvio || proyecto.fecha_envio || proyecto.fechaEnvio || '',
          responsable: proyecto.responsable || proyecto.responsible || proyecto.autor || '',
          presupuesto: proyecto.presupuesto || proyecto.budget || proyecto.presupuesto || 0,
          categoria: proyecto.categoria || proyecto.category || proyecto.cat || '',
          fechaInicio: proyecto.fechaInicio || proyecto.fecha_inicio || proyecto.startDate || '',
          fechaFin: proyecto.fechaFin || proyecto.fecha_fin || proyecto.endDate || '',
          email: proyecto.email || proyecto.correo || proyecto.email || '',
          cedula: proyecto.cedula || proyecto.identification || proyecto.cedula || '',
          telefono: proyecto.phone || proyecto.telefono || proyecto.phone || '',
          address: proyecto.address || proyecto.direccion || proyecto.address || ''
        }));
        
        console.log('📋 Proyectos normalizados:', proyectosNormalizados);
        
        setProyectos(proyectosNormalizados);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
        setCurrentPage(response.data.pageable.pageNumber);
        
        // Aplicar filtros después de cargar los proyectos
        setTimeout(() => filtrarProyectos(), 0);
        
        // Limpiar error de renderizado cuando carga exitosa
        setRenderError('');
        
        // Calcular estadísticas
        calculateStats(proyectosLimpios, response.data.totalElements);
        
      } else {
        console.error('❌ Error en respuesta:', response.error || response.message);
        
        // Manejar errores de autenticación específicamente
        if (response.status === 401) {
          setError('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
          apiService.clearToken();
          window.location.reload();
        } else if (response.status === 403) {
          setError('No tiene permisos para ver los proyectos. Contacte al administrador.');
        } else if (response.status === 404) {
          setError('Endpoint no encontrado. Verifique la configuración del servidor.');
        } else {
          setError(response.error || response.message || 'Error al cargar proyectos');
        }
        setProyectos([]);
      }
    } catch (err) {
      console.error('💥 Error de conexión al cargar proyectos:', err);
      
      // Manejo mejorado de errores de red
      if (err instanceof Error) {
        if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
          setError('Error de conexión. Verifique que el servidor esté disponible.');
        } else if (err.message.includes('timeout') || err.message.includes('AbortError')) {
          setError('La conexión tardó demasiado tiempo. Intente nuevamente.');
        } else {
          setError(`Error de conexión: ${err.message}`);
        }
      } else {
        setError('Error de conexión al cargar proyectos. Verifique su conexión a internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calculateStats = (proyectosList: ProyectoAPI[], total: number) => {
    const pendientes = proyectosList.filter(p => p.estado === 'pendiente').length;
    const aprobados = proyectosList.filter(p => p.estado === 'aprobado').length;
    const rechazados = proyectosList.filter(p => p.estado === 'rechazado').length;
    
    setStats({
      totalProyectos: total,
      pendientes,
      aprobados,
      rechazados
    });
  };

  // Aprobar proyecto con verificación mejorada
  const aprobarProyecto = async (userId: string) => {
    try {
      if (!verificarToken()) return;
      
      setLoading(true);
      console.log('✅ Aprobando proyecto:', userId);
      
      const response = await apiService.aprobarProyecto(userId);
      console.log('📡 Respuesta de aprobación:', response);
      
      if (response.success) {
        console.log('🎉 Proyecto aprobado exitosamente');
        await loadProyectos();
        // Actualizar estadísticas inmediatamente
        setTimeout(() => filtrarProyectos(), 100);
        alert('Proyecto aprobado exitosamente');
      } else {
        console.error('❌ Error al aprobar:', response.error);
        if (response.status === 401) {
          setError('Su sesión ha expirado. Recargue la página e inicie sesión nuevamente.');
          apiService.clearToken();
        } else if (response.status === 403) {
          alert('No tiene permisos para aprobar proyectos');
        } else if (response.status === 404) {
          alert('Proyecto no encontrado o endpoint no disponible');
        } else {
          alert(response.error || 'Error al aprobar proyecto');
        }
      }
    } catch (err) {
      console.error('💥 Error de conexión al aprobar proyecto:', err);
      alert('Error de conexión al aprobar proyecto');
    } finally {
      setLoading(false);
    }
  };

  // Rechazar proyecto con verificación mejorada
  const rechazarProyecto = async (userId: string) => {
    try {
      if (!verificarToken()) return;
      
      setLoading(true);
      console.log('❌ Rechazando proyecto:', userId);
      
      const response = await apiService.rechazarProyecto(userId);
      console.log('📡 Respuesta de rechazo:', response);
      
      if (response.success) {
        console.log('✅ Proyecto rechazado exitosamente');
        await loadProyectos();
        // Actualizar estadísticas inmediatamente
        setTimeout(() => filtrarProyectos(), 100);
        alert('Proyecto rechazado exitosamente');
      } else {
        console.error('❌ Error al rechazar:', response.error);
        if (response.status === 401) {
          setError('Su sesión ha expirado. Recargue la página e inicie sesión nuevamente.');
          apiService.clearToken();
        } else if (response.status === 403) {
          alert('No tiene permisos para rechazar proyectos');
        } else if (response.status === 404) {
          alert('Proyecto no encontrado o endpoint no disponible');
        } else {
          alert(response.error || 'Error al rechazar proyecto');
        }
      }
    } catch (err) {
      console.error('💥 Error de conexión al rechazar proyecto:', err);
      alert('Error de conexión al rechazar proyecto');
    } finally {
      setLoading(false);
    }
  };

  // Crear proyecto con verificación mejorada
  const crearProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProyecto.nombre.trim() || !newProyecto.descripcion.trim()) {
      alert('Nombre y descripción son requeridos');
      return;
    }
    
    try {
      if (!verificarToken()) return;
      
      setLoading(true);
      const proyectoData = {
        nombre: newProyecto.nombre.trim(),
        descripcion: newProyecto.descripcion.trim(),
        responsable: newProyecto.responsable.trim(),
        presupuesto: newProyecto.presupuesto ? parseFloat(newProyecto.presupuesto) : undefined,
        categoria: newProyecto.categoria.trim() || undefined,
        email: newProyecto.email.trim() || undefined,
        cedula: newProyecto.cedula.trim() || undefined,
        telefono: newProyecto.telefono.trim() || undefined,
        address: newProyecto.address.trim() || undefined
      };
      
      console.log('➕ Creando proyecto:', proyectoData);
      
      const response = await apiService.createProyecto(proyectoData);
      console.log('📡 Respuesta de creación:', response);
      
      if (response.success) {
        console.log('🎉 Proyecto creado exitosamente');
        setShowModal(false);
        setNewProyecto({
          nombre: '',
          descripcion: '',
          responsable: '',
          presupuesto: '',
          categoria: '',
          email: '',
          cedula: '',
          telefono: '',
          address: ''
        });
        await loadProyectos();
        alert('Proyecto creado exitosamente');
      } else {
        console.error('❌ Error al crear:', response.error);
        if (response.status === 401) {
          setError('Su sesión ha expirado. Recargue la página e inicie sesión nuevamente.');
          apiService.clearToken();
        } else {
          alert(response.error || 'Error al crear proyecto');
        }
      }
    } catch (err) {
      console.error('💥 Error de conexión al crear proyecto:', err);
      alert('Error de conexión al crear proyecto');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar página
  const changePage = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      loadProyectos(newPage, pageSize);
    }
  };

  // Cambiar tamaño de página
  const changePageSize = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
    loadProyectos(0, newSize);
  };

  // Filtrar por estado
  // Función para filtrar proyectos
  const filtrarProyectos = useCallback(() => {
    let proyectosFiltrados = proyectos;

    // Filtrar por estado
    if (filterStatus !== 'all') {
      proyectosFiltrados = proyectosFiltrados.filter(proyecto => 
        proyecto.estado === filterStatus
      );
    }

    // Filtrar por búsqueda
    if (searchTerm.trim() !== '') {
      const terminoBusqueda = searchTerm.toLowerCase();
      proyectosFiltrados = proyectosFiltrados.filter(proyecto => 
        (proyecto.nombre && proyecto.nombre.toLowerCase().includes(terminoBusqueda)) ||
        (proyecto.email && proyecto.email.toLowerCase().includes(terminoBusqueda)) ||
        (proyecto.cedula && proyecto.cedula.toLowerCase().includes(terminoBusqueda)) ||
        (proyecto.telefono && proyecto.telefono.toLowerCase().includes(terminoBusqueda)) ||
        (proyecto.address && proyecto.address.toLowerCase().includes(terminoBusqueda)) ||
        (proyecto.categoria && proyecto.categoria.toLowerCase().includes(terminoBusqueda))
      );
    }

    // Filtrar proyectos no registrados (sin nombre válido)
    proyectosFiltrados = proyectosFiltrados.filter(proyecto => 
      proyecto.nombre && proyecto.nombre.trim() !== ''
    );

    setProyectosFiltrados(proyectosFiltrados);
  }, [proyectos, filterStatus, searchTerm]);

  const handleFilterChange = (newFilter: string) => {
    setFilterStatus(newFilter);
    setCurrentPage(0);
    // No recargar desde la API, solo filtrar localmente
    setTimeout(() => filtrarProyectos(), 0);
  };

  // Buscar proyectos
  const handleSearch = useCallback(() => {
    setCurrentPage(0);
    filtrarProyectos();
  }, [filtrarProyectos]);

  // Efecto inicial con debugging mejorado
  useEffect(() => {
    console.log('🚀 Iniciando componente Proyectos...');
    console.log('🔍 Estado inicial del token:', {
      isAuthenticated: apiService.isAuthenticated(),
      currentToken: apiService.getCurrentToken()?.substring(0, 50) + '...',
      isExpired: apiService.isTokenExpired()
    });
    
    // Verificar token de manera más robusta
    const inicializar = async () => {
      // Dar tiempo para que se inicialice el token si viene de login
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!verificarToken()) {
        console.error('❌ No hay token válido, no se cargarán los proyectos');
        setError('No hay sesión válida. Por favor, inicie sesión.');
        return;
      }
      
      // Si hay token, cargar proyectos
      console.log('✅ Token válido encontrado, cargando proyectos...');
      loadProyectos();
    };
    
    inicializar();
  }, []);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    if (!apiService.isAuthenticated()) return;
    
    const delayedSearch = setTimeout(() => {
      filtrarProyectos();
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, filtrarProyectos]);

  // Efecto para aplicar filtros cuando cambien los proyectos
  useEffect(() => {
    if (proyectos.length > 0) {
      filtrarProyectos();
    }
  }, [proyectos, filtrarProyectos]);

  const getStatusColor = (estado: string | undefined) => {
    if (!estado) return 'bg-gray-100 text-gray-800';
    
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'aprobado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      case 'en-progreso': return 'bg-blue-100 text-blue-800';
      case 'completado': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatEstadoText = (estado: string | undefined) => {
    if (!estado) return 'Sin estado';
    return estado.charAt(0).toUpperCase() + estado.slice(1).replace('-', ' ');
  };

  // Función para renderizar proyectos de forma segura
  const renderProyectos = () => {
    try {
      return proyectosFiltrados.map((proyecto) => {
        // Validación de datos del proyecto
        if (!proyecto || !proyecto.id) {
          console.warn('⚠️ Proyecto con datos incompletos:', proyecto);
          return null;
        }

        // Debug: Mostrar datos del proyecto
        console.log('🔍 Datos del proyecto:', {
          id: proyecto.id,
          nombre: proyecto.nombre,
          descripcion: proyecto.descripcion,
          estado: proyecto.estado,
          responsable: proyecto.responsable,
          categoria: proyecto.categoria
        });

        // Determinar el estado real del proyecto
        const estadoProyecto = proyecto.estado || 'pendiente';
        
        // Función para generar un nombre descriptivo cuando no hay nombre
        const generarNombreDescriptivo = (proyecto: ProyectoAPI): string => {
          if (proyecto.nombre && proyecto.nombre.trim() !== '') {
            return proyecto.nombre;
          }
          
          // Intentar generar un nombre basado en otros campos
          if (proyecto.categoria && proyecto.categoria.trim() !== '') {
            return `${proyecto.categoria} #${proyecto.id}`;
          }
          
          if (proyecto.responsable && proyecto.responsable.trim() !== '') {
            return `Proyecto de ${proyecto.responsable} #${proyecto.id}`;
          }
          
          // Fallback al ID con indicación de que falta nombre
          return `Proyecto #${proyecto.id} (Sin nombre)`;
        };
        
        const nombreProyecto = generarNombreDescriptivo(proyecto);

        return (
          <div key={proyecto.id} className="proyectos-card">
            <div className="proyectos-card-header">
              <div className="proyectos-card-title-group">
                <div className="proyectos-card-icon">
                  <FolderOpen />
                </div>
                <div>
                  <h3 className="proyectos-card-name" title={!proyecto.nombre || proyecto.nombre.trim() === '' ? 'Este proyecto no tiene nombre asignado' : ''}>
                    {nombreProyecto}
                    {(!proyecto.nombre || proyecto.nombre.trim() === '') && (
                      <span className="text-xs text-gray-500 ml-2">(Sin nombre)</span>
                    )}
                  </h3>
                  <p className="proyectos-card-category">{proyecto.categoria || 'General'}</p>
                </div>
              </div>
              <span className={`proyectos-card-status ${getStatusColor(estadoProyecto)}`}>
                {formatEstadoText(estadoProyecto)}
              </span>
            </div>

            <div className="proyectos-details-grid">
              <div>
                <p className="proyectos-detail-label">Correo Electrónico</p>
                <p className="proyectos-detail-value">
                  <User className="proyectos-detail-icon" />
                  {proyecto.email || 'No especificado'}
                </p>
              </div>
              <div>
                <p className="proyectos-detail-label">Número de Cédula</p>
                <p className="proyectos-detail-value">
                  {proyecto.cedula || 'No especificado'}
                </p>
              </div>
              <div>
                <p className="proyectos-detail-label">Número de Teléfono</p>
                <p className="proyectos-detail-value">
                  <Calendar className="proyectos-detail-icon" />
                  {proyecto.telefono || 'No especificado'}
                </p>
              </div>
              <div>
                <p className="proyectos-detail-label">Dirección</p>
                <p className="proyectos-detail-value">
                  {proyecto.address || 'No especificado'}
                </p>
              </div>
            </div>

            <div className="proyectos-card-footer">
              {estadoProyecto === 'pendiente' ? (
                <>
                  <button 
                    onClick={() => aprobarProyecto(proyecto.id)}
                    className="proyectos-action-button bg-green-600 hover:bg-green-700 text-white"
                    disabled={loading || !apiService.isAuthenticated()}
                    title="Aprobar proyecto"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aprobar</span>
                  </button>
                  <button 
                    onClick={() => rechazarProyecto(proyecto.id)}
                    className="proyectos-action-button bg-red-600 hover:bg-red-700 text-white"
                    disabled={loading || !apiService.isAuthenticated()}
                    title="Rechazar proyecto"
                  >
                    <X className="w-4 h-4" />
                    <span>Rechazar</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setSelectedProyecto(proyecto);
                      setShowViewModal(true);
                    }}
                    className="proyectos-action-button bg-blue-600 hover:bg-blue-700 text-white"
                    title="Ver detalles del proyecto"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedProyecto(proyecto);
                      setNewProyecto({
                        nombre: proyecto.nombre || '',
                        descripcion: proyecto.descripcion || '',
                        responsable: proyecto.responsable || '',
                        presupuesto: proyecto.presupuesto?.toString() || '',
                        categoria: proyecto.categoria || '',
                        email: proyecto.email || '',
                        cedula: proyecto.cedula || '',
                        telefono: proyecto.telefono || '',
                        address: proyecto.address || ''
                      });
                      setShowEditModal(true);
                    }}
                    className="proyectos-action-button bg-yellow-600 hover:bg-yellow-700 text-white"
                    title="Editar proyecto"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button 
                    onClick={async () => {
                      if (!window.confirm('¿Está seguro que desea eliminar este proyecto? Esta acción no se puede deshacer.')) {
                        return;
                      }

                      try {
                        if (!verificarToken()) return;
                        
                        setLoading(true);
                        console.log('🗑️ Eliminando proyecto:', proyecto.id);
                        
                        const response = await apiService.deleteProyecto(proyecto.id);
                        console.log('📡 Respuesta de eliminación:', response);
                        
                        if (response.success) {
                          console.log('🎉 Proyecto eliminado exitosamente');
                          await loadProyectos();
                          alert('Proyecto eliminado exitosamente');
                        } else {
                          console.error('❌ Error al eliminar:', response.error);
                          if (response.status === 401) {
                            setError('Su sesión ha expirado. Recargue la página e inicie sesión nuevamente.');
                            apiService.clearToken();
                          } else if (response.status === 403) {
                            alert('No tiene permisos para eliminar proyectos');
                          } else if (response.status === 404) {
                            alert('Proyecto no encontrado');
                          } else {
                            alert(response.error || 'Error al eliminar proyecto');
                          }
                        }
                      } catch (err) {
                        console.error('💥 Error de conexión al eliminar proyecto:', err);
                        alert('Error de conexión al eliminar proyecto');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="proyectos-action-button bg-red-600 hover:bg-red-700 text-white"
                    title="Eliminar proyecto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        );
      }).filter(Boolean);
    } catch (renderErr) {
      console.error('💥 Error al renderizar proyectos:', renderErr);
      
      // Solo actualizar el estado si realmente ha cambiado para evitar loops
      const errorMessage = renderErr instanceof Error ? renderErr.message : 'Error desconocido';
      if (renderError !== errorMessage) {
        // Usar setTimeout para evitar actualizar estado durante render
        setTimeout(() => {
          setRenderError(errorMessage);
        }, 0);
      }
      
      return [
        <div key="error" className="col-span-full text-center py-8">
          <p className="text-red-600">Error al mostrar los proyectos. Revise la consola para más detalles.</p>
        </div>
      ];
    }
  };

  return (
    <div className="proyectos-container">
      <div className="proyectos-header">
        <h1 className="proyectos-title">
          <FolderOpen className="w-8 h-8 text-red-600 mr-3" />
          Gestión de Proyectos
        </h1>
        <p className="proyectos-subtitle">
          Administración y aprobación de proyectos municipales
        </p>
      </div>

      {/* Mensaje de error mejorado con más contexto */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
            <div className="flex gap-2">
              {error.includes('sesión') && (
                <button 
                  onClick={() => {
                    console.log('🔄 Recargando página...');
                    window.location.reload();
                  }} 
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Recargar página
                </button>
              )}
              <button 
                onClick={() => {
                  setError('');
                  if (apiService.isAuthenticated()) {
                    loadProyectos();
                  }
                }} 
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
          {/* Debug info solo en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-red-600">
              <p>Debug: Token presente: {apiService.isAuthenticated() ? 'SÍ' : 'NO'}</p>
              <p>Debug: Token expirado: {apiService.isTokenExpired() ? 'SÍ' : 'NO'}</p>
              <p>Debug: Token preview: {apiService.getCurrentToken()?.substring(0, 30) + '...' || 'N/A'}</p>
            </div>
          )}
        </div>
      )}

      {/* Estadísticas */}
      <div className="proyectos-stats-grid">
        <div className="proyectos-stat-card">
          <div className="proyectos-stat-content">
            <div>
              <p className="proyectos-stat-text-sm">Total Proyectos</p>
              <p className="proyectos-stat-text-lg">{stats.totalProyectos}</p>
            </div>
            <div className="proyectos-stat-icon-container bg-blue-100">
              <FolderOpen className="proyectos-stat-icon text-blue-600" />
            </div>
          </div>
        </div>
        <div className="proyectos-stat-card">
          <div className="proyectos-stat-content">
            <div>
              <p className="proyectos-stat-text-sm">Pendientes</p>
              <p className="proyectos-stat-text-lg">{stats.pendientes}</p>
            </div>
            <div className="proyectos-stat-icon-container bg-yellow-100">
              <Calendar className="proyectos-stat-icon text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="proyectos-stat-card">
          <div className="proyectos-stat-content">
            <div>
              <p className="proyectos-stat-text-sm">Aprobados</p>
              <p className="proyectos-stat-text-lg">{stats.aprobados}</p>
            </div>
            <div className="proyectos-stat-icon-container bg-green-100">
              <TrendingUp className="proyectos-stat-icon text-green-600" />
            </div>
          </div>
        </div>
        <div className="proyectos-stat-card">
          <div className="proyectos-stat-content">
            <div>
              <p className="proyectos-stat-text-sm">Rechazados</p>
              <p className="proyectos-stat-text-lg">{stats.rechazados}</p>
            </div>
            <div className="proyectos-stat-icon-container bg-red-100">
              <X className="proyectos-stat-icon text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="proyectos-filters">
        <div className="proyectos-filters-container">
          <div className="proyectos-search-container">
            <Search className="proyectos-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, cédula, teléfono o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="proyectos-search-input"
              disabled={!apiService.isAuthenticated() || loading}
            />
          </div>

          <div className="proyectos-filters-actions">
            <div className="proyectos-filter-group">
              <Filter className="proyectos-filter-icon" />
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="proyectos-filter-select"
                disabled={!apiService.isAuthenticated() || loading}
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
                <option value="en-progreso">En Progreso</option>
                <option value="completado">Completado</option>
              </select>
            </div>

            <div className="proyectos-filter-group">
              <span className="text-sm text-gray-600">Mostrar:</span>
              <select
                value={pageSize}
                onChange={(e) => changePageSize(parseInt(e.target.value))}
                className="proyectos-filter-select"
                disabled={!apiService.isAuthenticated() || loading}
              >
                <option value={5}>5 por página</option>
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={50}>50 por página</option>
              </select>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="proyectos-add-button"
              disabled={loading || !apiService.isAuthenticated()}
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Proyecto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de carga mejorado */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-2 text-gray-600">
            {proyectos.length === 0 ? 'Cargando proyectos...' : 'Actualizando...'}
          </span>
        </div>
      )}

      {/* Error de renderizado */}
      {renderError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <span className="text-lg mr-2">💥</span>
            <span>Error al renderizar proyectos: {renderError}</span>
          </div>
        </div>
      )}
      
      {/* Indicador de proyectos filtrados */}
      {!loading && proyectosFiltrados.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Mostrando {proyectosFiltrados.length} de {proyectos.length} proyectos
          {filterStatus !== 'all' && ` (filtrado por: ${formatEstadoText(filterStatus)})`}
          {searchTerm && ` (búsqueda: "${searchTerm}")`}
        </div>
      )}

      {/* Lista de proyectos */}
      <div className="proyectos-grid">
        {!loading && proyectosFiltrados.length === 0 && proyectos.length > 0 && (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No se encontraron proyectos</p>
              <p className="text-sm">
                {filterStatus !== 'all' 
                  ? `No hay proyectos con estado "${formatEstadoText(filterStatus)}"`
                  : searchTerm 
                    ? `No hay proyectos que coincidan con "${searchTerm}" en nombre, correo, cédula, teléfono o dirección`
                    : 'No hay proyectos registrados'
                }
              </p>
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setSearchTerm('');
                  filtrarProyectos();
                }}
                className="mt-4 text-blue-600 hover:text-blue-800 underline"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
        {!loading && renderProyectos()}
      </div>

      {/* Mensaje cuando no hay proyectos - mejorado */}
      {!loading && !renderError && proyectos.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proyectos</h3>
          <p className="text-gray-500 mb-4">
            {error ? 
              'Hubo un problema al cargar los proyectos.' :
              searchTerm || filterStatus !== 'all' ? 
                'No se encontraron proyectos con los filtros aplicados.' : 
                'Aún no hay proyectos registrados.'
            }
          </p>
          {!error && apiService.isAuthenticated() && (
            <button
              onClick={() => loadProyectos()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Recargar proyectos
            </button>
          )}
        </div>
      )}

      {/* Paginación mejorada */}
      {!loading && !renderError && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-6 py-3 border-t border-gray-200 rounded-lg shadow-sm mt-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 0 || !apiService.isAuthenticated() || loading}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || !apiService.isAuthenticated() || loading}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">{currentPage * pageSize + 1}</span>
                {' '}a{' '}
                <span className="font-medium">
                  {Math.min((currentPage + 1) * pageSize, totalElements)}
                </span>
                {' '}de{' '}
                <span className="font-medium">{totalElements}</span>
                {' '}proyectos
              </p>
            </div>
            
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 0 || !apiService.isAuthenticated() || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage <= 2) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => changePage(pageNum)}
                      disabled={!apiService.isAuthenticated() || loading}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-red-50 border-red-500 text-red-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || !apiService.isAuthenticated() || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal para nuevo proyecto */}
      {showModal && (
        <div className="proyectos-modal-overlay">
          <div className="proyectos-modal">
            <h2 className="proyectos-modal-title">Nuevo Proyecto</h2>
            <form onSubmit={crearProyecto} className="proyectos-modal-form">
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  value={newProyecto.nombre}
                  onChange={(e) => setNewProyecto({...newProyecto, nombre: e.target.value})}
                  className="proyectos-form-input"
                  placeholder="Ingrese el nombre del proyecto"
                  required
                  disabled={!apiService.isAuthenticated() || loading}
                />
              </div>
              
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Descripción *
                </label>
                <textarea
                  value={newProyecto.descripcion}
                  onChange={(e) => setNewProyecto({...newProyecto, descripcion: e.target.value})}
                  className="proyectos-form-textarea"
                  rows={3}
                  placeholder="Ingrese la descripción del proyecto"
                  required
                  disabled={!apiService.isAuthenticated() || loading}
                ></textarea>
              </div>
              
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Categoría
                </label>
                <input
                  type="text"
                  value={newProyecto.categoria}
                  onChange={(e) => setNewProyecto({...newProyecto, categoria: e.target.value})}
                  className="proyectos-form-input"
                  placeholder="Categoría del proyecto"
                  disabled={!apiService.isAuthenticated() || loading}
                />
              </div>
              
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={newProyecto.email}
                  onChange={(e) => setNewProyecto({...newProyecto, email: e.target.value})}
                  className="proyectos-form-input"
                  placeholder="correo@ejemplo.com"
                  disabled={!apiService.isAuthenticated() || loading}
                />
              </div>
              
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Número de Cédula
                </label>
                <input
                  type="text"
                  value={newProyecto.cedula}
                  onChange={(e) => setNewProyecto({...newProyecto, cedula: e.target.value})}
                  className="proyectos-form-input"
                  placeholder="1234567890"
                  disabled={!apiService.isAuthenticated() || loading}
                />
              </div>
              
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Número de Teléfono
                </label>
                <input
                  type="tel"
                  value={newProyecto.telefono}
                  onChange={(e) => setNewProyecto({...newProyecto, telefono: e.target.value})}
                  className="proyectos-form-input"
                  placeholder="0987654321"
                  disabled={!apiService.isAuthenticated() || loading}
                />
              </div>
              
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Dirección
                </label>
                <textarea
                  value={newProyecto.address}
                  onChange={(e) => setNewProyecto({...newProyecto, address: e.target.value})}
                  className="proyectos-form-textarea"
                  rows={2}
                  placeholder="Ingrese la dirección completa"
                  disabled={!apiService.isAuthenticated() || loading}
                ></textarea>
              </div>
              
              <div className="proyectos-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="proyectos-cancel-button"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="proyectos-submit-button"
                  disabled={loading || !apiService.isAuthenticated()}
                >
                  {loading ? 'Creando...' : 'Crear Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver proyecto */}
      {showViewModal && selectedProyecto && (
        <div className="proyectos-modal-overlay">
          <div className="proyectos-modal max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="proyectos-modal-title">Detalles del Proyecto</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Proyecto
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedProyecto.nombre || 'No especificado'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedProyecto.estado)}`}>
                    {formatEstadoText(selectedProyecto.estado)}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedProyecto.categoria || 'General'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedProyecto.email || 'No especificado'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Cédula
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedProyecto.cedula || 'No especificado'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Teléfono
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedProyecto.telefono || 'No especificado'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedProyecto.address || 'No especificado'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded min-h-[100px]">
                  {selectedProyecto.descripcion || 'Sin descripción disponible'}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar proyecto */}
      {showEditModal && selectedProyecto && (
        <div className="proyectos-modal-overlay">
          <div className="proyectos-modal">
            <div className="flex justify-between items-center mb-6">
              <h2 className="proyectos-modal-title">Editar Proyecto</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              
              if (!newProyecto.nombre.trim() || !newProyecto.descripcion.trim()) {
                alert('Nombre y descripción son requeridos');
                return;
              }
              
              try {
                if (!verificarToken()) return;
                
                setLoading(true);
                const proyectoData = {
                  nombre: newProyecto.nombre.trim(),
                  descripcion: newProyecto.descripcion.trim(),
                  responsable: newProyecto.responsable.trim(),
                  presupuesto: newProyecto.presupuesto ? parseFloat(newProyecto.presupuesto) : undefined,
                  categoria: newProyecto.categoria.trim() || undefined,
                  email: newProyecto.email.trim() || undefined,
                  cedula: newProyecto.cedula.trim() || undefined,
                  telefono: newProyecto.telefono.trim() || undefined,
                  address: newProyecto.address.trim() || undefined
                };
                
                console.log('✏️ Actualizando proyecto:', selectedProyecto.id, proyectoData);
                
                const response = await apiService.updateProyecto(selectedProyecto.id, proyectoData);
                console.log('📡 Respuesta de actualización:', response);
                
                if (response.success) {
                  console.log('🎉 Proyecto actualizado exitosamente');
                  setShowEditModal(false);
                  setSelectedProyecto(null);
                  setNewProyecto({
                    nombre: '',
                    descripcion: '',
                    responsable: '',
                    presupuesto: '',
                    categoria: '',
                    email: '',
                    cedula: '',
                    telefono: '',
                    address: ''
                  });
                  await loadProyectos();
                  alert('Proyecto actualizado exitosamente');
                } else {
                  console.error('❌ Error al actualizar:', response.error);
                  if (response.status === 401) {
                    setError('Su sesión ha expirado. Recargue la página e inicie sesión nuevamente.');
                    apiService.clearToken();
                  } else {
                    alert(response.error || 'Error al actualizar proyecto');
                  }
                }
              } catch (err) {
                console.error('💥 Error de conexión al actualizar proyecto:', err);
                alert('Error de conexión al actualizar proyecto');
              } finally {
                setLoading(false);
              }
            }} className="proyectos-modal-form">
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  value={newProyecto.nombre}
                  onChange={(e) => setNewProyecto({...newProyecto, nombre: e.target.value})}
                  className="proyectos-form-input"
                  placeholder="Ingrese el nombre del proyecto"
                  required
                  disabled={!apiService.isAuthenticated() || loading}
                />
              </div>
              
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Descripción *
                </label>
                <textarea
                  value={newProyecto.descripcion}
                  onChange={(e) => setNewProyecto({...newProyecto, descripcion: e.target.value})}
                  className="proyectos-form-textarea"
                  rows={3}
                  placeholder="Ingrese la descripción del proyecto"
                  required
                  disabled={!apiService.isAuthenticated() || loading}
                ></textarea>
              </div>
              
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Categoría
                </label>
                <input
                  type="text"
                  value={newProyecto.categoria}
                  onChange={(e) => setNewProyecto({...newProyecto, categoria: e.target.value})}
                  className="proyectos-form-input"
                  placeholder="Categoría del proyecto"
                  disabled={!apiService.isAuthenticated() || loading}
                />
              </div>
              
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={newProyecto.email}
                  onChange={(e) => setNewProyecto({...newProyecto, email: e.target.value})}
                  className="proyectos-form-input"
                  placeholder="correo@ejemplo.com"
                  disabled={!apiService.isAuthenticated() || loading}
                />
              </div>
              
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Número de Cédula
                </label>
                <input
                  type="text"
                  value={newProyecto.cedula}
                  onChange={(e) => setNewProyecto({...newProyecto, cedula: e.target.value})}
                  className="proyectos-form-input"
                  placeholder="1234567890"
                  disabled={!apiService.isAuthenticated() || loading}
                />
              </div>
              
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Número de Teléfono
                </label>
                <input
                  type="tel"
                  value={newProyecto.telefono}
                  onChange={(e) => setNewProyecto({...newProyecto, telefono: e.target.value})}
                  className="proyectos-form-input"
                  placeholder="0987654321"
                  disabled={!apiService.isAuthenticated() || loading}
                />
              </div>
              
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Dirección
                </label>
                <textarea
                  value={newProyecto.address}
                  onChange={(e) => setNewProyecto({...newProyecto, address: e.target.value})}
                  className="proyectos-form-textarea"
                  rows={2}
                  placeholder="Ingrese la dirección completa"
                  disabled={!apiService.isAuthenticated() || loading}
                ></textarea>
              </div>
              
              <div className="proyectos-modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProyecto(null);
                    setNewProyecto({
                      nombre: '',
                      descripcion: '',
                      responsable: '',
                      presupuesto: '',
                      categoria: '',
                      email: '',
                      cedula: '',
                      telefono: '',
                      address: ''
                    });
                  }}
                  className="proyectos-cancel-button"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="proyectos-submit-button"
                  disabled={loading || !apiService.isAuthenticated()}
                >
                  {loading ? 'Actualizando...' : 'Actualizar Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Debug info en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs max-w-xs">
          <p>Debug Info:</p>
          <p>Auth: {apiService.isAuthenticated() ? '✅' : '❌'}</p>
          <p>Token: {apiService.getCurrentToken() ? '✅' : '❌'}</p>
          <p>Expired: {apiService.isTokenExpired() ? '❌' : '✅'}</p>
          <p>Proyectos: {proyectos.length}</p>
          <p>Render Error: {renderError ? '❌' : '✅'}</p>
          {renderError && <p className="text-red-300 text-xs">Error: {renderError}</p>}
        </div>
      )}
    </div>
  );
};

export default Proyectos;