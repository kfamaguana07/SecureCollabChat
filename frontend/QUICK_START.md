# 🚀 Quick Start - SecureCollabChat Frontend

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Instalación
```bash
# Instalar dependencias
npm install
```

### 2️⃣ Configuración
```bash
# Copiar variables de entorno
cp .env.example .env

# Editar .env si tu backend está en otro puerto
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### 3️⃣ Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Abre http://localhost:5173 en tu navegador
```

## 🎯 Flujos de Prueba

### 👨‍💼 Como Administrador
1. Haz click en **"Administrador"** en la home
2. Ingresa credenciales (usuario/contraseña)
3. En el dashboard, haz click en **"+ Nueva Sala"**
4. Completa el formulario:
   - **ID**: `sala-test-1`
   - **Nombre**: `Test Room`
   - **PIN**: `1234`
   - **Tipo**: `Multimedia`
5. Haz click en **"Crear Sala"**
6. Ver sala creada en la lista

### 👤 Como Usuario
1. Haz click en **"Usuario"** en la home
2. Ingresa datos de la sala:
   - **ID de Sala**: `sala-test-1` (la que creaste)
   - **PIN**: `1234`
   - **Nickname**: `miNombre`
3. Haz click en **"Acceder a Sala"**
4. ¡Ahora estás en la sala de chat!

## 📦 Estructura de Carpetas

```
frontend/
├── src/
│   ├── components/       # Componentes React
│   ├── services/         # API y WebSocket
│   ├── context/          # Estado global
│   ├── pages/            # Páginas principales
│   ├── utils/            # Utilidades
│   ├── App.jsx           # Enrutamiento
│   └── index.css         # Estilos globales
├── .env.example          # Variables de ejemplo
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor local

# Compilación
npm run build            # Crea build para producción
npm run preview          # Vista previa del build

# Validación
npm run lint             # Ejecuta ESLint
```

## 🔌 Integración Backend

**Importante**: El frontend tiene placeholders listos para Socket.io y REST API.

Ver [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) para:
- Endpoints REST requeridos
- Eventos Socket.io
- Validaciones del backend
- Mapeo de errores

## 📚 Documentación

| Documento | Propósito |
|-----------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura y componentes |
| [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) | Guía de integración con backend |
| [SUMMARY.md](./SUMMARY.md) | Resumen de entregables |

## 🎨 Componentes Principales

### Autenticación
- `AdminLogin.jsx` - Login de administrador
- `UserLogin.jsx` - Login de usuario

### Admin
- `AdminDashboard.jsx` - Dashboard
- `RoomForm.jsx` - Crear salas
- `RoomList.jsx` - Lista de salas

### Chat
- `ChatRoom.jsx` - Interfaz principal
- `MessageList.jsx` - Historial
- `MessageInput.jsx` - Input
- `UserList.jsx` - Usuarios conectados
- `FileUpload.jsx` - Subida de archivos

## 🛠️ Troubleshooting

### ❌ Error: "Cannot find module"
```bash
npm install
```

### ❌ Error: "Port 5173 already in use"
```bash
npm run dev -- --port 3001
```

### ❌ Backend no responde
- Verificar que backend esté corriendo en puerto 3000
- Revisar URL en `.env`

### ❌ Socket.io no conecta
- Backend debe estar en VITE_SOCKET_URL
- Verificar CORS en backend

## ✨ Características

✅ Interfaz moderna con Tailwind CSS
✅ Mensajería en tiempo real (Socket.io placeholder)
✅ Autenticación de roles (Admin/Usuario)
✅ Subida de archivos con validación
✅ Responsivo en todos los dispositivos
✅ Validaciones robustas
✅ Manejo de errores amigable

## 📱 Responsividad

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Sidebar colapsable en mobile para mejor uso del espacio.

## 🔐 Variables de Entorno

```env
# API del backend
VITE_API_URL=http://localhost:3000/api

# Socket.io del backend
VITE_SOCKET_URL=http://localhost:3000

# Modo dev
VITE_DEV=true
```

## 🚀 Deployment

### Build para producción
```bash
npm run build
# Genera carpeta /dist lista para servir
```

### Cambiar URL de backend en producción
```bash
# .env.production
VITE_API_URL=https://tuapi.com/api
VITE_SOCKET_URL=https://tuapi.com
```

## 📞 Soporte

Ver documentación completa en [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**¿Listo para empezar?** Ejecuta `npm run dev` y accede a http://localhost:5173 ✨
