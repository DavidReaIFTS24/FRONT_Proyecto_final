import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { productosApi, clientesApi, pedidosApi, stockApi } from '../api/entities.api'
import { StatCard, Badge, Spinner } from '../components/ui/index.jsx'

// ─── CARRUSEL DE PRODUCTOS ────────────────────────────────────────────────────
function CarruselProductos({ productos }) {
  const [slideActual, setSlideActual] = useState(0)
  const navigate = useNavigate()

  // Avance automático cada 3.5 segundos
  useEffect(() => {
    if (productos.length <= 1) return
    const interval = setInterval(() => {
      setSlideActual(prev => (prev + 1) % productos.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [productos.length])

  if (productos.length === 0) return null

  const irAnterior = () =>
    setSlideActual(prev => (prev - 1 + productos.length) % productos.length)

  const irSiguiente = () =>
    setSlideActual(prev => (prev + 1) % productos.length)

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ height: '240px', background: 'var(--bg-secondary)' }}
    >
      {/* Slides */}
      {productos.map((prod, i) => (
        <div
          key={prod.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === slideActual ? 1 : 0, pointerEvents: i === slideActual ? 'auto' : 'none' }}
        >
          {/* Cloudinary entrega la imagen optimizada automáticamente (WebP, tamaño correcto) */}
          <img
            src={prod.imagen}
            alt={prod.nombre}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75) 100%)' }}
          />

          {/* Info del producto */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-white font-display font-bold text-lg leading-tight">
                  {prod.nombre}
                </p>
                {prod.descripcion && (
                  <p className="text-white/70 text-sm mt-0.5 line-clamp-1">
                    {prod.descripcion}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <span className="text-white font-mono font-bold text-lg">
                  ${Number(prod.precio || 0).toLocaleString('es-AR')}
                </span>
                <button
                  onClick={() => navigate('/productos')}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-opacity hover:opacity-80"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  Ver →
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next */}
      {productos.length > 1 && (
        <>
          <button
            onClick={irAnterior}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-100 opacity-60"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={irSiguiente}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-100 opacity-60"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {productos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {productos.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideActual(i)}
              className="rounded-full transition-all"
              style={{
                width:  i === slideActual ? '20px' : '6px',
                height: '6px',
                background: i === slideActual ? 'white' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}

      {/* Contador */}
      <div
        className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
      >
        {slideActual + 1} / {productos.length}
      </div>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { usuario } = useAuth()
  const navigate    = useNavigate()

  const [stats, setStats]                           = useState(null)
  const [pedidosRecientes, setPedidosRecientes]     = useState([])
  const [bajoStock, setBajoStock]                   = useState([])
  const [productosConImagen, setProductosConImagen] = useState([])
  const [cargando, setCargando]                     = useState(true)

  useEffect(() => {
    Promise.all([
      productosApi.getAll(),
      clientesApi.getAll(),
      pedidosApi.getAll(),
      stockApi.getBajoStock(),
    ]).then(([prod, cli, ped, stock]) => {
      const productos = prod.data.data || []
      const pedidos   = ped.data.data  || []

      setStats({
        productos: productos.length,
        clientes:  (cli.data.data || []).length,
        pedidos:   pedidos.length,
        ingresos:  pedidos.reduce((acc, p) => acc + (p.total || 0), 0),
      })

      setPedidosRecientes(pedidos.slice(0, 5))
      setBajoStock(stock.data.data || [])

      // Solo los productos con imagen cargada en Cloudinary
      setProductosConImagen(productos.filter(p => p.imagen && p.imagen.trim() !== ''))

    }).catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <Spinner />

  const ESTADO_LABELS = {
    pendiente: 'pendiente', procesando: 'procesando',
    enviado: 'enviado', entregado: 'entregado', cancelado: 'cancelado',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
          Bienvenido, {usuario?.nombre?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Resumen general del sistema
        </p>
      </div>

      {/* ── Carrusel ─────────────────────────────────────────────────────── */}
      {productosConImagen.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
              🛍️ Destacados
            </h2>
            <button
              onClick={() => navigate('/productos')}
              className="text-xs"
              style={{ color: 'var(--accent)' }}
            >
              Ver catálogo →
            </button>
          </div>
          <CarruselProductos productos={productosConImagen} />
        </div>
      )}
      {/* ──────────────────────────────────────────────────────────────────── */}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Productos"       value={stats.productos} color="#0ea5e9"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
          />
          <StatCard label="Clientes"        value={stats.clientes}  color="#a78bfa"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <StatCard label="Pedidos"         value={stats.pedidos}   color="#4ade80"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <StatCard label="Ingresos totales" value={`$${stats.ingresos.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`} color="#fbbf24"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos recientes */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>Pedidos recientes</h2>
            <button onClick={() => navigate('/pedidos')} className="text-xs" style={{ color: 'var(--accent)' }}>
              Ver todos →
            </button>
          </div>
          {pedidosRecientes.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>Sin pedidos aún</p>
          ) : (
            <div className="space-y-3">
              {pedidosRecientes.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>#{p.id?.slice(-6).toUpperCase()}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(p.fecha).toLocaleDateString('es-AR')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge label={p.estado} variant={ESTADO_LABELS[p.estado]} />
                    <span className="text-sm font-mono font-semibold" style={{ color: '#4ade80' }}>
                      ${p.total?.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock bajo */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>⚠️ Stock bajo</h2>
            <button onClick={() => navigate('/stock')} className="text-xs" style={{ color: 'var(--accent)' }}>
              Gestionar →
            </button>
          </div>
          {bajoStock.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: '#4ade80' }}>✓ Todo el stock está en niveles normales</p>
          ) : (
            <div className="space-y-3">
              {bajoStock.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{s.productoId?.slice(-8)}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${Math.min((s.cantidad / (s.stockMinimo || 1)) * 100, 100)}%`, background: s.cantidad === 0 ? '#ef4444' : '#f97316' }}
                      />
                    </div>
                    <span className="text-sm font-mono font-bold" style={{ color: s.cantidad === 0 ? '#f87171' : '#fb923c' }}>
                      {s.cantidad}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}