import React, { useState } from 'react';
import { Store, Plus, Search, Filter, MapPin, Phone, Mail, Eye, Edit, Trash2, Building, User, Calendar } from 'lucide-react';
import '../styles/localesComerciales.css';

const LocalesComerciales: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const locales = [
    {
      id: 1,
      nombre: 'Restaurant El Buen Sabor',
      propietario: 'María González',
      tipo: 'restaurant',
      direccion: 'Calle Sucre 123, Centro',
      telefono: '0987654321',
      email: 'maria@buensabor.com',
      licencia: 'LIC-2025-001',
      fechaRegistro: '2025-01-15',
      estado: 'activo',
      categoria: 'gastronomia'
    },
    {
      id: 2,
      nombre: 'Tienda La Esquina',
      propietario: 'Carlos Rodríguez',
      tipo: 'tienda',
      direccion: 'Av. Pérez Guerrero 456',
      telefono: '0998765432',
      email: 'carlos@laesquina.com',
      licencia: 'LIC-2025-002',
      fechaRegistro: '2025-01-10',
      estado: 'pendiente',
      categoria: 'comercio'
    },
    {
      id: 3,
      nombre: 'Farmacia San Juan',
      propietario: 'Ana Pérez',
      tipo: 'farmacia',
      direccion: 'Calle Bolívar 789',
      telefono: '0976543210',
      email: 'ana@farmaciasanjuan.com',
      licencia: 'LIC-2025-003',
      fechaRegistro: '2025-01-05',
      estado: 'inactivo',
      categoria: 'salud'
    }
  ];

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'inactivo': return 'bg-red-100 text-red-800';
      case 'suspendido': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'gastronomia': return 'bg-orange-100 text-orange-800';
      case 'comercio': return 'bg-blue-100 text-blue-800';
      case 'salud': return 'bg-purple-100 text-purple-800';
      case 'servicios': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLocales = locales.filter(local => {
    const matchesSearch = local.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      local.propietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      local.direccion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || local.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="locales-container">
      <div className="locales-header">
        <h1 className="locales-title">
          <Store className="w-8 h-8 text-red-600 mr-3" />
          Locales Comerciales
        </h1>
        <p className="locales-subtitle">
          Registro y gestión de establecimientos comerciales
        </p>
      </div>

      {/* Estadísticas */}
      <div className="locales-stats-grid">
        <div className="locales-stat-card">
          <div className="locales-stat-content">
            <div>
              <p className="locales-stat-text-sm">Total Locales</p>
              <p className="locales-stat-text-lg">1,247</p>
            </div>
            <div className="locales-stat-icon-container bg-blue-100">
              <Store className="locales-stat-icon text-blue-600" />
            </div>
          </div>
        </div>
        <div className="locales-stat-card">
          <div className="locales-stat-content">
            <div>
              <p className="locales-stat-text-sm">Activos</p>
              <p className="locales-stat-text-lg">1,089</p>
            </div>
            <div className="locales-stat-icon-container bg-green-100">
              <Building className="locales-stat-icon text-green-600" />
            </div>
          </div>
        </div>
        <div className="locales-stat-card">
          <div className="locales-stat-content">
            <div>
              <p className="locales-stat-text-sm">Pendientes</p>
              <p className="locales-stat-text-lg">89</p>
            </div>
            <div className="locales-stat-icon-container bg-yellow-100">
              <Calendar className="locales-stat-icon text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="locales-stat-card">
          <div className="locales-stat-content">
            <div>
              <p className="locales-stat-text-sm">Nuevos (Este Mes)</p>
              <p className="locales-stat-text-lg">23</p>
            </div>
            <div className="locales-stat-icon-container bg-purple-100">
              <Plus className="locales-stat-icon text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="locales-filters">
        <div className="locales-filters-container">
          <div className="locales-search-container">
            <Search className="locales-search-icon" />
            <input
              type="text"
              placeholder="Buscar locales comerciales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="locales-search-input"
            />
          </div>

          <div className="locales-filters-actions">
            <div className="locales-filter-group">
              <Filter className="locales-filter-icon" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="locales-filter-select"
              >
                <option value="all">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="pendiente">Pendiente</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="locales-add-button"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Local</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de locales */}
      <div className="locales-list">
        {filteredLocales.map((local) => (
          <div key={local.id} className="locales-card">
            <div className="locales-card-content">
              <div className="locales-card-main">
                <div className="locales-card-header">
                  <div className="locales-card-icon">
                    <Store />
                  </div>
                  <div className="locales-card-info">
                    <div className="locales-card-title">
                      <h3 className="locales-card-name">{local.nombre}</h3>
                      <span className={`locales-card-badge ${getCategoryColor(local.categoria)}`}>
                        {local.categoria}
                      </span>
                      <span className={`locales-card-badge ${getStatusColor(local.estado)}`}>
                        {local.estado}
                      </span>
                    </div>
                    <p className="locales-card-license">Licencia: {local.licencia}</p>
                  </div>
                </div>

                <div className="locales-details-grid">
                  <div className="locales-detail-item">
                    <User className="locales-detail-icon" />
                    <div>
                      <p className="locales-detail-label">Propietario</p>
                      <p className="locales-detail-value">{local.propietario}</p>
                    </div>
                  </div>
                  <div className="locales-detail-item">
                    <MapPin className="locales-detail-icon" />
                    <div>
                      <p className="locales-detail-label">Dirección</p>
                      <p className="locales-detail-value">{local.direccion}</p>
                    </div>
                  </div>
                  <div className="locales-detail-item">
                    <Phone className="locales-detail-icon" />
                    <div>
                      <p className="locales-detail-label">Teléfono</p>
                      <p className="locales-detail-value">{local.telefono}</p>
                    </div>
                  </div>
                  <div className="locales-detail-item">
                    <Mail className="locales-detail-icon" />
                    <div>
                      <p className="locales-detail-label">Email</p>
                      <p className="locales-detail-value">{local.email}</p>
                    </div>
                  </div>
                  <div className="locales-detail-item">
                    <Building className="locales-detail-icon" />
                    <div>
                      <p className="locales-detail-label">Tipo</p>
                      <p className="locales-detail-value">{local.tipo}</p>
                    </div>
                  </div>
                  <div className="locales-detail-item">
                    <Calendar className="locales-detail-icon" />
                    <div>
                      <p className="locales-detail-label">Registro</p>
                      <p className="locales-detail-value">{local.fechaRegistro}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="locales-card-actions">
                <button className="locales-action-button locales-view-button">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="locales-action-button locales-edit-button">
                  <Edit className="w-5 h-5" />
                </button>
                <button className="locales-action-button locales-delete-button">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para registrar local */}
      {showModal && (
        <div className="locales-modal-overlay">
          <div className="locales-modal">
            <h2 className="locales-modal-title">Registrar Nuevo Local</h2>
            <form className="locales-modal-form">
              <div className="locales-form-grid">
                <div className="locales-form-group">
                  <label className="locales-form-label">
                    Nombre del Local
                  </label>
                  <input
                    type="text"
                    className="locales-form-input"
                    placeholder="Ingrese el nombre"
                  />
                </div>
                <div className="locales-form-group">
                  <label className="locales-form-label">
                    Propietario
                  </label>
                  <input
                    type="text"
                    className="locales-form-input"
                    placeholder="Nombre del propietario"
                  />
                </div>
                <div className="locales-form-group">
                  <label className="locales-form-label">
                    Tipo de Local
                  </label>
                  <select className="locales-form-select">
                    <option>Seleccione el tipo</option>
                    <option>Restaurant</option>
                    <option>Tienda</option>
                    <option>Farmacia</option>
                    <option>Oficina</option>
                  </select>
                </div>
                <div className="locales-form-group">
                  <label className="locales-form-label">
                    Categoría
                  </label>
                  <select className="locales-form-select">
                    <option>Seleccione la categoría</option>
                    <option>Gastronomía</option>
                    <option>Comercio</option>
                    <option>Salud</option>
                    <option>Servicios</option>
                  </select>
                </div>
                <div className="locales-form-group locales-form-full-width">
                  <label className="locales-form-label">
                    Dirección
                  </label>
                  <input
                    type="text"
                    className="locales-form-input"
                    placeholder="Dirección completa"
                  />
                </div>
                <div className="locales-form-group">
                  <label className="locales-form-label">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="locales-form-input"
                    placeholder="0987654321"
                  />
                </div>
                <div className="locales-form-group">
                  <label className="locales-form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="locales-form-input"
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>
              <div className="locales-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="locales-cancel-button"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="locales-submit-button"
                >
                  Registrar Local
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalesComerciales;