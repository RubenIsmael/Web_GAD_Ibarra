import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Home from './Home';
import Requerimientos from './Requerimientos';
import Mensajeria from './Mensajeria';
import Proyectos from './Proyectos';
import Ferias from './Ferias';
import LocalesComerciales from './LocalesComerciales';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <Home />;
      case 'requerimientos':
        return <Requerimientos />;
      case 'mensajeria':
        return <Mensajeria />;
      case 'proyectos':
        return <Proyectos />;
      case 'ferias':
        return <Ferias />;
      case 'locales':
        return <LocalesComerciales />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-red-100/20 via-transparent to-red-50/30 pointer-events-none"></div>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={onLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Escudo_de_Ibarra_%28Ecuador%29.png/250px-Escudo_de_Ibarra_%28Ecuador%29.png" 
                alt="Escudo GAD Ibarra" 
                className="w-8 h-8"
              />
              <div>
                <h1 className="text-sm font-semibold text-gray-800">GAD Ibarra</h1>
                <p className="text-xs text-gray-500">Municipalidad</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-red-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="animate-fadeIn">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;