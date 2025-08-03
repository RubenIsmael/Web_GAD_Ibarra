import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Search, Filter, Calendar, User, TrendingUp, Eye, Edit, Trash2, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../services/api';
import '../styles/proyectos.css';

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

  // Cargar proyectos desde la API
  const loadProyectos = async (page: number = currentPage, size: number = pageSize, status: string = filterStatus) => {
    try {
      setLoading(true);
      setError('');
      
      // Construir parámetros de consulta
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      
      // Agregar filtro de estado si no es 'all'
      if (status !== 'all') {
        params.append('estado', status);
      }
      
      // Agregar búsqueda si existe
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      const endpoint = `/admin/pending?${params.toString()}`;
      const response = await apiService.get<PaginatedResponse>(endpoint);
      
      if (response.success && response.data) {
        setProyectos(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
        setCurrentPage(response.data.pageable.pageNumber);
        
        // Calcular estadísticas
        calculateStats(response.data.content, response.data.totalElements);
      } else {
        setError(response.error || 'Error al cargar proyectos');
        setProyectos([]);
      }
    } catch (err) {
      setError('Error de conexión al cargar proyectos');
      console.error('Error loading proyectos:', err);
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

  // Aprobar proyecto
  const aprobarProyecto = async (userId: string) => {
    try {
      setLoading(true);
      const response = await apiService.post(`/admin/approve/${userId}`, {});
      
      if (response.success) {
        // Recargar lista
        await loadProyectos();
        alert('Proyecto aprobado exitosamente');
      } else {
        alert(response.error || 'Error al aprobar proyecto');
      }
    } catch (err) {
      alert('Error de conexión al aprobar proyecto');
      console.error('Error approving proyecto:', err);
    } finally {
      setLoading(false);
    }
  };

  // Rechazar proyecto
  const rechazarProyecto = async (userId: string) => {
    try {
      setLoading(true);
      const response = await apiService.delete(`/admin/reject/${userId}`);
      
      if (response.success) {
        // Recargar lista
        await loadProyectos();
        alert('Proyecto rechazado exitosamente');
      } else {
        alert(response.error || 'Error al rechazar proyecto');
      }
    } catch (err) {
      alert('Error de conexión al rechazar proyecto');
      console.error('Error rejecting proyecto:', err);
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo proyecto
  const crearProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProyecto.nombre.trim() || !newProyecto.descripcion.trim()) {
      alert('Nombre y descripción son requeridos');
      return;
    }
    
    try {
      setLoading(true);
      const proyectoData = {
        nombre: newProyecto.nombre.trim(),
        descripcion: newProyecto.descripcion.trim(),
        responsable: newProyecto.responsable.trim(),
        presupuesto: newProyecto.presupuesto ? parseFloat(newProyecto.presupuesto) : undefined,
        categoria: newProyecto.categoria.trim() || undefined
      };
      
      const response = await apiService.post('/api/proyectos', proyectoData);
      
      if (response.success) {
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
        alert(response.error || 'Error al crear proyecto');
      }
    } catch (err) {
      alert('Error de conexión al crear proyecto');
      console.error('Error creating proyecto:', err);
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

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadProyectos();
  }, []);

  // Efecto para búsqueda con debounce
  useEffect(() => {
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

      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
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
            />
          </div>

          <div className="proyectos-filters-actions">
            <div className="proyectos-filter-group">
              <Filter className="proyectos-filter-icon" />
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="proyectos-filter-select"
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
              disabled={loading}
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
                  {proyecto.presupuesto ? `$${proyecto.presupuesto.toLocaleString()}` : 'No especificado'}
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
                    disabled={loading}
                  >
                    <Check className="w-4 h-4" />
                    <span>Aprobar</span>
                  </button>
                  <button 
                    onClick={() => rechazarProyecto(proyecto.id)}
                    className="proyectos-action-button bg-red-600 hover:bg-red-700 text-white"
                    disabled={loading}
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
              disabled={currentPage === 0}
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
              disabled={currentPage >= totalPages - 1}
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
                  disabled={loading}
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