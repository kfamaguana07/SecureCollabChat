/**
 * Validadores para el sistema de chat seguro
 */

export const validators = {
  /**
   * Valida el PIN de la sala (mínimo 4 dígitos)
   */
  validatePin: (pin) => {
    if (!pin || pin.toString().length < 4) {
      return { valid: false, error: 'El PIN debe tener al menos 4 dígitos' };
    }
    if (!/^\d+$/.test(pin.toString())) {
      return { valid: false, error: 'El PIN solo puede contener números' };
    }
    return { valid: true };
  },

  /**
   * Valida el nickname del usuario
   */
  validateNickname: (nickname) => {
    if (!nickname || nickname.trim().length === 0) {
      return { valid: false, error: 'El nickname no puede estar vacío' };
    }
    if (nickname.length > 20) {
      return { valid: false, error: 'El nickname no debe superar 20 caracteres' };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(nickname)) {
      return { valid: false, error: 'El nickname solo puede contener letras, números, guiones y guiones bajos' };
    }
    return { valid: true };
  },

  /**
   * Valida el ID de la sala
   */
  validateRoomId: (roomId) => {
    if (!roomId || roomId.trim().length === 0) {
      return { valid: false, error: 'El ID de la sala no puede estar vacío' };
    }
    if (roomId.length > 30) {
      return { valid: false, error: 'El ID de la sala no debe superar 30 caracteres' };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(roomId)) {
      return { valid: false, error: 'El ID de la sala solo puede contener letras, números, guiones y guiones bajos' };
    }
    return { valid: true };
  },

  /**
   * Valida el tamaño de archivo (máximo 10MB)
   */
  validateFileSize: (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (!file) {
      return { valid: false, error: 'No se ha seleccionado archivo' };
    }
    if (file.size > maxSize) {
      return { valid: false, error: 'El archivo no debe superar 10MB' };
    }
    return { valid: true };
  },

  /**
   * Valida el tipo de archivo permitido
   */
  validateFileType: (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']) => {
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}` };
    }
    return { valid: true };
  },

  /**
   * Valida credenciales de administrador
   */
  validateAdminCredentials: (username, password) => {
    if (!username || username.trim().length === 0) {
      return { valid: false, error: 'El usuario no puede estar vacío' };
    }
    if (!password || password.length < 6) {
      return { valid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }
    return { valid: true };
  },
};

export default validators;
