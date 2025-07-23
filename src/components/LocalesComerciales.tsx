import React, { useState } from 'react';
import { Store, Plus, Search, Filter, MapPin, Phone, Mail, Eye, Edit, Trash2, Building, User, Calendar } from 'lucide-react';

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <Store className="w-8 h-8 text-red-600 mr-3" />
          Locales Comerciales
        </h1>
        <p className="text-gray-600">
          Registro y gestión de establecimientos comerciales
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Locales</p>
              <p className="text-2xl font-bold text-gray-800">1,247</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-800">1,089</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-800">89</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Nuevos (Este Mes)</p>
              <p className="text-2xl font-bold text-gray-800">23</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar locales comerciales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Local</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de locales */}
      <div className="space-y-4">
        {filteredLocales.map((local) => (
          <div key={local.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold text-gray-800">{local.nombre}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(local.categoria)}`}>
                        {local.categoria}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(local.estado)}`}>
                        {local.estado}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Licencia: {local.licencia}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Propietario</p>
                      <p className="font-medium text-gray-800">{local.propietario}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Dirección</p>
                      <p className="font-medium text-gray-800">{local.direccion}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Teléfono</p>
                      <p className="font-medium text-gray-800">{local.telefono}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{local.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Tipo</p>
                      <p className="font-medium text-gray-800">{local.tipo}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-500">Registro</p>
                      <p className="font-medium text-gray-800">{local.fechaRegistro}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                <button className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition-colors duration-200">
                  <Edit className="w-5 h-5" />
                </button>
                <button className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors duration-200">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para registrar local */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nuevo Local</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Local
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ingrese el nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Propietario
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Nombre del propietario"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Local
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                    <option>Seleccione el tipo</option>
                    <option>Restaurant</option>
                    <option>Tienda</option>
                    <option>Farmacia</option>
                    <option>Oficina</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                    <option>Seleccione la categoría</option>
                    <option>Gastronomía</option>
                    <option>Comercio</option>
                    <option>Salud</option>
                    <option>Servicios</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Dirección completa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="0987654321"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
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