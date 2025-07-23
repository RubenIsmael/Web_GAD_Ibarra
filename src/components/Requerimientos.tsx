import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';

const Requerimientos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const requerimientos = [
    {
      id: 1,
      titulo: 'Licencia de Funcionamiento',
      descripcion: 'Solicitud de licencia para restaurant en zona centro',
      solicitante: 'María González',
      fecha: '2025-01-15',
      estado: 'pendiente',
      tipo: 'licencia'
    },
    {
      id: 2,
      titulo: 'Permiso de Construcción',
      descripcion: 'Ampliación de local comercial existente',
      solicitante: 'Carlos Rodríguez',
      fecha: '2025-01-14',
      estado: 'aprobado',
      tipo: 'construccion'
    },
    {
      id: 3,
      titulo: 'Registro Sanitario',
      descripcion: 'Registro para panadería y pastelería',
      solicitante: 'Ana Pérez',
      fecha: '2025-01-13',
      estado: 'rechazado',
      tipo: 'sanitario'
    }
  ];

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'aprobado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequerimientos = requerimientos.filter(req => {
    const matchesSearch = req.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.solicitante.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || req.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <FileText className="w-8 h-8 text-red-600 mr-3" />
          Requerimientos
        </h1>
        <p className="text-gray-600">
          Gestión de solicitudes y permisos municipales
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar requerimientos..."
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
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de requerimientos */}
      <div className="space-y-4">
        {filteredRequerimientos.map((req) => (
          <div key={req.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{req.titulo}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(req.estado)}`}>
                    {req.estado.charAt(0).toUpperCase() + req.estado.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{req.descripcion}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Solicitante: {req.solicitante}</span>
                  <span>Fecha: {req.fecha}</span>
                  <span>Tipo: {req.tipo}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                  <Edit className="w-5 h-5" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para nuevo requerimiento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Requerimiento</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ingrese el título"
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
                  Solicitante
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nombre del solicitante"
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
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requerimientos;