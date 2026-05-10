/**
 * Componente RoomForm
 * Formulario para crear una nueva sala
 */

import React, { useState } from 'react';
import { validators } from '../utils/validators';
import { ROOM_TYPES } from '../utils/constants';

const RoomForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    pin: '',
    type: ROOM_TYPES.TEXT,
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Solo permitir números para el PIN
    if (name === 'pin' && !/^\d*$/.test(value)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validar campos
      const newErrors = {};

      const roomIdValidation = validators.validateRoomId(formData.id);
      if (!roomIdValidation.valid) {
        newErrors.id = roomIdValidation.error;
      }

      const pinValidation = validators.validatePin(formData.pin);
      if (!pinValidation.valid) {
        newErrors.pin = pinValidation.error;
      }

      if (!formData.name.trim()) {
        newErrors.name = 'El nombre de la sala es requerido';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }

      await onSubmit(formData);
      setFormData({
        id: '',
        name: '',
        pin: '',
        type: ROOM_TYPES.TEXT,
        description: '',
      });
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-primary">
      <h3 className="text-xl font-bold text-dark mb-6">Crear Nueva Sala</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error General */}
        {errors.general && (
          <div className="bg-danger bg-opacity-10 border border-danger border-opacity-50 text-danger px-4 py-3 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        {/* Grid 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room ID */}
          <div className="space-y-2">
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">
              ID de Sala *
            </label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="sala-proyecto-1"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                errors.id ? 'border-danger focus:ring-danger' : 'border-gray-300'
              }`}
            />
            {errors.id && <p className="text-sm text-danger">{errors.id}</p>}
            <p className="text-xs text-gray-500">Solo letras, números, guiones y guiones bajos</p>
          </div>

          {/* Room Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre de Sala *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Proyecto Final"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                errors.name ? 'border-danger focus:ring-danger' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-sm text-danger">{errors.name}</p>}
          </div>

          {/* PIN */}
          <div className="space-y-2">
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
              PIN (mínimo 4 dígitos) *
            </label>
            <input
              type="text"
              id="pin"
              name="pin"
              value={formData.pin}
              onChange={handleChange}
              placeholder="1234"
              maxLength="6"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition text-center text-lg tracking-widest ${
                errors.pin ? 'border-danger focus:ring-danger' : 'border-gray-300'
              }`}
            />
            {errors.pin && <p className="text-sm text-danger">{errors.pin}</p>}
          </div>

          {/* Room Type */}
          <div className="space-y-2">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Tipo de Sala *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
            >
              <option value={ROOM_TYPES.TEXT}>Solo Texto</option>
              <option value={ROOM_TYPES.MULTIMEDIA}>Multimedia (Texto + Archivos)</option>
            </select>
            <p className="text-xs text-gray-500">
              {formData.type === ROOM_TYPES.TEXT
                ? 'Solo mensajes de texto'
                : 'Mensajes + subida de archivos (máx 10MB)'}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descripción (opcional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descripción de la sala..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
          />
        </div>

        {/* Type Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Nota:</span> El tipo de sala determina si los usuarios
            pueden subir archivos o solo enviar mensajes de texto.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creando...' : 'Crear Sala'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomForm;
