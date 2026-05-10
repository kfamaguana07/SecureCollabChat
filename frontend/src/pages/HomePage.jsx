/**
 * Página de inicio
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center text-white mb-12">
          <div className="mb-6">
            <h1 className="text-5xl sm:text-6xl font-bold mb-4">
              SecureCollabChat
            </h1>
            <p className="text-xl text-purple-100">
              Plataforma segura de comunicación en tiempo real
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/admin/login')}
              className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:shadow-lg transition text-lg"
            >
              👨‍💼 Administrador
            </button>
            <button
              onClick={() => navigate('/user/login')}
              className="bg-purple-500 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition text-lg border-2 border-white"
            >
              👤 Usuario
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-bold text-lg text-dark mb-2">Seguridad</h3>
            <p className="text-gray-600 text-sm">
              Conexiones seguras con validación de sesión única por dispositivo
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-lg text-dark mb-2">Tiempo Real</h3>
            <p className="text-gray-600 text-sm">
              Comunicación instantánea con latencia menor a 1 segundo
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-3xl mb-3">📁</div>
            <h3 className="font-bold text-lg text-dark mb-2">Multimedia</h3>
            <p className="text-gray-600 text-sm">
              Comparte imágenes y documentos en salas multimedia
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white bg-opacity-10 backdrop-blur rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Cómo funciona</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-bold mb-2">Para Administradores</h3>
              <ol className="space-y-2 text-purple-100 list-decimal list-inside">
                <li>Inicia sesión con tus credenciales</li>
                <li>Crea salas con PIN y tipo (Texto/Multimedia)</li>
                <li>Comparte el ID y PIN con los usuarios</li>
                <li>Gestiona tus salas desde el dashboard</li>
              </ol>
            </div>
            <div>
              <h3 className="font-bold mb-2">Para Usuarios</h3>
              <ol className="space-y-2 text-purple-100 list-decimal list-inside">
                <li>Ingresa el ID de la sala</li>
                <li>Escribe el PIN que te compartieron</li>
                <li>Elige un nickname único</li>
                <li>¡Comienza a chatear!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
