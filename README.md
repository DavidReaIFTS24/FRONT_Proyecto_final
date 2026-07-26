# Frontend — Panel de Gestión

React + Tailwind CSS · Conectado a tu API Express/Firebase

---

## Estructura del proyecto

```
src/
├── api/
│   ├── axiosClient.js       ← Cliente HTTP base con interceptores JWT
│   ├── auth.api.js          ← Login, register, perfil
│   └── entities.api.js      ← Categorías, Productos, Clientes, Pedidos, Stock, Usuarios
│
├── context/
│   └── AuthContext.jsx      ← Estado global de sesión (usuario + token)
│
├── hooks/
│   ├── useEntities.js       ← Hooks CRUD para cada entidad
│   └── useToast.js          ← Notificaciones toast
│
├── components/
│   ├── ui/index.jsx         ← Componentes atómicos: Button, Input, Modal, Table, Badge...
│   └── layout/MainLayout.jsx← Sidebar + estructura de página
│
├── pages/
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── ProductosPage.jsx
│   ├── CategoriasPage.jsx
│   ├── ClientesPage.jsx
│   ├── PedidosPage.jsx
│   ├── StockPage.jsx
│   └── UsuariosPage.jsx     ← Solo admin
│
└── routes/
    ├── AppRouter.jsx        ← Todas las rutas
    └── ProtectedRoute.jsx   ← Guard de autenticación y roles
```

---

## Setup rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar la URL del backend
cp .env.example .env.local
# Editá VITE_API_URL en .env.local

# 3. Correr en desarrollo
npm run dev
```

El frontend queda disponible en http://localhost:5173

---

## Variables de entorno

| Variable       | Descripción                  | Default                      |
|----------------|------------------------------|------------------------------|
| VITE_API_URL   | URL base de tu API           | `/api` (proxied via Vite)    |

El `vite.config.js` ya incluye un proxy: todas las peticiones a `/api`
son redirigidas a `http://localhost:3000`. Si tu backend corre en otro
puerto, ajustalo en `vite.config.js`.

---

## Permisos por rol

| Página      | Admin | Empleado |
|-------------|-------|----------|
| Dashboard   | ✓     | ✓        |
| Productos   | ✓     | ✓        |
| Categorías  | ✓     | ✓        |
| Clientes    | ✓     | solo lectura |
| Pedidos     | ✓     | ✓        |
| Stock       | ✓     | ✓        |
| Usuarios    | ✓     | ✗        |

---

## Flujo de datos

```
Componente / Página
      ↓  (llama)
  Custom Hook (useEntities.js)
      ↓  (llama)
  API Layer (entities.api.js)
      ↓  (HTTP con token)
  axiosClient.js
      ↓
  Tu Backend Express
```

Ningún componente habla directamente con la API.
