import React, { useState } from 'react';
import { MessageSquare, Send, Clock, Search } from 'lucide-react';

const Mensajeria: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'María González',
      lastMessage: 'Gracias por la información sobre la licencia',
      time: '10:30 AM',
      unread: 2,
      avatar: 'M'
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      lastMessage: '¿Cuándo estará lista la documentación?',
      time: '09:15 AM',
      unread: 0,
      avatar: 'C'
    },
    {
      id: 3,
      name: 'Ana Pérez',
      lastMessage: 'Necesito información sobre el registro sanitario',
      time: 'Ayer',
      unread: 1,
      avatar: 'A'
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'María González',
      content: 'Hola, necesito información sobre la licencia de funcionamiento',
      time: '10:00 AM',
      isOwn: false
    },
    {
      id: 2,
      sender: 'Yo',
      content: 'Hola María, con gusto te ayudo. ¿Para qué tipo de negocio necesitas la licencia?',
      time: '10:05 AM',
      isOwn: true
    },
    {
      id: 3,
      sender: 'María González',
      content: 'Es para un restaurant en el centro de la ciudad',
      time: '10:10 AM',
      isOwn: false
    },
    {
      id: 4,
      sender: 'Yo',
      content: 'Perfecto, te envío la lista de requisitos que necesitas presentar.',
      time: '10:15 AM',
      isOwn: true
    },
    {
      id: 5,
      sender: 'María González',
      content: 'Gracias por la información sobre la licencia',
      time: '10:30 AM',
      isOwn: false
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Aquí iría la lógica para enviar el mensaje
      setNewMessage('');
    }
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <MessageSquare className="w-8 h-8 text-red-600 mr-3" />
          Mensajería
        </h1>
        <p className="text-gray-600">
          Comunicación directa con ciudadanos y empresarios
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Lista de conversaciones */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar conversaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                    selectedConversation === conversation.id ? 'bg-red-50 border-r-4 border-red-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {conversation.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 truncate">{conversation.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{conversation.time}</span>
                          {conversation.unread > 0 && (
                            <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header de conversación */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedConversationData?.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{selectedConversationData?.name}</h3>
                      <p className="text-sm text-gray-500">En línea</p>
                    </div>
                  </div>
                </div>

                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-xs lg:max-w-md">
                        <div
                          className={`rounded-lg p-3 ${
                            message.isOwn
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{message.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input de mensaje */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      placeholder="Escribe un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Selecciona una conversación para comenzar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mensajeria;