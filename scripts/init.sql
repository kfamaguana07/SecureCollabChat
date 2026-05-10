CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ADMINISTRADORES
CREATE TABLE IF NOT EXISTS administradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Almacenará el hash de bcrypt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SALAS 
CREATE TABLE IF NOT EXISTS salas (
    id VARCHAR(255) PRIMARY KEY, -- Generado automáticamente por el backend
    pin VARCHAR(10) NOT NULL CHECK (char_length(pin) >= 4),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('texto', 'multimedia')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SESIONES (Nickname autogenerado y Sesión Única)
CREATE TABLE IF NOT EXISTS sesiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_real VARCHAR(255) NOT NULL,
    nickname VARCHAR(255) NOT NULL,  
    device_id VARCHAR(255) UNIQUE NOT NULL,
    ip VARCHAR(50) NOT NULL,
    sala_id VARCHAR(255) REFERENCES salas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. MENSAJES 
CREATE TABLE IF NOT EXISTS mensajes (
    id SERIAL PRIMARY KEY,
    contenido TEXT NOT NULL,
    sala_id VARCHAR(255) REFERENCES salas(id) ON DELETE CASCADE,
    sesion_id UUID REFERENCES sesiones(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ARCHIVOS 
CREATE TABLE IF NOT EXISTS archivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(500) NOT NULL,
    peso_bytes INT NOT NULL,
    mimetype VARCHAR(100) NOT NULL,
    mensaje_id INT REFERENCES mensajes(id) ON DELETE CASCADE
);

-- Índices para optimizar el rendimiento bajo carga (Requisito de Escalabilidad) [cite: 54]
CREATE INDEX IF NOT EXISTS idx_mensajes_sala ON mensajes(sala_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_device ON sesiones(device_id);