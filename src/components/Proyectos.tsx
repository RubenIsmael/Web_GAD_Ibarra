import React, { useState } from 'react';
import { FolderOpen, Plus, Search, Filter, Calendar, User, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import '../styles/proyectos.css';

const Proyectos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const proyectos = [
    {
      id: 1,
      nombre: 'Centro Comercial Norte',
      descripcion: 'Desarrollo de complejo comercial en zona norte de la ciudad',
      responsable: 'Arq. Luis Moreno',
      fechaInicio: '2025-01-10',
      fechaFin: '2025-06-15',
      estado: 'en-progreso',
      progreso: 35,
      presupuesto: '$250,000',
      categoria: 'comercial'
    },
    {
      id: 2,
      nombre: 'Mercado Municipal',
      descripcion: 'Renovación y modernización del mercado central',
      responsable: 'Ing. Carmen Silva',
      fechaInicio: '2024-11-20',
      fechaFin: '2025-03-30',
      estado: 'completado',
      progreso: 100,
      presupuesto: '$180,000',
      categoria: 'infraestructura'
    },
    {
      id: 3,
      nombre: 'Parque Emprendedor',
      descripcion: 'Espacio dedicado a ferias y eventos de emprendimiento',
      responsable: 'Arq. Pedro Vargas',
      fechaInicio: '2025-02-01',
      fechaFin: '2025-08-20',
      estado: 'planificacion',
      progreso: 15,
      presupuesto: '$320,000',
      categoria: 'desarrollo'
    }
  ];

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'planificacion': return 'bg-yellow-100 text-yellow-800';
      case 'en-progreso': return 'bg-blue-100 text-blue-800';
      case 'completado': return 'bg-green-100 text-green-800';
      case 'pausado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progreso: number) => {
    if (progreso < 30) return 'bg-red-500';
    if (progreso < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filteredProyectos = proyectos.filter(proyecto => {
    const matchesSearch = proyecto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.responsable.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || proyecto.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="proyectos-container">
      <div className="proyectos-header">
        <h1 className="proyectos-title">
          <FolderOpen className="w-8 h-8 text-red-600 mr-3" />
          Proyectos
        </h1>
        <p className="proyectos-subtitle">
          Gestión y seguimiento de proyectos municipales
        </p>
      </div>

      {/* Estadísticas */}
      <div className="proyectos-stats-grid">
        <div className="proyectos-stat-card">
          <div className="proyectos-stat-content">
            <div>
              <p className="proyectos-stat-text-sm">Total Proyectos</p>
              <p className="proyectos-stat-text-lg">12</p>
            </div>
            <div className="proyectos-stat-icon-container bg-blue-100">
              <FolderOpen className="proyectos-stat-icon text-blue-600" />
            </div>
          </div>
        </div>
        <div className="proyectos-stat-card">
          <div className="proyectos-stat-content">
            <div>
              <p className="proyectos-stat-text-sm">En Progreso</p>
              <p className="proyectos-stat-text-lg">8</p>
            </div>
            <div className="proyectos-stat-icon-container bg-yellow-100">
              <TrendingUp className="proyectos-stat-icon text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="proyectos-stat-card">
          <div className="proyectos-stat-content">
            <div>
              <p className="proyectos-stat-text-sm">Completados</p>
              <p className="proyectos-stat-text-lg">3</p>
            </div>
            <div className="proyectos-stat-icon-container bg-green-100">
              <Calendar className="proyectos-stat-icon text-green-600" />
            </div>
          </div>
        </div>
        <div className="proyectos-stat-card">
          <div className="proyectos-stat-content">
            <div>
              <p className="proyectos-stat-text-sm">Presupuesto Total</p>
              <p className="proyectos-stat-text-lg">$2.5M</p>
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
              placeholder="Buscar proyectos..."
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
                onChange={(e) => setFilterStatus(e.target.value)}
                className="proyectos-filter-select"
              >
                <option value="all">Todos los estados</option>
                <option value="planificacion">Planificación</option>
                <option value="en-progreso">En Progreso</option>
                <option value="completado">Completado</option>
                <option value="pausado">Pausado</option>
              </select>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="proyectos-add-button"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Proyecto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de proyectos */}
      <div className="proyectos-grid">
        {filteredProyectos.map((proyecto) => (
          <div key={proyecto.id} className="proyectos-card">
            <div className="proyectos-card-header">
              <div className="proyectos-card-title-group">
                <div className="proyectos-card-icon">
                  <FolderOpen />
                </div>
                <div>
                  <h3 className="proyectos-card-name">{proyecto.nombre}</h3>
                  <p className="proyectos-card-category">{proyecto.categoria}</p>
                </div>
              </div>
              <span className={`proyectos-card-status ${getStatusColor(proyecto.estado)}`}>
                {proyecto.estado.replace('-', ' ').charAt(0).toUpperCase() + proyecto.estado.slice(1)}
              </span>
            </div>

            <p className="proyectos-card-description">{proyecto.descripcion}</p>

            <div className="proyectos-progress-container">
              <div className="proyectos-progress-header">
                <span className="proyectos-progress-text">Progreso</span>
                <span className="proyectos-progress-value">{proyecto.progreso}%</span>
              </div>
              <div className="proyectos-progress-bar">
                <div
                  className={`proyectos-progress-bar-fill ${getProgressColor(proyecto.progreso)}`}
                  style={{ width: `${proyecto.progreso}%` }}
                ></div>
              </div>
            </div>

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
                <p className="proyectos-detail-value">{proyecto.presupuesto}</p>
              </div>
              <div>
                <p className="proyectos-detail-label">Inicio</p>
                <p className="proyectos-detail-value">{proyecto.fechaInicio}</p>
              </div>
              <div>
                <p className="proyectos-detail-label">Fin</p>
                <p className="proyectos-detail-value">{proyecto.fechaFin}</p>
              </div>
            </div>

            <div className="proyectos-card-footer">
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
            </div>
          </div>
        ))}
      </div>

      {/* Modal para nuevo proyecto */}
      {showModal && (
        <div className="proyectos-modal-overlay">
          <div className="proyectos-modal">
            <h2 className="proyectos-modal-title">Nuevo Proyecto</h2>
            <form className="proyectos-modal-form">
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  className="proyectos-form-input"
                  placeholder="Ingrese el nombre"
                />
              </div>
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Descripción
                </label>
                <textarea
                  className="proyectos-form-textarea"
                  rows={3}
                  placeholder="Ingrese la descripción"
                ></textarea>
              </div>
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Responsable
                </label>
                <input
                  type="text"
                  className="proyectos-form-input"
                  placeholder="Nombre del responsable"
                />
              </div>
              <div className="proyectos-form-group">
                <label className="proyectos-form-label">
                  Presupuesto
                </label>
                <input
                  type="text"
                  className="proyectos-form-input"
                  placeholder="$0.00"
                />
              </div>
              <div className="proyectos-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="proyectos-cancel-button"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="proyectos-submit-button"
                >
                  Crear Proyecto
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