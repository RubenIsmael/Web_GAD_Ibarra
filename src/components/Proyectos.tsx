import React, { useState } from 'react';
import { FolderOpen, Plus, Search, Filter, Calendar, User, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <FolderOpen className="w-8 h-8 text-red-600 mr-3" />
          Proyectos
        </h1>
        <p className="text-gray-600">
          Gestión y seguimiento de proyectos municipales
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Proyectos</p>
              <p className="text-2xl font-bold text-gray-800">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Progreso</p>
              <p className="text-2xl font-bold text-gray-800">8</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completados</p>
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
              <p className="text-sm text-gray-600">Presupuesto Total</p>
              <p className="text-2xl font-bold text-gray-800">$2.5M</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
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
              placeholder="Buscar proyectos..."
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
                <option value="planificacion">Planificación</option>
                <option value="en-progreso">En Progreso</option>
                <option value="completado">Completado</option>
                <option value="pausado">Pausado</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Proyecto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de proyectos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProyectos.map((proyecto) => (
          <div key={proyecto.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{proyecto.nombre}</h3>
                  <p className="text-sm text-gray-500">{proyecto.categoria}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proyecto.estado)}`}>
                {proyecto.estado.replace('-', ' ').charAt(0).toUpperCase() + proyecto.estado.slice(1)}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4">{proyecto.descripcion}</p>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Progreso</span>
                <span className="text-sm font-medium text-gray-800">{proyecto.progreso}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(proyecto.progreso)}`}
                  style={{ width: `${proyecto.progreso}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-500">Responsable</p>
                <p className="font-medium text-gray-800 flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {proyecto.responsable}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Presupuesto</p>
                <p className="font-medium text-gray-800">{proyecto.presupuesto}</p>
              </div>
              <div>
                <p className="text-gray-500">Inicio</p>
                <p className="font-medium text-gray-800">{proyecto.fechaInicio}</p>
              </div>
              <div>
                <p className="text-gray-500">Fin</p>
                <p className="font-medium text-gray-800">{proyecto.fechaFin}</p>
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

      {/* Modal para nuevo proyecto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Proyecto</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proyecto
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
                  Responsable
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nombre del responsable"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presupuesto
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="$0.00"
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