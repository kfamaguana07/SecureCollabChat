/**
 * Componente MessageInput
 * Input para enviar mensajes
 */

import React, { useState } from 'react';

const MessageInput = ({ onSendMessage, isConnected }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || !isConnected) {
      return;
    }

    setIsSending(true);
    try {
      onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    // Enviar con Ctrl+Enter o Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white p-4 sm:p-6 space-y-3"
    >
      {/* Input Container */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            isConnected
              ? 'Escribe un mensaje... (Ctrl+Enter para enviar)'
              : 'Desconectado...'
          }
          disabled={!isConnected || isSending}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        <button
          type="submit"
          disabled={!isConnected || !message.trim() || isSending}
          className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isSending ? '...' : '📤'}
        </button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        💡 Presiona Ctrl+Enter (o Cmd+Enter en Mac) para enviar rápidamente
      </p>
    </form>
  );
};

export default MessageInput;
