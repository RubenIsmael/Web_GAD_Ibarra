import React, { useState } from 'react';
import { Calendar, Plus, Search, Filter, MapPin, Clock, Users, Eye, Edit, Trash2 } from 'lucide-react';

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <Calendar className="w-8 h-8 text-red-600 mr-3" />
          Ferias
        </h1>
        <p className="text-gray-600">
          Gestión de ferias y eventos comerciales
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ferias</p>
              <p className="text-2xl font-bold text-gray-800">15</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activas</p>
              <p className="text-2xl font-bold text-gray-800">3</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Participantes</p>
              <p className="text-2xl font-bold text-gray-800">1,247</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Este Mes</p>
              <p className="text-2xl font-bold text-gray-800">5</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
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
              placeholder="Buscar ferias..."
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
                <option value="programada">Programada</option>
                <option value="activa">Activa</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Feria</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de ferias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFerias.map((feria) => (
          <div key={feria.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{feria.nombre}</h3>
                  <p className="text-sm text-gray-500">{feria.organizador}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(feria.categoria)}`}>
                  {feria.categoria}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feria.estado)}`}>
                  {feria.estado}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{feria.descripcion}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">Fecha</p>
                  <p className="font-medium text-gray-800">{feria.fecha}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">Horario</p>
                  <p className="font-medium text-gray-800">{feria.hora}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">Lugar</p>
                  <p className="font-medium text-gray-800">{feria.lugar}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-gray-500">Participantes</p>
                  <p className="font-medium text-gray-800">{feria.participantes}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
              <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Ver</span>
              </button>
              <button className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors duration-200 flex items-center justify-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center justify-center space-x-2">
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para nueva feria */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nueva Feria</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Feria
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ingrese el nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Ingrese la descripción"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lugar
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Lugar del evento"
                />
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