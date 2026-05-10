/**
 * Componente AdminDashboard
 * Dashboard para que el administrador cree y gestione salas
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { validators } from '../utils/validators';
import { ROOM_TYPES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import RoomForm from './RoomForm';
import RoomList from './RoomList';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, logout, setErrorMessage } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  // Cargar salas al montar el componente
  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    fetchRooms();
  }, [admin, navigate]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getRooms();
      setRooms(data.rooms || []);
      setError(null);
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.NETWORK_ERROR);
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (roomData) => {
    try {
      const response = await adminAPI.createRoom(roomData);
      setRooms([...rooms, response.room]);
      setShowForm(false);
      setErrorMessage(SUCCESS_MESSAGES.ROOM_CREATED);
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.NETWORK_ERROR);
      setErrorMessage(err.message);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta sala?')) {
      return;
    }

    try {
      await adminAPI.deleteRoom(roomId);
      setRooms(rooms.filter((room) => room.id !== roomId));
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.NETWORK_ERROR);
      setErrorMessage(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">SecureCollabChat</h1>
            <p className="text-purple-100 text-sm">Panel de Administrador</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
              {admin?.username}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white text-primary px-4 py-2 rounded-lg hover:bg-opacity-90 transition font-semibold"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-danger bg-opacity-10 border border-danger border-opacity-50 text-danger px-4 py-4 rounded-lg">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-dark mb-2">Mis Salas</h2>
            <p className="text-gray-600">
              {rooms.length} sala{rooms.length !== 1 ? 's' : ''} creada{rooms.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold"
          >
            {showForm ? 'Cancelar' : '+ Nueva Sala'}
          </button>
        </div>

        {/* Create Room Form */}
        {showForm && (
          <div className="mb-12">
            <RoomForm
              onSubmit={handleCreateRoom}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Rooms List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="text-gray-600 mt-4">Cargando salas...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4"
                />
              </svg>
            </div>
            <p className="text-gray-600">
              Aún no has creado ninguna sala. ¡Crea una nueva para empezar!
            </p>
          </div>
        ) : (
          <RoomList
            rooms={rooms}
            onDelete={handleDeleteRoom}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
