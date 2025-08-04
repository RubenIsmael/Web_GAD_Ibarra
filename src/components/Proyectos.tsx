import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Search, Filter, Calendar, User, TrendingUp, Eye, Edit, Trash2, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ApiService } from './login/ApiService'; 
import '../styles/proyectos.css';

// *** CREAR INSTANCIA DEL SERVICIO ***
const apiService = new ApiService();

// Interfaces actualizadas basadas en la API
interface ProyectoAPI {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'en-progreso' | 'completado';
  fechaEnvio: string;
  responsable: string;
  presupuesto?: number;
  categoria?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

// *** ELIMINAR PaginatedResponse SI NO SE USA O UTILIZARLA ***
interface PaginatedResponse {
  content: ProyectoAPI[];
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

interface ProyectoStats {
  totalProyectos: number;
  pendientes: number;
  aprobados: number;
  presupuestoTotal: string;
}

const Proyectos: React.FC = () => {
  // Estados para datos
  const [proyectos, setProyectos] = useState<ProyectoAPI[]>([]);
  const [stats, setStats] = useState<ProyectoStats>({
    totalProyectos: 0,
    pendientes: 0,
    aprobados: 0,
    presupuestoTotal: '$0'
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
  
  // Estados para nuevo proyecto
  const [newProyecto, setNewProyecto] = useState({
    nombre: '',
    descripcion: '',
    responsable: '',
    presupuesto: '',
    categoria: ''
  });

  // *** FUNCIÓN MEJORADA PARA VERIFICAR TOKEN ***
  const verificarToken = (): boolean => {
    console.log('🔍 Verificando estado de autenticación...');
    console.log('🔑 Token actual:', apiService.getCurrentToken()?.substring(0, 50) + '...');
    console.log('✅ ¿Está autenticado?:', apiService.isAuthenticated());
    
    if (!apiService.isAuthenticated()) {
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

  // *** CARGAR PROYECTOS CON VERIFICACIÓN DE TOKEN UNIFICADA ***
  const loadProyectos = async (page: number = currentPage, size: number = pageSize, status: string = filterStatus) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🚀 Iniciando carga de proyectos...');
      
      // *** VERIFICAR TOKEN ANTES DE HACER LA PETICIÓN ***
      if (!verificarToken()) {
        setLoading(false);
        return;
      }
      
      console.log('📊 Parámetros de consulta:', { page, size, status, searchTerm });
      
      // *** USAR MÉTODO ESPECÍFICO PARA PROYECTOS PENDIENTES ***
      let response: { success: boolean; data?: PaginatedResponse; error?: string; message?: string; status?: number };
      
      if (status === 'all' || status === 'pendiente') {
        console.log('🔍 Usando endpoint de proyectos pendientes...');
        response = await apiService.getProyectosPendientes(page, size);
      } else {
        console.log('🔍 Usando endpoint general de proyectos...');
        response = await apiService.getProyectos(page, size, status, searchTerm);
      }
      
      console.log('📡 Respuesta de la API:', response);
      
      if (response.success && response.data) {
        console.log('✅ Proyectos cargados exitosamente');
        console.log('📋 Cantidad de proyectos:', response.data.content.length);
        
        setProyectos(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
        setCurrentPage(response.data.pageable.pageNumber);
        
        // Calcular estadísticas
        calculateStats(response.data.content, response.data.totalElements);
        
      } else {
        console.error('❌ Error en respuesta:', response.error || response.message);
        
        // *** MANEJAR ERRORES DE AUTENTICACIÓN ESPECÍFICAMENTE ***
        if (response.status === 401) {
          setError('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
          apiService.clearToken();
        } else if (response.status === 403) {
          setError('No tiene permisos para ver los proyectos. Contacte al administrador.');
        } else {
          setError(response.error || response.message || 'Error al cargar proyectos');
        }
        setProyectos([]);
      }
    } catch (err) {
      console.error('💥 Error de conexión al cargar proyectos:', err);
      setError('Error de conexión al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calculateStats = (proyectosList: ProyectoAPI[], total: number) => {
    const pendientes = proyectosList.filter(p => p.estado === 'pendiente').length;
    const aprobados = proyectosList.filter(p => p.estado === 'aprobado').length;
    const presupuestoTotal = proyectosList.reduce((sum, p) => sum + (p.presupuesto || 0), 0);
    
    setStats({
      totalProyectos: total,
      pendientes,
      aprobados,
      presupuestoTotal: `$${presupuestoTotal.toLocaleString()}`
    });
  };

  // *** APROBAR PROYECTO CON VERIFICACIÓN UNIFICADA ***
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
        alert('Proyecto aprobado exitosamente');
      } else {
        console.error('❌ Error al aprobar:', response.error);
        if (response.status === 401 || response.status === 403) {
          alert('No tiene permisos para aprobar proyectos');
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

  // *** RECHAZAR PROYECTO CON VERIFICACIÓN UNIFICADA ***
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
        alert('Proyecto rechazado exitosamente');
      } else {
        console.error('❌ Error al rechazar:', response.error);
        if (response.status === 401 || response.status === 403) {
          alert('No tiene permisos para rechazar proyectos');
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

  // *** CREAR PROYECTO CON VERIFICACIÓN UNIFICADA ***
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
        categoria: newProyecto.categoria.trim() || undefined
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
          categoria: ''
        });
        await loadProyectos();
        alert('Proyecto creado exitosamente');
      } else {
        console.error('❌ Error al crear:', response.error);
        alert(response.error || 'Error al crear proyecto');
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
      loadProyectos(newPage, pageSize, filterStatus);
    }
  };

  // Cambiar tamaño de página
  const changePageSize = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
    loadProyectos(0, newSize, filterStatus);
  };

  // Filtrar por estado
  const handleFilterChange = (newFilter: string) => {
    setFilterStatus(newFilter);
    setCurrentPage(0);
    loadProyectos(0, pageSize, newFilter);
  };

  // Buscar proyectos
  const handleSearch = () => {
    setCurrentPage(0);
    loadProyectos(0, pageSize, filterStatus);
  };

  // *** EFECTO INICIAL CON DEBUGGING ***
  useEffect(() => {
    console.log('🚀 Iniciando componente Proyectos...');
    console.log('🔍 Estado inicial del token:', {
      isAuthenticated: apiService.isAuthenticated(),
      currentToken: apiService.getCurrentToken()?.substring(0, 50) + '...',
      isExpired: apiService.isTokenExpired()
    });
    
    // Verificar si hay token al cargar el componente
    if (!verificarToken()) {
      console.error('❌ No hay token válido, no se cargarán los proyectos');
      return;
    }
    
    // Si hay token, cargar proyectos
    loadProyectos();
  }, []);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    if (!apiService.isAuthenticated()) return;
    
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== '') {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'aprobado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      case 'en-progreso': return 'bg-blue-100 text-blue-800';
      case 'completado': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
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

      {/* *** MENSAJE DE ERROR MEJORADO *** */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
            {error.includes('sesión') && (
              <button 
                onClick={() => {
                  console.log('🔄 Recargando página...');
                  window.location.reload();
                }} 
                className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Recargar página
              </button>
            )}
          </div>
          {/* Debug info solo en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-red-600">
              <p>Debug: Token presente: {apiService.isAuthenticated() ? 'SÍ' : 'NO'}</p>
              <p>Debug: Token expirado: {apiService.isTokenExpired() ? 'SÍ' : 'NO'}</p>
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
              <p className="proyectos-stat-text-sm">Presupuesto Total</p>
              <p className="proyectos-stat-text-lg">{stats.presupuestoTotal}</p>
            </div>
            <div className="proyectos-stat-icon-container bg-red-100">
              <TrendingUp className="proyectos-stat-icon text-red-600" />
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
              placeholder="Buscar proyectos por nombre o responsable..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="proyectos-search-input"
              disabled={!apiService.isAuthenticated()}
            />
          </div>

          <div className="proyectos-filters-actions">
            <div className="proyectos-filter-group">
              <Filter className="proyectos-filter-icon" />
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="proyectos-filter-select"
                disabled={!apiService.isAuthenticated()}
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
                disabled={!apiService.isAuthenticated()}
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

      {/* Indicador de carga */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-2 text-gray-600">Cargando...</span>
        </div>
      )}

      {/* Lista de proyectos */}
      <div className="proyectos-grid">
        {!loading && proyectos.map((proyecto) => (
          <div key={proyecto.id} className="proyectos-card">
            <div className="proyectos-card-header">
              <div className="proyectos-card-title-group">
                <div className="proyectos-card-icon">
                  <FolderOpen />
                </div>
                <div>
                  <h3 className="proyectos-card-name">{proyecto.nombre}</h3>
                  <p className="proyectos-card-category">{proyecto.categoria || 'Sin categoría'}</p>
                </div>
              </div>
              <span className={`proyectos-card-status ${getStatusColor(proyecto.estado)}`}>
                {proyecto.estado.charAt(0).toUpperCase() + proyecto.estado.slice(1)}
              </span>
            </div>

            <p className="proyectos-card-description">{proyecto.descripcion}</p>

            <div className="proyectos-details-grid">
              <div>
                <p className="proyectos-detail-label">Responsable</p>
                <p className="proyectos-detail-value">
                  <User className="proyectos-detail-icon" />
                  {proyecto.responsable}
                </p>
              </div>
              <div>
                <p className="proyectos-detail-label">Presupuesto</p>
                <p className="proyectos-detail-value">
                  {proyecto.presupuesto ? `${proyecto.presupuesto.toLocaleString()}` : 'No especificado'}
                </p>
              </div>
              <div>
                <p className="proyectos-detail-label">Fecha de Envío</p>
                <p className="proyectos-detail-value">
                  <Calendar className="proyectos-detail-icon" />
                  {formatDate(proyecto.fechaEnvio)}
                </p>
              </div>
              <div>
                <p className="proyectos-detail-label">ID</p>
                <p className="proyectos-detail-value">#{proyecto.id}</p>
              </div>
            </div>

            <div className="proyectos-card-footer">
              {proyecto.estado === 'pendiente' ? (
                <>
                  <button 
                    onClick={() => aprobarProyecto(proyecto.id)}
                    className="proyectos-action-button bg-green-600 hover:bg-green-700 text-white"
                    disabled={loading || !apiService.isAuthenticated()}
                  >
                    <Check className="w-4 h-4" />
                    <span>Aprobar</span>
                  </button>
                  <button 
                    onClick={() => rechazarProyecto(proyecto.id)}
                    className="proyectos-action-button bg-red-600 hover:bg-red-700 text-white"
                    disabled={loading || !apiService.isAuthenticated()}
                  >
                    <X className="w-4 h-4" />
                    <span>Rechazar</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="proyectos-action-button proyectos-view-button">
                    <Eye className="w-4 h-4" />
                    <span>Ver</span>
                  </button>
                  <button className="proyectos-action-button proyectos-edit-button">
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button className="proyectos-action-button proyectos-delete-button">
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje cuando no hay proyectos */}
      {!loading && proyectos.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proyectos</h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'No se encontraron proyectos con los filtros aplicados'
              : error.includes('permisos') 
                ? 'No tiene permisos para ver los proyectos'
                : 'Aún no hay proyectos registrados'
            }
          </p>
        </div>
      )}

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div className="proyectos-pagination">
          <div className="proyectos-pagination-info">
            <span className="text-sm text-gray-700">
              Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, totalElements)} de {totalElements} proyectos
            </span>
          </div>
          
          <div className="proyectos-pagination-controls">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 0 || !apiService.isAuthenticated()}
              className="proyectos-pagination-button"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <div className="proyectos-pagination-numbers">
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
                    disabled={!apiService.isAuthenticated()}
                    className={`proyectos-pagination-number ${
                      currentPage === pageNum ? 'active' : ''
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || !apiService.isAuthenticated()}
              className="proyectos-pagination-button"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
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
                  disabled={!apiService.isAuthenticated()}
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
                  disabled={!apiService.isAuthenticated()}
                ></textarea>
              </div>
              
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Responsable
                </label>
                <input
                  type="text"
                  value={newProyecto.responsable}
                  onChange={(e) => setNewProyecto({...newProyecto, responsable: e.target.value})}
                  className="proyectos-form-input"
                  placeholder="Nombre del responsable"
                  disabled={!apiService.isAuthenticated()}
                />
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
                  disabled={!apiService.isAuthenticated()}
                />
              </div>
              
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Presupuesto
                </label>
                <input
                  type="number"
                  value={newProyecto.presupuesto}
                  onChange={(e) => setNewProyecto({...newProyecto, presupuesto: e.target.value})}
                  className="proyectos-form-input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={!apiService.isAuthenticated()}
                />
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
    </div>
  );
};

export default Proyectos;