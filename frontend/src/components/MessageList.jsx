/**
 * Componente MessageList
 * Muestra el historial de mensajes
 */

import React from 'react';
import { MESSAGE_TYPES } from '../utils/constants';

const MessageList = ({ messages, currentUser }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">📭 No hay mensajes aún</p>
        <p className="text-sm">Sé el primero en enviar un mensaje</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg, index) => {
        const isCurrentUser = msg.userId === currentUser?.userId;
        const isSystemMessage = msg.type === MESSAGE_TYPES.SYSTEM;

        if (isSystemMessage) {
          return (
            <div key={index} className="flex justify-center">
              <div className="bg-gray-200 text-gray-700 text-sm px-4 py-1 rounded-full">
                {msg.message}
              </div>
            </div>
          );
        }

        return (
          <div
            key={index}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                isCurrentUser
                  ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-br-none'
                  : 'bg-gray-200 text-dark rounded-bl-none'
              }`}
            >
              {/* Nickname (si no es el usuario actual) */}
              {!isCurrentUser && (
                <p className="text-xs font-semibold mb-1 opacity-75">
                  {msg.nickname || 'Anónimo'}
                </p>
              )}

              {/* Message Content */}
              <p className="break-words">{msg.message}</p>

              {/* File (si es de tipo archivo) */}
              {msg.type === MESSAGE_TYPES.FILE && msg.fileUrl && (
                <div className="mt-2 pt-2 border-t border-current border-opacity-30">
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline hover:opacity-80 transition inline-flex items-center gap-1"
                  >
                    📎 {msg.fileName || 'Descargar archivo'}
                  </a>
                </div>
              )}

              {/* Timestamp */}
              <p className="text-xs mt-2 opacity-70">
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
