# SecureCollabChat - Frontend

Sistema profesional de chat en tiempo real con salas seguras, desarrollado con React.js, Vite y Tailwind CSS.

## 📋 Contenido

- [Características](#características)
- [Instalación](#instalación)
- [Inicio Rápido](#inicio-rápido)
- [Estructura](#estructura)
- [Documentación](#documentación)
- [Desarrollo](#desarrollo)

## 🎯 Características

### ✨ Para Administradores
- Login seguro con usuario y contraseña
- Crear salas con PIN y tipo (Texto o Multimedia)
- Dashboard para gestionar salas
- Interfaz intuitiva

### 💬 Para Usuarios
- Acceso a salas solo con ID y PIN
- Nickname único por sala
- Interfaz limpia y responsiva
- Validaciones en tiempo real

### 🔄 En la Sala de Chat
- Mensajería en tiempo real (< 1s latencia)
- Lista de usuarios conectados
- Subida de archivos (en salas Multimedia)
- Indicadores visuales de tipo de sala
- Historial de mensajes

## 📦 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar desarrollo
npm run dev
```

## 🚀 Inicio Rápido

Ver [QUICK_START.md](./QUICK_START.md) para iniciar en 5 minutos.

## 📂 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── AdminLogin.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── UserLogin.jsx
│   │   ├── ChatRoom.jsx
│   │   └── ...
│   ├── services/            # Servicios (API y WebSocket)
│   │   ├── api.js
│   │   └── socket.js
│   ├── context/             # Estado global
│   │   └── AuthContext.jsx
│   ├── pages/               # Páginas principales
│   │   └── HomePage.jsx
│   ├── utils/               # Utilidades
│   │   ├── validators.js
│   │   └── constants.js
│   ├── App.jsx              # Enrutamiento
│   └── index.css            # Estilos globales
├── public/                  # Archivos estáticos
├── tailwind.config.js       # Configuración Tailwind
├── vite.config.js           # Configuración Vite
└── package.json
```

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa del build
npm run preview

# Validar código
npm run lint
```

## 📚 Documentación

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Arquitectura completa y componentes
- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)**: Guía para integrar backend
- **[SUMMARY.md](./SUMMARY.md)**: Resumen de entregables
- **[QUICK_START.md](./QUICK_START.md)**: Inicio rápido

## 🔌 Tecnologías

- **React 19**: Framework UI moderno
- **Vite**: Build tool rápido
- **Tailwind CSS**: Framework CSS utilitario
- **Socket.io-client**: Comunicación bidireccional
- **Axios**: Cliente HTTP
- **React Router**: Enrutamiento

## 🎨 Diseño

- Interfaz moderna y responsiva
- Tema de colores con gradientes púrpuras
- Componentes accesibles
- Animations suaves
- Mobile-first design

## 🔐 Seguridad

- Validaciones en frontend para UX
- Protección de rutas sensibles
- Tokens JWT listos
- Manejo seguro de sesiones
- localStorage para persistencia

## 📊 Validaciones

| Campo | Reglas |
|-------|--------|
| PIN | Mínimo 4 dígitos, solo números |
| Nickname | Máx 20 caracteres, alfanumérico |
| ID Sala | Máx 30 caracteres, alfanumérico |
| Archivo | Máx 10MB, JPEG/PNG/GIF/PDF |

## 🌍 Responsividad

- ✅ Mobile (< 640px)
- ✅ Tablet (640px - 1024px)
- ✅ Desktop (> 1024px)
- ✅ Sidebar colapsable

## 🚀 Deployment

```bash
# Build para producción
npm run build

# Servir carpeta dist/
```

## 🤝 Integración Backend

El frontend está listo para conectar con un backend Node.js/Express. 

Ver [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) para:
- Endpoints REST requeridos
- Eventos Socket.io
- Validaciones necesarias
- Ejemplos de implementación

## 📝 Variables de Entorno

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## ✨ Características Implementadas

✅ Login de Administrador
✅ Dashboard con CRUD de salas
✅ Login de Usuario con PIN
✅ Interfaz de Chat en tiempo real
✅ Lista de usuarios conectados
✅ Subida de archivos (salas Multimedia)
✅ Validaciones robustas
✅ Manejo de errores
✅ Interfaz responsiva
✅ Documentación completa

## 🎓 Proyecto Educativo

**Universidad**: Sistemas Distribuidos
**Asignatura**: Aplicaciones Distribuidas
**Tema**: Chat Seguro en Tiempo Real

---

**Desarrollado con ❤️ usando React.js y Tailwind CSS**
