import { useState, useEffect, useCallback } from 'react'
import {
  categoriasApi,
  productosApi,
  clientesApi,
  pedidosApi,
  stockApi,
  usuariosApi,
} from '../api/entities.api'

// ─── Generic fetch hook factory ────────────────────────────────────────────────
function useEntityList(fetchFn) {
  const [data, setData] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const res = await fetchFn()
      setData(res.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, setData, cargando, error, refetch: fetch }
}

// ─── useCategorias ─────────────────────────────────────────────────────────────
export function useCategorias() {
  const { data: categorias, setData, cargando, error, refetch } = useEntityList(categoriasApi.getAll)

  const crear = async (datos) => {
    const res = await categoriasApi.create(datos)
    setData(prev => [...prev, res.data.data])
    return res.data.data
  }

  const actualizar = async (id, datos) => {
    const res = await categoriasApi.update(id, datos)
    setData(prev => prev.map(c => c.id === id ? res.data.data : c))
    return res.data.data
  }

  const eliminar = async (id) => {
    await categoriasApi.delete(id)
    setData(prev => prev.filter(c => c.id !== id))
  }

  return { categorias, cargando, error, refetch, crear, actualizar, eliminar }
}

// ─── useProductos ──────────────────────────────────────────────────────────────
export function useProductos() {
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
    setData(prev => [res.data.data, ...prev])
    return res.data.data
  }

  const cambiarEstado = async (id, estado) => {
    const res = await pedidosApi.cambiarEstado(id, estado)
    setData(prev => prev.map(p => p.id === id ? res.data.data : p))
    return res.data.data
  }

  const cancelar = async (id) => {
    await pedidosApi.cancelar(id)
    setData(prev => prev.map(p => p.id === id ? { ...p, estado: 'cancelado' } : p))
  }

  return { pedidos, cargando, error, refetch, crear, cambiarEstado, cancelar }
}

// ─── useStock ──────────────────────────────────────────────────────────────────
export function useStock() {
  const { data: stocks, setData, cargando, error, refetch } = useEntityList(stockApi.getAll)
  const [bajoStock, setBajoStock] = useState([])

  const fetchBajoStock = useCallback(async () => {
    try {
      const res = await stockApi.getBajoStock()
      setBajoStock(res.data.data || [])
    } catch { /* silent */ }
  }, [])

  useEffect(() => { fetchBajoStock() }, [fetchBajoStock])

  const aumentar = async (productoId, cantidad) => {
    const res = await stockApi.aumentar(productoId, cantidad)
    refetch()
    return res.data.data
  }

  const actualizar = async (id, datos) => {
    const res = await stockApi.update(id, datos)
    setData(prev => prev.map(s => s.id === id ? res.data.data : s))
    return res.data.data
  }

  return { stocks, bajoStock, cargando, error, refetch, aumentar, actualizar }
}

// ─── useUsuarios ───────────────────────────────────────────────────────────────
export function useUsuarios() {
  const { data: usuarios, setData, cargando, error, refetch } = useEntityList(usuariosApi.getAll)

  const actualizar = async (id, datos) => {
    const res = await usuariosApi.update(id, datos)
    setData(prev => prev.map(u => u.id === id ? res.data.data : u))
    return res.data.data
  }

  const eliminar = async (id) => {
    await usuariosApi.delete(id)
    setData(prev => prev.filter(u => u.id !== id))
  }

  return { usuarios, cargando, error, refetch, actualizar, eliminar }
}
