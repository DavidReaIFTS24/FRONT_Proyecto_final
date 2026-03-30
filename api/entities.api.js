import axiosClient from './axiosClient'

// ─── CATEGORIAS ────────────────────────────────────────────────────────────────
export const categoriasApi = {
  getAll:   ()         => axiosClient.get('/categorias'),
  getById:  (id)       => axiosClient.get(`/categorias/${id}`),
  create:   (data)     => axiosClient.post('/categorias', data),
  update:   (id, data) => axiosClient.put(`/categorias/${id}`, data),
  delete:   (id)       => axiosClient.delete(`/categorias/${id}`),
}

// ─── PRODUCTOS ─────────────────────────────────────────────────────────────────
export const productosApi = {
  getAll:         ()              => axiosClient.get('/productos'),
  getById:        (id)            => axiosClient.get(`/productos/${id}`),
  getByCategoria: (categoriaId)   => axiosClient.get(`/productos/categoria/${categoriaId}`),
  create:         (data)          => axiosClient.post('/productos', data),
  update:         (id, data)      => axiosClient.put(`/productos/${id}`, data),
  delete:         (id)            => axiosClient.delete(`/productos/${id}`),
}

// ─── CLIENTES ──────────────────────────────────────────────────────────────────
export const clientesApi = {
  getAll:   ()         => axiosClient.get('/clientes'),
  getById:  (id)       => axiosClient.get(`/clientes/${id}`),
  create:   (data)     => axiosClient.post('/clientes', data),
  update:   (id, data) => axiosClient.put(`/clientes/${id}`, data),
  delete:   (id)       => axiosClient.delete(`/clientes/${id}`),
}

// ─── PEDIDOS ───────────────────────────────────────────────────────────────────
export const pedidosApi = {
  getAll:         ()           => axiosClient.get('/pedidos'),
  getById:        (id)         => axiosClient.get(`/pedidos/${id}`),
  getByCliente:   (clienteId)  => axiosClient.get(`/pedidos/cliente/${clienteId}`),
  getByEstado:    (estado)     => axiosClient.get(`/pedidos/estado/${estado}`),
  create:         (data)       => axiosClient.post('/pedidos', data),
  update:         (id, data)   => axiosClient.put(`/pedidos/${id}`, data),
  cambiarEstado:  (id, estado) => axiosClient.put(`/pedidos/${id}/estado`, { estado }),
  cancelar:       (id)         => axiosClient.delete(`/pedidos/${id}`),
}

// ─── STOCK ─────────────────────────────────────────────────────────────────────
export const stockApi = {
  getAll:          ()              => axiosClient.get('/stock'),
  getById:         (id)            => axiosClient.get(`/stock/${id}`),
  getByProducto:   (productoId)    => axiosClient.get(`/stock/producto/${productoId}`),
  getBajoStock:    ()              => axiosClient.get('/stock/bajo-stock'),
  create:          (data)          => axiosClient.post('/stock', data),
  update:          (id, data)      => axiosClient.put(`/stock/${id}`, data),
  aumentar:        (productoId, cantidad) => axiosClient.put(`/stock/aumentar/${productoId}`, { cantidad }),
  delete:          (id)            => axiosClient.delete(`/stock/${id}`),
}

// ─── USUARIOS ──────────────────────────────────────────────────────────────────
export const usuariosApi = {
  getAll:   ()         => axiosClient.get('/usuarios'),
  getById:  (id)       => axiosClient.get(`/usuarios/${id}`),
  update:   (id, data) => axiosClient.put(`/usuarios/${id}`, data),
  delete:   (id)       => axiosClient.delete(`/usuarios/${id}`),
}
