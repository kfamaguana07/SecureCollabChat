# SecureCollabChat Frontend

Frontend de un sistema de chat en tiempo real seguro con salas, desarrollado con React.js, Vite y Tailwind CSS.

## 📋 Características

### Módulo de Administrador
- **Login seguro**: Autenticación con usuario y contraseña
- **Dashboard**: Gestión de salas
- **Crear salas**: Configurar ID único, PIN (mín. 4 dígitos), nombre y tipo (Texto o Multimedia)
- **Gestión**: Ver, editar y eliminar salas

### Módulo de Usuario
- **Acceso simple**: Solo requiere ID de sala, PIN y nickname
- **Validación**: Detección de nicknames duplicados y sesiones activas
- **Interfaz intuitiva**: Acceso rápido a salas

### Interfaz de Chat
- **Mensajes en tiempo real**: Latencia < 1s con Socket.io
- **Lista de usuarios**: Visualización de usuarios conectados con estado en vivo
- **Indicador de tipo de sala**: Diferenciación visual entre salas de Texto y Multimedia
- **Subida de archivos**: En salas Multimedia (máx. 10MB)
  - Formatos soportados: JPEG, PNG, GIF, PDF
  - Drag & drop y selector de archivos
  - Validación automática de tamaño y tipo

## 🏗️ Arquitectura

```
frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── AdminLogin.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── RoomForm.jsx
│   │   ├── RoomList.jsx
│   │   ├── UserLogin.jsx
│   │   ├── ChatRoom.jsx
│   │   ├── MessageList.jsx
│   │   ├── MessageInput.jsx
│   │   ├── UserList.jsx
│   │   ├── FileUpload.jsx
│   │   └── ProtectedRoute.jsx
│   ├── services/            # Servicios (capa de lógica)
│   │   ├── api.js          # Peticiones REST con axios
│   │   └── socket.js       # WebSocket con socket.io-client
│   ├── context/            # Estado global
│   │   └── AuthContext.jsx
│   ├── pages/              # Páginas principales
│   │   └── HomePage.jsx
│   ├── utils/              # Utilidades
│   │   ├── validators.js   # Validaciones
│   │   └── constants.js    # Constantes
│   ├── App.jsx            # Componente raíz con rutas
│   ├── main.jsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── public/                # Archivos estáticos
├── tailwind.config.js     # Configuración de Tailwind
├── postcss.config.js      # Configuración de PostCSS
├── vite.config.js         # Configuración de Vite
├── package.json           # Dependencias
└── index.html             # HTML principal
```

## 🔧 Tecnologías

- **React 19**: Framework UI moderno con hooks
- **Vite**: Build tool rápido y moderno
- **Tailwind CSS**: Framework de utilidades CSS
- **Socket.io-client**: Comunicación bidireccional en tiempo real
- **Axios**: Cliente HTTP para peticiones REST
- **React Router DOM**: Sistema de enrutamiento

## 📦 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env basado en .env.example
cp .env.example .env

# 3. Configurar URLs de API y Socket en .env
```

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# El frontend estará disponible en http://localhost:5173
```

## 📤 Compilación

```bash
# Compilar para producción
npm run build

# Vista previa de la compilación
npm run preview
```

## 📊 Flujos Principales

### 1. Administrador
```
Home → Login Admin → Dashboard → Crear Sala → Gestionar Salas
```

### 2. Usuario
```
Home → Login Usuario (PIN) → Sala de Chat → Mensajes/Archivos → Salir
```

## 🔐 Validaciones Implementadas

### PIN de Sala
- Mínimo 4 dígitos
- Solo números

### Nickname
- No vacío
- Máximo 20 caracteres
- Solo letras, números, guiones y guiones bajos
- Detección de duplicados

### ID de Sala
- No vacío
- Máximo 30 caracteres
- Solo letras, números, guiones y guiones bajos

### Archivos
- Máximo 10MB
- Formatos: JPEG, PNG, GIF, PDF
- Validación antes de subir

## 🎨 Interfaz Visual

### Paleta de Colores
- **Primario**: #6B46C1 (Púrpura)
- **Secundario**: #7C3AED (Púrpura Oscuro)
- **Éxito**: #10B981 (Verde)
- **Peligro**: #EF4444 (Rojo)
- **Advertencia**: #F59E0B (Naranja)

### Responsividad
- ✅ Mobile First
- ✅ Tablets (md: 768px)
- ✅ Desktop (lg: 1024px+)
- ✅ Sidebar colapsable en mobile

## 🔌 Eventos Socket.io

Los placeholders están listos para integración con el backend:

```javascript
// Eventos de conexión
CONNECT: 'connect'
DISCONNECT: 'disconnect'

// Eventos de sala
JOIN_ROOM: 'joinRoom'
LEAVE_ROOM: 'leaveRoom'
ROOM_USERS_UPDATE: 'roomUsersUpdate'
ROOM_ERROR: 'roomError'

// Eventos de mensajes
SEND_MESSAGE: 'sendMessage'
RECEIVE_MESSAGE: 'receiveMessage'

// Eventos de archivos
SEND_FILE: 'sendFile'
RECEIVE_FILE: 'receiveFile'
FILE_ERROR: 'fileError'

// Notificaciones
USER_JOINED: 'userJoined'
USER_LEFT: 'userLeft'
```

## 🛡️ Manejo de Errores

- ✅ Validación de campos con mensajes claros
- ✅ Detección de sesión activa
- ✅ Manejo de PIN incorrecto
- ✅ Límite de tamaño de archivo
- ✅ Archivo no soportado
- ✅ Conexión perdida
- ✅ Reconexión automática (máx. 5 intentos)

## 📝 Separación de Capas

### Componentes (UI)
- Responsables solo de visualización
- Usan hooks (useState, useEffect, useContext)
- Importan de servicios cuando necesitan datos

### Servicios (Lógica)
- `api.js`: Todas las llamadas REST con axios
- `socket.js`: Toda la lógica de WebSocket

### Contexto (Estado Global)
- `AuthContext.jsx`: Gestión de autenticación y sesión
- Persiste datos en localStorage

### Utils (Utilidades)
- `validators.js`: Todas las validaciones
- `constants.js`: Constantes y configuración

## 🔄 Sesión Única

El sistema valida que solo exista una sesión activa por IP/dispositivo:
- Backend rechaza nuevas conexiones si ya existe sesión activa
- Frontend redirecciona al usuario al login
- Mensaje de error claro: "Ya existe una sesión activa en este dispositivo"

## 🚀 Próximas Integraciones

Los placeholders están dejados para:
1. **Notificaciones en tiempo real**: Sistema de notificaciones de eventos
2. **Presencia**: Indicadores de "escribiendo..."
3. **Reacciones**: Emojis en mensajes
4. **Búsqueda**: Búsqueda de mensajes históricos
5. **Historial**: Cargar mensajes anteriores (pagination)

## 📄 Licencia

Proyecto educativo - Universidad

## 👥 Desarrollo

**Frontend Developer**: Desarrollado con React.js y Tailwind CSS
**Requisitos**: Node.js 16+ y npm/yarn
