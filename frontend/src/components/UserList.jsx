/**
 * Componente UserList
 * Lista lateral de usuarios conectados
 */

import React from 'react';

const UserList = ({ users, currentUser }) => {
  return (
    <aside className="w-64 border-l border-gray-200 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-white p-4 border-b border-primary border-opacity-20">
        <h3 className="font-bold text-sm">👥 Usuarios Conectados</h3>
        <p className="text-xs text-purple-100 mt-1">
          {users.length} usuario{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Users List */}
      {users && users.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {users.map((u, index) => {
            const isCurrentUser = u.userId === currentUser?.userId;

            return (
              <li
                key={index}
                className={`px-4 py-3 flex items-center gap-2 transition ${
                  isCurrentUser
                    ? 'bg-primary bg-opacity-10 border-l-2 border-primary'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  isCurrentUser
                    ? 'bg-primary'
                    : 'bg-gradient-to-r from-primary to-secondary'
                }`}>
                  {u.nickname?.[0]?.toUpperCase() || '?'}
                </div>

                {/* Nickname */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate">
                    {u.nickname}
                  </p>
                  {isCurrentUser && (
                    <p className="text-xs text-primary font-semibold">Tú</p>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="p-4 text-center text-gray-500 text-sm">
          <p>No hay usuarios conectados</p>
        </div>
      )}

      {/* Info Box */}
      <div className="border-t border-gray-200 p-4 m-4 bg-blue-50 rounded-lg text-xs text-blue-800">
        <p className="font-semibold mb-1">💡 Información</p>
        <ul className="space-y-1 text-xs">
          <li>✓ Usuarios mostrados en tiempo real</li>
          <li>✓ Conexión segura con Socket.io</li>
          <li>✓ Estado actualizado automáticamente</li>
        </ul>
      </div>
    </aside>
  );
};

export default UserList;
