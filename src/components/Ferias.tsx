import React, { useState } from 'react';
import { Calendar, Plus, Search, Filter, MapPin, Clock, Users, Eye, Edit, Trash2 } from 'lucide-react';
import '../styles/ferias.css';


const Ferias: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const ferias = [
    {
      id: 1,
      nombre: 'Feria de Emprendimientos',
      descripcion: 'Espacio para promocionar emprendimientos locales',
      fecha: '2025-02-15',
      hora: '08:00 - 18:00',
      lugar: 'Parque Pedro Moncayo',
      participantes: 45,
      estado: 'programada',
      categoria: 'emprendimiento',
      organizador: 'Dpto. Desarrollo Económico'
    },
    {
      id: 2,
      nombre: 'Feria Gastronómica',
      descripcion: 'Muestra de gastronomía tradicional ibarreña',
      fecha: '2025-01-20',
      hora: '10:00 - 20:00',
      lugar: 'Plaza San Francisco',
      participantes: 28,
      estado: 'activa',
      categoria: 'gastronomia',
      organizador: 'Turismo Municipal'
    },
    {
      id: 3,
      nombre: 'Feria de Artesanías',
      descripcion: 'Exposición y venta de productos artesanales',
      fecha: '2025-01-10',
      hora: '09:00 - 17:00',
      lugar: 'Mercado Central',
      participantes: 62,
      estado: 'finalizada',
      categoria: 'artesanias',
      organizador: 'Cultura y Patrimonio'
    }
  ];

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'programada': return 'bg-blue-100 text-blue-800';
      case 'activa': return 'bg-green-100 text-green-800';
      case 'finalizada': return 'bg-gray-100 text-gray-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'emprendimiento': return 'bg-purple-100 text-purple-800';
      case 'gastronomia': return 'bg-orange-100 text-orange-800';
      case 'artesanias': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFerias = ferias.filter(feria => {
    const matchesSearch = feria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feria.lugar.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || feria.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="ferias-container">
      <div className="ferias-header">
        <h1 className="ferias-title">
          <Calendar className="w-8 h-8 text-red-600 mr-3" />
          Ferias
        </h1>
        <p className="ferias-subtitle">
          Gestión de ferias y eventos comerciales
        </p>
      </div>

      {/* Estadísticas */}
      <div className="ferias-stats-grid">
        <div className="ferias-stat-card">
          <div className="ferias-stat-content">
            <div>
              <p className="ferias-stat-text-sm">Total Ferias</p>
              <p className="ferias-stat-text-lg">15</p>
            </div>
            <div className="ferias-stat-icon-container bg-blue-100">
              <Calendar className="ferias-stat-icon text-blue-600" />
            </div>
          </div>
        </div>
        <div className="ferias-stat-card">
          <div className="ferias-stat-content">
            <div>
              <p className="ferias-stat-text-sm">Activas</p>
              <p className="ferias-stat-text-lg">3</p>
            </div>
            <div className="ferias-stat-icon-container bg-green-100">
              <Calendar className="ferias-stat-icon text-green-600" />
            </div>
          </div>
        </div>
        <div className="ferias-stat-card">
          <div className="ferias-stat-content">
            <div>
              <p className="ferias-stat-text-sm">Participantes</p>
              <p className="ferias-stat-text-lg">1,247</p>
            </div>
            <div className="ferias-stat-icon-container bg-purple-100">
              <Users className="ferias-stat-icon text-purple-600" />
            </div>
          </div>
        </div>
        <div className="ferias-stat-card">
          <div className="ferias-stat-content">
            <div>
              <p className="ferias-stat-text-sm">Este Mes</p>
              <p className="ferias-stat-text-lg">5</p>
            </div>
            <div className="ferias-stat-icon-container bg-orange-100">
              <Calendar className="ferias-stat-icon text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="ferias-filters">
        <div className="ferias-filters-container">
          <div className="ferias-search-container">
            <Search className="ferias-search-icon" />
            <input
              type="text"
              placeholder="Buscar ferias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ferias-search-input"
            />
          </div>

          <div className="ferias-filters-actions">
            <div className="ferias-filter-group">
              <Filter className="ferias-filter-icon" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="ferias-filter-select"
              >
                <option value="all">Todos los estados</option>
                <option value="programada">Programada</option>
                <option value="activa">Activa</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="ferias-add-button"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Feria</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de ferias */}
      <div className="ferias-grid">
        {filteredFerias.map((feria) => (
          <div key={feria.id} className="ferias-card">
            <div className="ferias-card-header">
              <div className="ferias-card-title-group">
                <div className="ferias-card-icon">
                  <Calendar />
                </div>
                <div>
                  <h3 className="ferias-card-name">{feria.nombre}</h3>
                  <p className="ferias-card-organizer">{feria.organizador}</p>
                </div>
              </div>
              <div className="ferias-card-status-group">
                <span className={`ferias-card-badge ${getCategoryColor(feria.categoria)}`}>
                  {feria.categoria}
                </span>
                <span className={`ferias-card-badge ${getStatusColor(feria.estado)}`}>
                  {feria.estado}
                </span>
              </div>
            </div>

            <p className="ferias-card-description">{feria.descripcion}</p>

            <div className="ferias-details-grid">
              <div className="ferias-detail-item">
                <Calendar className="ferias-detail-icon" />
                <div>
                  <p className="ferias-detail-label">Fecha</p>
                  <p className="ferias-detail-value">{feria.fecha}</p>
                </div>
              </div>
              <div className="ferias-detail-item">
                <Clock className="ferias-detail-icon" />
                <div>
                  <p className="ferias-detail-label">Horario</p>
                  <p className="ferias-detail-value">{feria.hora}</p>
                </div>
              </div>
              <div className="ferias-detail-item">
                <MapPin className="ferias-detail-icon" />
                <div>
                  <p className="ferias-detail-label">Lugar</p>
                  <p className="ferias-detail-value">{feria.lugar}</p>
                </div>
              </div>
              <div className="ferias-detail-item">
                <Users className="ferias-detail-icon" />
                <div>
                  <p className="ferias-detail-label">Participantes</p>
                  <p className="ferias-detail-value">{feria.participantes}</p>
                </div>
              </div>
            </div>

            <div className="ferias-card-footer">
              <button className="ferias-action-button ferias-view-button">
                <Eye className="w-4 h-4" />
                <span>Ver</span>
              </button>
              <button className="ferias-action-button ferias-edit-button">
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button className="ferias-action-button ferias-delete-button">
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para nueva feria */}
      {showModal && (
        <div className="ferias-modal-overlay">
          <div className="ferias-modal">
            <h2 className="ferias-modal-title">Nueva Feria</h2>
            <form className="ferias-modal-form">
              <div className="ferias-form-group">
                <label className="ferias-form-label">
                  Nombre de la Feria
                </label>
                <input
                  type="text"
                  className="ferias-form-input"
                  placeholder="Ingrese el nombre"
                />
              </div>
              <div className="ferias-form-group">
                <label className="ferias-form-label">
                  Descripción
                </label>
                <textarea
                  className="ferias-form-textarea"
                  rows={3}
                  placeholder="Ingrese la descripción"
                ></textarea>
              </div>
              <div className="ferias-form-group">
                <label className="ferias-form-label">
                  Fecha
                </label>
                <input
                  type="date"
                  className="ferias-form-input"
                />
              </div>
              <div className="ferias-form-group">
                <label className="ferias-form-label">
                  Lugar
                </label>
                <input
                  type="text"
                  className="ferias-form-input"
                  placeholder="Lugar del evento"
                />
              </div>
              <div className="ferias-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="ferias-cancel-button"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="ferias-submit-button"
                >
                  Crear Feria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ferias;