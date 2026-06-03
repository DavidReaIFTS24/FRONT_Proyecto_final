import axiosClient from './axiosClient';

/**
 * Los servicios están organizados por "recursos" (entidades).
 * Cada objeto contiene los métodos necesarios para realizar operaciones CRUD 
 * y consultas específicas al backend.
 */

// ─── CATEGORÍAS ──────────────────────────────────────────────────────────────
export const categoriasApi = {
  // Obtiene la lista completa de categorías
  getAll: () => axiosClient.get('/categorias'),
  
  // Busca una categoría específica por su ID
  getById: (id) => axiosClient.get(`/categorias/${id}`),
  
  // Crea una nueva categoría enviando un objeto { nombre, descripcion }
  create: (data) => axiosClient.post('/categorias', data),
  
  // Actualiza una categoría existente
  update: (id, data) => axiosClient.put(`/categorias/${id}`, data),
  
  // Elimina una categoría (borrado físico o lógico según el backend)
  delete: (id) => axiosClient.delete(`/categorias/${id}`),
};

// ─── PRODUCTOS ───────────────────────────────────────────────────────────────
export const productosApi = {
  getAll: () => axiosClient.get('/productos'),
  
  getById: (id) => axiosClient.get(`/productos/${id}`),
  
  // Consulta útil para filtrar productos en el catálogo por su categoría
  getByCategoria: (categoriaId) => axiosClient.get(`/productos/categoria/${categoriaId}`),
  
  create: (data) => axiosClient.post('/productos', data),
  
  update: (id, data) => axiosClient.put(`/productos/${id}`, data),
  
  delete: (id) => axiosClient.delete(`/productos/${id}`),
};

// ─── CLIENTES ────────────────────────────────────────────────────────────────
export const clientesApi = {
  getAll: () => axiosClient.get('/clientes'),
  
  getById: (id) => axiosClient.get(`/clientes/${id}`),
  
  create: (data) => axiosClient.post('/clientes', data),
  
  update: (id, data) => axiosClient.put(`/clientes/${id}`, data),
  
  delete: (id) => axiosClient.delete(`/clientes/${id}`),
};

// ─── PEDIDOS (VENTAS) ─────────────────────────────────────────────────────────
export const pedidosApi = {
  getAll: () => axiosClient.get('/pedidos'),
  
  getById: (id) => axiosClient.get(`/pedidos/${id}`),
  
  // Historial de compras de un cliente específico
  getByCliente: (clienteId) => axiosClient.get(`/pedidos/cliente/${clienteId}`),
  
  // Filtrar pedidos por: 'pendiente', 'enviado', 'entregado', 'cancelado'
  getByEstado: (estado) => axiosClient.get(`/pedidos/estado/${estado}`),
  
  create: (data) => axiosClient.post('/pedidos', data),
  
  update: (id, data) => axiosClient.put(`/pedidos/${id}`, data),
  
  // Endpoint específico para mover un pedido en el flujo de trabajo
  cambiarEstado: (id, estado) => axiosClient.put(`/pedidos/${id}/estado`, { estado }),
  
  // Usamos delete para cancelar, aunque internamente suele cambiar el estado a 'cancelado'
  cancelar: (id) => axiosClient.delete(`/pedidos/${id}`),
};

// ─── GESTIÓN DE STOCK ────────────────────────────────────────────────────────
export const stockApi = {
  getAll: () => axiosClient.get('/stock'),
  
  getById: (id) => axiosClient.get(`/stock/${id}`),
  
  // Consulta el stock actual de un producto puntual
  getByProducto: (productoId) => axiosClient.get(`/stock/producto/${productoId}`),
  
  // Endpoint crítico para el panel de alertas (productos por agotarse)
  getBajoStock: () => axiosClient.get('/stock/bajo-stock'),
  
  create: (data) => axiosClient.post('/stock', data),
  
  update: (id, data) => axiosClient.put(`/stock/${id}`, data),
  
  // Incrementa el stock de un producto (entrada de mercadería)
  aumentar: (productoId, cantidad) => 
    axiosClient.put(`/stock/aumentar/${productoId}`, { cantidad }),
  
  delete: (id) => axiosClient.delete(`/stock/${id}`),
};

// ─── USUARIOS (ADMINISTRACIÓN) ───────────────────────────────────────────────
export const usuariosApi = {
  getAll:   ()         => axiosClient.get('/usuarios'),
  getById:  (id)       => axiosClient.get(`/usuarios/${id}`),
  create:   (data)     => axiosClient.post('/usuarios', data),   // ← nuevo
  update:   (id, data) => axiosClient.put(`/usuarios/${id}`, data),
  delete:   (id)       => axiosClient.delete(`/usuarios/${id}`),
}
