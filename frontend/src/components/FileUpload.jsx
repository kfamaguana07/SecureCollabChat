/**
 * Componente FileUpload
 * Interfaz para subir archivos a una sala multimedia
 */

import React, { useRef, useState } from 'react';
import { validators } from '../utils/validators';
import { ERROR_MESSAGES } from '../utils/constants';

const FileUpload = ({ onUpload }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

  const handleFileSelect = async (file) => {
    setError(null);

    // Validar tamaño
    const sizeValidation = validators.validateFileSize(file);
    if (!sizeValidation.valid) {
      setError(sizeValidation.error);
      return;
    }

    // Validar tipo
    const typeValidation = validators.validateFileType(file, ALLOWED_TYPES);
    if (!typeValidation.valid) {
      setError(typeValidation.error);
      return;
    }

    // Subir archivo
    setIsUploading(true);
    try {
      await onUpload(file);
      // Success será manejado por el componente padre
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.FILE_TOO_LARGE);
    } finally {
      setIsUploading(false);
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
      {/* Error Alert */}
      {error && (
        <div className="bg-danger bg-opacity-10 border border-danger border-opacity-50 text-danger px-3 py-2 rounded text-sm flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-danger hover:text-opacity-70"
          >
            ✕
          </button>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition cursor-pointer ${
          isDragging
            ? 'border-primary bg-primary bg-opacity-5'
            : 'border-gray-300 hover:border-primary'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept=".jpg,.jpeg,.png,.gif,.pdf"
          className="hidden"
          disabled={isUploading}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-primary hover:text-secondary font-semibold transition disabled:opacity-50"
        >
          {isUploading ? '⏳ Subiendo...' : '📁 Click para seleccionar o arrastra archivos'}
        </button>

        <p className="text-xs text-gray-500 mt-2">
          Formatos: JPEG, PNG, GIF, PDF | Máximo: 10MB
        </p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded p-3 text-xs text-blue-800">
        <p className="font-semibold mb-1">💡 Consejos para subir archivos:</p>
        <ul className="space-y-1">
          <li>✓ Arrastra y suelta archivos en el área gris</li>
          <li>✓ O haz click para seleccionar manualmente</li>
          <li>✓ Máximo 10MB por archivo</li>
          <li>✓ Se comparte automáticamente con la sala</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
