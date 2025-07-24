import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, MapPin, Calendar, Award, Store, FileText, MessageSquare } from 'lucide-react';

const Home: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const quotes = [
   "Ibarra es el alma de la Sierra Norte; su historia es ejemplo de resurgimiento - Benjamín Carrión",
"El terremoto de 1868 destruyó la ciudad, pero no el espíritu ibarreño. Esa ciudad se reconstruyó con el corazón de su pueblo - Pedro Moncayo",
"Ibarra es la cuna de hombres libres y pensamiento ilustrado - Eloy Alfaro",
"Entre Yahuarcocha y el Imbabura se respira historia. Ibarra no olvida su origen ni su destino - Luis Felipe Borja",
"El blanco de Ibarra no es solo su cal, es la limpieza de su cultura - Jorge Icaza",
"Ibarra vive en mi memoria como el lugar donde el cielo toca la tierra - Oswaldo Guayasamín",
"Si Ecuador tiene un norte con dignidad, ese es Ibarra - Alfonso Moreno Mora",
"En la Ciudad Blanca cada piedra habla; basta escuchar con respeto - Luis Alberto Costales",
"De las cenizas nació la nueva Ibarra, como el ave fénix de los Andes - Manuel Jijón Larrea",
"Ibarra no necesita testigos, su belleza habla por sí sola - Julio Pazos Barrera"

  ];

  const stats = [
    { icon: Store, label: 'Locales Comerciales', value: '1,247', color: 'bg-blue-500' },
    { icon: Users, label: 'Emprendimientos', value: '892', color: 'bg-green-500' },
    { icon: Calendar, label: 'Ferias Activas', value: '15', color: 'bg-purple-500' },
    { icon: Award, label: 'Proyectos Aprobados', value: '234', color: 'bg-orange-500' }
  ];

  useEffect(() => {
    setMounted(true);
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(timeInterval);
    };
  }, [quotes.length]);

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-red-100/30 rounded-3xl pointer-events-none"></div>
      <div className="relative z-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Bienvenido al Sistema Municipal
            </h1>
            <p className="text-gray-600">
              Gestión de Locales Comerciales, Emprendimientos y Ferias - GAD Municipal de Ibarra
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {currentTime.toLocaleDateString('es-EC', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-2xl font-bold text-red-600">
              {currentTime.toLocaleTimeString('es-EC', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Logo y escudo */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-red-100/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-red-500 to-red-600"></div>
        <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-12">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Escudo_de_Ibarra_%28Ecuador%29.png/250px-Escudo_de_Ibarra_%28Ecuador%29.png" alt="Escudo GAD Ibarra" className="w-20 h-20" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              GAD Municipal de Ibarra
            </h2>
            <p className="text-gray-600">
              Gobierno Autónomo Descentralizado
            </p>
          </div>
          
          <div className="text-center lg:text-left max-w-2xl">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <MapPin className="w-6 h-6 text-red-600 mr-2" />
              <span className="text-lg font-semibold text-gray-700">Ibarra, Ecuador</span>
            </div>
            <div className="bg-red-50 rounded-xl p-6">
              <p className={`text-gray-700 italic text-lg leading-relaxed transition-all duration-1000 ${mounted ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
                "{quotes[currentQuote]}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105 border border-red-50/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center shadow-lg relative z-10`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-800 relative z-10">{stat.value}</span>
              </div>
              <p className="text-gray-600 font-medium relative z-10">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Secciones principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Novedades */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 text-red-600 mr-2" />
            Novedades Recientes
          </h3>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-800">Nueva Feria de Emprendimientos</h4>
              <p className="text-sm text-gray-600">Apertura de inscripciones para la feria mensual</p>
              <span className="text-xs text-gray-500">Hace 2 horas</span>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-800">Actualización de Requisitos</h4>
              <p className="text-sm text-gray-600">Nuevos lineamientos para locales comerciales</p>
              <span className="text-xs text-gray-500">Hace 1 día</span>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-800">Proyecto Aprobado</h4>
              <p className="text-sm text-gray-600">Centro comercial en zona norte</p>
              <span className="text-xs text-gray-500">Hace 3 días</span>
            </div>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Users className="w-6 h-6 text-red-600 mr-2" />
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-red-50 hover:bg-red-100 p-4 rounded-lg transition-colors duration-200">
              <div className="text-center">
                <div className="w-8 h-8 bg-red-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Nuevo Requisito</span>
              </div>
            </button>
            <button className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors duration-200">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Mensajes</span>
              </div>
            </button>
            <button className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors duration-200">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Nueva Feria</span>
              </div>
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors duration-200">
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Registro Local</span>
              </div>
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Home;