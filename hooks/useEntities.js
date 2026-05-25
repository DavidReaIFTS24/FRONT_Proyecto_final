import { useState, useEffect, useCallback } from 'react' // Importa herramientas básicas de React para estado y ciclos de vida.
import {
  categoriasApi,
  productosApi,
  clientesApi,
  pedidosApi,
  stockApi,
  usuariosApi,
} from '../api/entities.api' // Importa los servicios que hacen las peticiones HTTP reales.

function useEntityList(fetchFn) { // Recibe una función de la API (como categoriasApi.getAll).
  const [data, setData] = useState([]) // Estado para guardar la lista de elementos.
  const [cargando, setCargando] = useState(false) // Estado para saber si la petición está en curso.
  const [error, setError] = useState(null) // Estado para guardar mensajes de error si algo falla.

  const fetch = useCallback(async () => { // Define la función de carga. useCallback evita que se recree innecesariamente.
    setCargando(true) // Activa el spinner de carga.
    setError(null) // Limpia errores previos.
    try {
      const res = await fetchFn() // Llama a la función de la API que se pasó por parámetro.
      setData(res.data.data || []) // Guarda la respuesta en el estado 'data'.
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos') // Si falla, captura el mensaje de error.
    } finally {
      setCargando(false) // Desactiva el spinner, haya tenido éxito o no.
    }
  }, []) // El array vacío indica que esta función solo se define una vez.

  useEffect(() => { fetch() }, [fetch]) // Ejecuta la carga automáticamente cuando el componente se monta.

  return { data, setData, cargando, error, refetch: fetch } // Devuelve todo lo necesario para que la página funcione.
}

// ─── useCategorias ─────────────────────────────────────────────────────────────
export function useCategorias() {
  // obtener la lista base de categorías.
  const { data: categorias, setData, cargando, error, refetch } = useEntityList(categoriasApi.getAll)

  const crear = async (datos) => { // Función para enviar una nueva categoría al servidor.
    const res = await categoriasApi.create(datos)
    setData(prev => [...prev, res.data.data]) // Actualiza la lista local agregando la nueva al final.
    return res.data.data // Retorna el objeto creado por si se necesita.
  }

  const actualizar = async (id, datos) => { // Función para editar una categoría existente.
    const res = await categoriasApi.update(id, datos)
    // Busca en la lista local y reemplaza solo el elemento editado.
    setData(prev => prev.map(c => c.id === id ? res.data.data : c))
    return res.data.data
  }

  const eliminar = async (id) => { // Función para borrar.
    await categoriasApi.delete(id)
    setData(prev => prev.filter(c => c.id !== id)) // Quita el elemento de la lista local instantáneamente.
  }

  return { categorias, cargando, error, refetch, crear, actualizar, eliminar }
}

// ─── useProductos ──────────────────────────────────────────────────────────────
export function useProductos() {
  // Sigue exactamente la misma lógica que categorías pero apuntando a la API de productos.
  const { data: productos, setData, cargando, error, refetch } = useEntityList(productosApi.getAll)

  const crear = async (datos) => {
    const res = await productosApi.create(datos)
    setData(prev => [...prev, res.data.data])
    return res.data.data
  }

  const actualizar = async (id, datos) => {
    const res = await productosApi.update(id, datos)
    setData(prev => prev.map(p => p.id === id ? res.data.data : p))
    return res.data.data
  }

  const eliminar = async (id) => {
    await productosApi.delete(id)
    setData(prev => prev.filter(p => p.id !== id))
  }

  return { productos, cargando, error, refetch, crear, actualizar, eliminar }
}

// ─── useClientes ───────────────────────────────────────────────────────────────
export function useClientes() {
  // Gestión de clientes: CRUD completo con actualización de estado local.
  const { data: clientes, setData, cargando, error, refetch } = useEntityList(clientesApi.getAll)

  const crear = async (datos) => {
    const res = await clientesApi.create(datos)
    setData(prev => [...prev, res.data.data])
    return res.data.data
  }

  const actualizar = async (id, datos) => {
    const res = await clientesApi.update(id, datos)
    setData(prev => prev.map(c => c.id === id ? res.data.data : c))
    return res.data.data
  }

  const eliminar = async (id) => {
    await clientesApi.delete(id)
    setData(prev => prev.filter(c => c.id !== id))
  }

  return { clientes, cargando, error, refetch, crear, actualizar, eliminar }
}

// ─── usePedidos ────────────────────────────────────────────────────────────────
export function usePedidos() {
  const { data: pedidos, setData, cargando, error, refetch } = useEntityList(pedidosApi.getAll)

  const crear = async (datos) => {
    const res = await pedidosApi.create(datos)
    setData(prev => [res.data.data, ...prev]) // A diferencia de otros, pone el nuevo pedido PRIMERO en la lista.
    return res.data.data
  }

  const cambiarEstado = async (id, estado) => { // Función específica para el flujo del pedido (ej: de 'pendiente' a 'enviado').
    const res = await pedidosApi.cambiarEstado(id, estado)
    setData(prev => prev.map(p => p.id === id ? res.data.data : p))
    return res.data.data
  }

  const cancelar = async (id) => { // Función para anular un pedido.
    await pedidosApi.cancelar(id)
    // No lo borra de la lista, solo cambia su propiedad 'estado' localmente a 'cancelado'.
    setData(prev => prev.map(p => p.id === id ? { ...p, estado: 'cancelado' } : p))
  }

  return { pedidos, cargando, error, refetch, crear, cambiarEstado, cancelar }
}

// ─── useStock ──────────────────────────────────────────────────────────────────
export function useStock() {
  const { data: stocks, setData, cargando, error, refetch } = useEntityList(stockApi.getAll)
  const [bajoStock, setBajoStock] = useState([]) // Estado adicional para filtrar productos críticos.

  const fetchBajoStock = useCallback(async () => { // Petición secundaria solo para alertas de stock.
    try {
      const res = await stockApi.getBajoStock()
      setBajoStock(res.data.data || [])
    } catch { /* silent: si falla, simplemente no muestra alertas */ }
  }, [])

  useEffect(() => { fetchBajoStock() }, [fetchBajoStock]) // Carga alertas al iniciar.

  const aumentar = async (productoId, cantidad) => { // Lógica para entrada de mercadería.
    const res = await stockApi.aumentar(productoId, cantidad)
    refetch() // Después de aumentar, vuelve a pedir toda la lista para asegurar datos frescos.
    return res.data.data
  }

  const actualizar = async (id, datos) => { // Ajuste manual de stock o puntos mínimos.
    const res = await stockApi.update(id, datos)
    setData(prev => prev.map(s => s.id === id ? res.data.data : s))
    return res.data.data
  }

  return { stocks, bajoStock, cargando, error, refetch, aumentar, actualizar }
}

// ─── useUsuarios ───────────────────────────────────────────────────────────────
export function useUsuarios() {
  // Gestión de usuarios (típicamente para el panel de administración).
  const { data: usuarios, setData, cargando, error, refetch } = useEntityList(usuariosApi.getAll)

  const actualizar = async (id, datos) => { // Permite cambiar roles o datos de cuenta.
    const res = await usuariosApi.update(id, datos)
    setData(prev => prev.map(u => u.id === id ? res.data.data : u))
    return res.data.data
  }

  const eliminar = async (id) => { // Baja de un usuario del sistema.
    await usuariosApi.delete(id)
    setData(prev => prev.filter(u => u.id !== id))
  }

  return { usuarios, cargando, error, refetch, actualizar, eliminar }
}
