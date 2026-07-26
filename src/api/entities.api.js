import axiosClient from './axiosClient';

// ─── CATEGORÍAS ──────────────────────────────────────────────────────────────
export const categoriasApi = {
  getAll:  ()         => axiosClient.get('/categorias'),
  getById: (id)       => axiosClient.get(`/categorias/${id}`),
  create:  (data)     => axiosClient.post('/categorias', data),
  update:  (id, data) => axiosClient.put(`/categorias/${id}`, data),
  delete:  (id)       => axiosClient.delete(`/categorias/${id}`),
};

// ─── PRODUCTOS ───────────────────────────────────────────────────────────────
export const productosApi = {
  getAll:         ()            => axiosClient.get('/productos'),
  getById:        (id)          => axiosClient.get(`/productos/${id}`),
  getByCategoria: (categoriaId) => axiosClient.get(`/productos/categoria/${categoriaId}`),
  create:         (data)        => axiosClient.post('/productos', data),
  update:         (id, data)    => axiosClient.put(`/productos/${id}`, data),
  delete:         (id)          => axiosClient.delete(`/productos/${id}`),
};

// ─── IMÁGENES (Cloudinary vía backend) ───────────────────────────────────────
// El frontend envía el archivo al backend, que lo sube a Cloudinary
// y devuelve { url, public_id }. La URL se guarda en Firestore.
export const imagenesApi = {
  /**
   * Sube una imagen. Recibe un objeto File del input type="file".
   * Devuelve { url, public_id }.
   */
  upload: (file) => {
    const formData = new FormData();
    formData.append('imagen', file);
    return axiosClient.post('/imagenes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Elimina una imagen de Cloudinary por su public_id.
   * Llamar cuando se elimina un producto que tenía imagen.
   */
  delete: (publicId) => axiosClient.delete(`/imagenes/${publicId}`),
};

// ─── CLIENTES ────────────────────────────────────────────────────────────────
export const clientesApi = {
  getAll:  ()         => axiosClient.get('/clientes'),
  getById: (id)       => axiosClient.get(`/clientes/${id}`),
  create:  (data)     => axiosClient.post('/clientes', data),
  update:  (id, data) => axiosClient.put(`/clientes/${id}`, data),
  delete:  (id)       => axiosClient.delete(`/clientes/${id}`),
};

// ─── PEDIDOS ─────────────────────────────────────────────────────────────────
export const pedidosApi = {
  getAll:        ()              => axiosClient.get('/pedidos'),
  getById:       (id)            => axiosClient.get(`/pedidos/${id}`),
  getByCliente:  (clienteId)     => axiosClient.get(`/pedidos/cliente/${clienteId}`),
  getByEstado:   (estado)        => axiosClient.get(`/pedidos/estado/${estado}`),
  create:        (data)          => axiosClient.post('/pedidos', data),
  update:        (id, data)      => axiosClient.put(`/pedidos/${id}`, data),
  cambiarEstado: (id, estado)    => axiosClient.put(`/pedidos/${id}/estado`, { estado }),
  cancelar:      (id)            => axiosClient.delete(`/pedidos/${id}`),
};

// ─── STOCK ───────────────────────────────────────────────────────────────────
export const stockApi = {
  getAll:        ()                     => axiosClient.get('/stock'),
  getById:       (id)                   => axiosClient.get(`/stock/${id}`),
  getByProducto: (productoId)           => axiosClient.get(`/stock/producto/${productoId}`),
  getBajoStock:  ()                     => axiosClient.get('/stock/bajo-stock'),
  create:        (data)                 => axiosClient.post('/stock', data),
  update:        (id, data)             => axiosClient.put(`/stock/${id}`, data),
  aumentar:      (productoId, cantidad) => axiosClient.put(`/stock/aumentar/${productoId}`, { cantidad }),
  descontar:     (productoId, cantidad) => axiosClient.put(`/stock/descontar/${productoId}`, { cantidad }),
  delete:        (id)                   => axiosClient.delete(`/stock/${id}`),
};

// ─── USUARIOS ────────────────────────────────────────────────────────────────
export const usuariosApi = {
  getAll:  ()         => axiosClient.get('/usuarios'),
  getById: (id)       => axiosClient.get(`/usuarios/${id}`),
  create:  (data)     => axiosClient.post('/usuarios', data),
  update:  (id, data) => axiosClient.put(`/usuarios/${id}`, data),
  delete:  (id)       => axiosClient.delete(`/usuarios/${id}`),
};
