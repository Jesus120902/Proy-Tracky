# Tracky - Logistics & Fleet Tracking System

Tracky es una solución moderna para la gestión de logística y seguimiento de entregas en tiempo real. Construida con una arquitectura de microservicios (Frontend y Backend separados) y una estética SaaS premium.

---

## 🚀 Inicio Rápido

### Requisitos Previos
- **Node.js**: Versión 16 o superior.
- **MongoDB**: Una instancia ejecutándose localmente en `mongodb://localhost:27017/tracky`.

### Instalación
Desde la raíz del proyecto, ejecuta:
```bash
npm run install-all
```
*Este comando instalará todas las dependencias del proyecto raíz, el backend y el frontend.*

### Base de Datos de Prueba
Para poblar la base de datos con conductores y órdenes iniciales:
```bash
npm run seed
```

### Ejecutar en Desarrollo
Para iniciar tanto el servidor de la API como el panel de administración simultáneamente:
```bash
npm run dev
```
- **Panel de Administración**: `http://localhost:5173`
- **Servidor API**: `http://localhost:5000`

---

## 🛠️ Stack Tecnológico

### Frontend
- **React (Vite)**: Framework principal.
- **Tailwind CSS**: Estilos premium y diseño responsivo.
- **Leaflet**: Visualización de mapas y seguimiento GPS.
- **Lucide React**: Set de iconos profesionales.
- **Axios**: Comunicación fluida con la API.

### Backend
- **Node.js + Express**: Servidor de aplicaciones.
- **Mongoose**: Modelado de datos para MongoDB.
- **CORS & Dotenv**: Seguridad y configuración.

---

## 📁 Estructura del Proyecto

```
tracky-logistics/
├── backend/            # API REST (Node/Express)
│   ├── models/         # Esquemas de Mongoose
│   ├── routes/         # Endpoints de la API
│   └── seed.js         # Script de datos iniciales
├── frontend/           # Panel de Administración (React)
│   ├── src/
│   │   ├── components/ # Componentes UI reutilizables
│   │   ├── pages/      # Vistas principales (Dashboard, Map, etc.)
│   │   └── services/   # Lógica de comunicación API
└── package.json        # Gestión de scripts globales
```

---

## 🔐 Credenciales Demo
- **Email**: `admin@tracky.com`
- **Contraseña**: `password` (o cualquier texto, la autenticación es simulada para el MVP).

---

## 📝 Licencia
Este proyecto fue desarrollado como un MVP para fines demostrativos de una plataforma de logística.
