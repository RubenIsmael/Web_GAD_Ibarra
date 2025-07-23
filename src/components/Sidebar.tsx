import React from 'react';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  FolderOpen, 
  Calendar,
  Store,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeSection, 
  onSectionChange,
  onLogout 
}) => {
  const menuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'requerimientos', label: 'Requerimientos', icon: FileText },
    { id: 'mensajeria', label: 'Mensajería', icon: MessageSquare },
    { id: 'proyectos', label: 'Proyectos', icon: FolderOpen },
    { id: 'ferias', label: 'Ferias', icon: Calendar },
    { id: 'locales', label: 'Locales Comerciales', icon: Store },
  ];

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    onClose();
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-red-100/50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 via-red-600 to-red-700"></div>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpuHktR3HBUhWPGgwb1c-jfrpWXEfuGe5dOA&s"
                  alt="Escudo GAD Ibarra"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-800">GAD Ibarra</h1>
                <p className="text-xs text-gray-500">Municipalidad</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-red-600 transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105' 
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 hover:shadow-md'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;