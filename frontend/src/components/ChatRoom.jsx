/**
 * Componente ChatRoom
 * Interfaz principal de la sala de chat
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socketService } from '../services/socket';
import { userAPI } from '../services/api';
import { SOCKET_EVENTS, ROOM_TYPES, ERROR_MESSAGES } from '../utils/constants';
import UserList from './UserList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import FileUpload from './FileUpload';

const ChatRoom = () => {
  const navigate = useNavigate();
  const { user, currentRoom, logout, setErrorMessage } = useAuth();

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserList, setShowUserList] = useState(true);

  const messagesEndRef = useRef(null);

  // Redirigir si no hay autenticación
  useEffect(() => {
    if (!user || !currentRoom) {
      navigate('/user/login');
      return;
    }
  }, [user, currentRoom, navigate]);

  // Conectar Socket.io y cargar historial
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);

        // Cargar historial de mensajes
        const messagesData = await userAPI.getRoomMessages(currentRoom.id, 50);
        setMessages(messagesData.messages || []);

        // Conectar Socket.io
        const token = localStorage.getItem('authToken');
        await socketService.connect(token || '');

        // Unirse a la sala
        socketService.joinRoom(
          currentRoom.id,
          user.nickname,
          user.userId
        );

        setIsConnected(true);

        // Configurar listeners
        socketService.onReceiveMessage((data) => {
          setMessages((prev) => [...prev, data]);
          scrollToBottom();
        });

        socketService.onRoomUsersUpdate((updatedUsers) => {
          setUsers(updatedUsers);
        });

        socketService.onUserJoined((data) => {
          setMessages((prev) => [
            ...prev,
            {
              type: 'system',
              message: `${data.nickname} se unió a la sala`,
              timestamp: new Date().toISOString(),
            },
          ]);
          scrollToBottom();
        });

        socketService.onUserLeft((data) => {
          setMessages((prev) => [
            ...prev,
            {
              type: 'system',
              message: `${data.nickname} salió de la sala`,
              timestamp: new Date().toISOString(),
            },
          ]);
        });

        socketService.onRoomError((errorData) => {
          setError(errorData.message);
          setErrorMessage(errorData.message);
        });

        socketService.onFileError((errorData) => {
          setError(errorData.message);
          setErrorMessage(errorData.message);
        });
      } catch (err) {
        const errorMsg = err.message || ERROR_MESSAGES.NETWORK_ERROR;
        setError(errorMsg);
        setErrorMessage(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && currentRoom) {
      initializeChat();
    }

    return () => {
      if (socketService.isConnected()) {
        socketService.leaveRoom(currentRoom?.id, user?.nickname);
        socketService.disconnect();
      }
    };
  }, [user, currentRoom, setErrorMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (message) => {
    if (!socketService.isConnected()) {
      setError('No estás conectado a la sala');
      return;
    }

    socketService.sendMessage(currentRoom.id, message, 'text');
  };

  const handleFileUpload = async (file) => {
    if (currentRoom.type === ROOM_TYPES.TEXT) {
      setError('Esta sala no permite subida de archivos');
      return;
    }

    try {
      await userAPI.uploadFile(currentRoom.id, file, {
        nickname: user.nickname,
      });

      // El backend emitirá el evento de archivo recibido via socket
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.FILE_TOO_LARGE);
      setErrorMessage(err.message);
    }
  };

  const handleLeaveRoom = () => {
    if (window.confirm('¿Deseas salir de la sala?')) {
      socketService.leaveRoom(currentRoom.id, user.nickname);
      socketService.disconnect();
      logout();
      navigate('/user/login');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="text-gray-600 mt-4">Conectando a la sala...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-light flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md border-b-4 border-primary sticky top-0 z-40">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-dark">{currentRoom.name}</h1>
              <p className="text-sm text-gray-600">
                <span className="mr-3">
                  {currentRoom.type === ROOM_TYPES.MULTIMEDIA ? '📁' : '📝'} {currentRoom.type}
                </span>
                <span className={`${isConnected ? 'text-success' : 'text-danger'}`}>
                  {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUserList(!showUserList)}
                className="md:hidden bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition"
              >
                👥 {users.length}
              </button>

              <button
                onClick={handleLeaveRoom}
                className="bg-danger text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition font-semibold"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="bg-danger bg-opacity-10 border-b border-danger border-opacity-50 text-danger px-4 py-3 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-danger hover:text-opacity-70"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <MessageList messages={messages} currentUser={user} />
            <div ref={messagesEndRef} />
          </div>

          {/* File Upload (si es multimedia) */}
          {currentRoom.type === ROOM_TYPES.MULTIMEDIA && (
            <FileUpload onUpload={handleFileUpload} />
          )}

          {/* Message Input */}
          <MessageInput
            onSendMessage={handleSendMessage}
            isConnected={isConnected}
          />
        </div>

        {/* Sidebar - Users List */}
        {(showUserList || window.innerWidth >= 768) && (
          <UserList users={users} currentUser={user} />
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
