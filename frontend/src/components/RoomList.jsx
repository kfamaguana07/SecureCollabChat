/**
 * Componente RoomList
 * Muestra la lista de salas creadas
 */

import React from 'react';
import { ROOM_TYPES } from '../utils/constants';

const RoomList = ({ rooms, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => (
        <div
          key={room.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border-l-4 border-primary"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-4">
            <h3 className="text-lg font-bold truncate">{room.name}</h3>
            <p className="text-purple-100 text-sm">ID: {room.id}</p>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-3">
            {/* Room Type Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full
                {room.type === ROOM_TYPES.MULTIMEDIA
                  ? 'bg-success bg-opacity-10 text-success'
                  : 'bg-warning bg-opacity-10 text-warning'}
              ">
                {room.type === ROOM_TYPES.MULTIMEDIA ? '📁 Multimedia' : '📝 Solo Texto'}
              </span>
            </div>

            {/* Description */}
            {room.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {room.description}
              </p>
            )}

            {/* PIN Info */}
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-600 font-semibold mb-1">PIN</p>
              <p className="text-lg font-mono font-bold text-dark tracking-widest">
                {room.pin}
              </p>
            </div>

            {/* Stats */}
            {room.userCount !== undefined && (
              <div className="flex justify-between text-xs text-gray-600 bg-light p-2 rounded">
                <span>👥 {room.userCount || 0} usuario{room.userCount !== 1 ? 's' : ''}</span>
                <span>📅 {new Date(room.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="border-t border-gray-200 p-4 flex gap-2">
            <button
              className="flex-1 bg-primary hover:bg-secondary text-white font-semibold py-2 rounded-lg transition text-sm"
              title="Ver detalles de la sala"
            >
              Ver Detalles
            </button>
            <button
              onClick={() => onDelete(room.id)}
              className="flex-1 bg-danger hover:bg-opacity-90 text-white font-semibold py-2 rounded-lg transition text-sm"
              title="Eliminar sala"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomList;
