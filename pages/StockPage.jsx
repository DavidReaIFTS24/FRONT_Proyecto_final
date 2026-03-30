import { useState, useMemo } from 'react'
import { useStock, useProductos } from '../hooks/useEntities'
import { useToast } from '../hooks/useToast'
import {
  Button, Input, Modal, Table, Td,
  Spinner, ErrorState, EmptyState,
  PageHeader, Toast, Badge,
} from '../components/ui/index.jsx'

// ─── AUMENTAR STOCK MODAL ─────────────────────────────────────────────────────
function AumentarStockModal({ stock, nombreProducto, onSubmit, onCancel, loading }) {
  const [cantidad, setCantidad] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const cant = Number(cantidad)
    if (!cantidad || isNaN(cant) || cant <= 0 || !Number.isInteger(cant)) {
      setError('Ingresá un número entero mayor a 0')
      return
    }
    onSubmit(cant)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className="p-4 rounded-xl flex items-center justify-between"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Producto</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{nombreProducto}</p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Stock actual</p>
          <p className="text-2xl font-mono font-bold" style={{ color: stock.cantidad <= stock.stockMinimo ? '#f97316' : '#4ade80' }}>
            {stock.cantidad}
          </p>
        </div>
      </div>
      <Input
        label="Cantidad a agregar *"
        type="number"
        min="1"
        step="1"
        value={cantidad}
        onChange={e => { setCantidad(e.target.value); setError('') }}
        placeholder="Ej: 50"
        error={error}
        autoFocus
      />
      {cantidad && !error && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Nuevo stock: <span className="font-mono font-bold" style={{ color: '#4ade80' }}>
            {stock.cantidad + Number(cantidad)}
          </span>
        </p>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Confirmar ingreso</Button>
      </div>
    </form>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function StockPage() {
  const { stocks, bajoStock, cargando, error, refetch, aumentar } = useStock()
  const { productos } = useProductos()
  const { toast, showToast, hideToast } = useToast()

  const [aumentando, setAumentando]       = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)
  const [busqueda, setBusqueda]           = useState('')
  const [soloAlerta, setSoloAlerta]       = useState(false)

  const stockEnriquecido = useMemo(() => {
    return stocks.map(s => ({
      ...s,
      producto: productos.find(p => p.id === s.productoId),
    }))
  }, [stocks, productos])

  const stockFiltrado = useMemo(() => {
    return stockEnriquecido.filter(s => {
      const nombre = s.producto?.nombre?.toLowerCase() || ''
      const matchBusqueda = !busqueda || nombre.includes(busqueda.toLowerCase()) || s.productoId?.includes(busqueda)
      const matchAlerta = !soloAlerta || s.cantidad <= s.stockMinimo
      return matchBusqueda && matchAlerta
    })
  }, [stockEnriquecido, busqueda, soloAlerta])

  const handleAumentar = async (cantidad) => {
    setLoadingAction(true)
    try {
      await aumentar(aumentando.productoId, cantidad)
      setAumentando(null)
      showToast(`Stock actualizado correctamente`)
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar stock', 'error')
    } finally { setLoadingAction(false) }
  }

  const getStockStatus = (s) => {
    if (s.cantidad === 0)                    return { label: 'agotado',  variant: 'cancelado',  color: '#f87171' }
    if (s.cantidad <= s.stockMinimo)         return { label: 'bajo',     variant: 'pendiente',  color: '#fb923c' }
    return                                          { label: 'normal',   variant: 'activo',     color: '#4ade80' }
  }

  const getBarWidth = (s) => {
    if (!s.stockMinimo) return 100
    const porcentaje = (s.cantidad / (s.stockMinimo * 3)) * 100
    return Math.min(porcentaje, 100)
  }

  if (cargando) return <Spinner />
  if (error)    return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Inventario / Stock"
        subtitle={`${stocks.length} productos · ${bajoStock.length} con alerta`}
      />

      {/* Alert banner */}
      {bajoStock.length > 0 && (
        <div
          className="p-4 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}
        >
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#fb923c' }}>
              {bajoStock.length} producto{bajoStock.length !== 1 ? 's' : ''} con stock bajo
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Revisá el inventario para evitar quiebres de stock
            </p>
          </div>
          <Button variant="ghost" className="ml-auto py-1 px-3 text-xs"
            onClick={() => setSoloAlerta(true)} style={{ color: '#fb923c', borderColor: 'rgba(249,115,22,0.3)' }}>
            Ver alertas
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <Input placeholder="Buscar producto..." value={busqueda}
          onChange={e => setBusqueda(e.target.value)} className="max-w-xs" />
        <button
          onClick={() => setSoloAlerta(prev => !prev)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: soloAlerta ? 'rgba(249,115,22,0.15)' : 'var(--bg-card)',
            border: `1px solid ${soloAlerta ? 'rgba(249,115,22,0.4)' : 'var(--border-subtle)'}`,
            color: soloAlerta ? '#fb923c' : 'var(--text-secondary)',
          }}
        >
          <span>⚠️</span> Solo alertas
        </button>
        {(busqueda || soloAlerta) && (
          <Button variant="ghost" onClick={() => { setBusqueda(''); setSoloAlerta(false) }}>Limpiar</Button>
        )}
      </div>

      {stockFiltrado.length === 0 ? (
        <EmptyState title="Sin resultados" subtitle="No hay registros de stock que coincidan con tu búsqueda" />
      ) : (
        <Table headers={['Producto', 'Stock actual', 'Mínimo', 'Nivel', 'Estado', 'Acciones']}>
          {stockFiltrado.map(s => {
            const status = getStockStatus(s)
            return (
              <tr key={s.id} className="table-row">
                <Td>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {s.producto?.nombre || '—'}
                    </p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {s.productoId?.slice(-8)}
                    </p>
                  </div>
                </Td>
                <Td>
                  <span
                    className="text-xl font-mono font-bold"
                    style={{ color: status.color }}
                  >
                    {s.cantidad}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {s.stockMinimo}
                  </span>
                </Td>
                <Td>
                  <div className="w-24">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${getBarWidth(s)}%`, background: status.color }}
                      />
                    </div>
                  </div>
                </Td>
                <Td>
                  <Badge label={status.label} variant={
                    status.label === 'normal' ? 'activo' :
                    status.label === 'bajo' ? 'pendiente' : 'cancelado'
                  } />
                </Td>
                <Td>
                  <Button
                    variant="ghost"
                    className="py-1 px-2 text-xs"
                    onClick={() => setAumentando(s)}
                    style={s.cantidad <= s.stockMinimo ? { color: '#fb923c', borderColor: 'rgba(249,115,22,0.3)' } : {}}
                  >
                    + Ingresar stock
                  </Button>
                </Td>
              </tr>
            )
          })}
        </Table>
      )}

      {aumentando && (
        <Modal
          title="Ingreso de stock"
          onClose={() => setAumentando(null)}
          maxWidth="max-w-sm"
        >
          <AumentarStockModal
            stock={aumentando}
            nombreProducto={aumentando.producto?.nombre || aumentando.productoId}
            onSubmit={handleAumentar}
            onCancel={() => setAumentando(null)}
            loading={loadingAction}
          />
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
