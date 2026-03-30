import { useState, useMemo } from 'react'
import { usePedidos, useClientes, useProductos } from '../hooks/useEntities'
import { useToast } from '../hooks/useToast'
import {
  Button, Input, Select, Modal, ConfirmDialog,
  Table, Td, Spinner, ErrorState, EmptyState,
  PageHeader, Toast, Badge,
} from '../components/ui/index.jsx'

const ESTADOS = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado']

// ─── ITEM ROW in form ─────────────────────────────────────────────────────────
function ItemRow({ item, productos, onChange, onRemove }) {
  const producto = productos.find(p => p.id === item.productoId)
  return (
    <div className="flex gap-2 items-end p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
      <Select
        label="Producto"
        value={item.productoId}
        onChange={e => onChange({ ...item, productoId: e.target.value })}
        className="flex-1"
      >
        <option value="">Seleccionar...</option>
        {productos.map(p => (
          <option key={p.id} value={p.id}>{p.nombre} — ${Number(p.precio).toLocaleString()}</option>
        ))}
      </Select>
      <Input
        label="Cantidad"
        type="number"
        min="1"
        value={item.cantidad}
        onChange={e => onChange({ ...item, cantidad: Number(e.target.value) })}
        className="w-24"
      />
      {producto && (
        <div className="pb-2">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Subtotal</p>
          <p className="text-sm font-mono font-bold" style={{ color: '#4ade80' }}>
            ${(Number(producto.precio) * (item.cantidad || 0)).toLocaleString()}
          </p>
        </div>
      )}
      <Button type="button" variant="danger" className="py-2 px-2 mb-0.5" onClick={onRemove}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </Button>
    </div>
  )
}

// ─── FORM ─────────────────────────────────────────────────────────────────────
function PedidoForm({ clientes, productos, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    clienteId: '', descuento: 0, metodoPago: '', observaciones: '', direccionEntrega: '',
  })
  const [items, setItems] = useState([{ productoId: '', cantidad: 1 }])
  const [errors, setErrors] = useState({})

  const subtotal = items.reduce((acc, item) => {
    const prod = productos.find(p => p.id === item.productoId)
    return acc + (prod ? Number(prod.precio) * (item.cantidad || 0) : 0)
  }, 0)
  const total = subtotal - Number(form.descuento || 0)

  const validate = () => {
    const e = {}
    if (!form.clienteId) e.clienteId = 'Seleccioná un cliente'
    const validItems = items.filter(i => i.productoId && i.cantidad > 0)
    if (validItems.length === 0) e.items = 'Agregá al menos un producto'
    return e
  }

  const handleChangeForm = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const addItem = () => setItems(prev => [...prev, { productoId: '', cantidad: 1 }])
  const updateItem = (idx, item) => setItems(prev => prev.map((it, i) => i === idx ? item : it))
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    const itemsValidos = items.filter(i => i.productoId && i.cantidad > 0)
    onSubmit({ ...form, descuento: Number(form.descuento || 0), items: itemsValidos })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Cliente */}
      <Select label="Cliente *" name="clienteId" value={form.clienteId}
        onChange={handleChangeForm} error={errors.clienteId}>
        <option value="">Seleccionar cliente...</option>
        {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} — DNI {c.dni}</option>)}
      </Select>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Productos *
          </label>
          <Button type="button" variant="ghost" className="py-1 px-2 text-xs" onClick={addItem}>+ Agregar</Button>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <ItemRow key={idx} item={item} productos={productos}
              onChange={(updated) => updateItem(idx, updated)}
              onRemove={() => removeItem(idx)}
            />
          ))}
        </div>
        {errors.items && <p className="text-xs text-red-400 mt-1">{errors.items}</p>}
      </div>

      {/* Totals */}
      <div
        className="p-4 rounded-xl space-y-2"
        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
          <span className="font-mono" style={{ color: 'var(--text-primary)' }}>${subtotal.toLocaleString('es-AR')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Descuento</span>
          <Input type="number" min="0" name="descuento" value={form.descuento}
            onChange={handleChangeForm} className="w-32 text-right" placeholder="0" />
        </div>
        <div className="flex justify-between text-base font-bold border-t pt-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <span style={{ color: 'var(--text-primary)' }}>Total</span>
          <span className="font-mono" style={{ color: '#4ade80' }}>${total.toLocaleString('es-AR')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Método de pago" name="metodoPago" value={form.metodoPago}
          onChange={handleChangeForm} placeholder="Efectivo / Tarjeta..." />
        <Input label="Dirección de entrega" name="direccionEntrega" value={form.direccionEntrega}
          onChange={handleChangeForm} placeholder="Opcional..." />
      </div>
      <Input label="Observaciones" name="observaciones" value={form.observaciones}
        onChange={handleChangeForm} placeholder="Notas adicionales..." />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Crear pedido</Button>
      </div>
    </form>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function PedidosPage() {
  const { pedidos, cargando, error, refetch, crear, cambiarEstado, cancelar } = usePedidos()
  const { clientes } = useClientes()
  const { productos } = useProductos()
  const { toast, showToast, hideToast } = useToast()

  const [modalCrear, setModalCrear]     = useState(false)
  const [detalle, setDetalle]           = useState(null)
  const [cambiandoEstado, setCambiandoEstado] = useState(null)
  const [cancelando, setCancelando]     = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda]         = useState('')

  const pedidosFiltrados = useMemo(() => pedidos.filter(p => {
    const matchEstado = !filtroEstado || p.estado === filtroEstado
    const matchBusqueda = !busqueda || p.id?.toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchBusqueda
  }), [pedidos, filtroEstado, busqueda])

  const getNombreCliente = (id) => clientes.find(c => c.id === id)?.nombre || id?.slice(-8) || '—'

  const handleCrear = async (datos) => {
    setLoadingAction(true)
    try {
      await crear(datos)
      setModalCrear(false)
      showToast('Pedido creado exitosamente')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al crear pedido', 'error')
    } finally { setLoadingAction(false) }
  }

  const handleCambiarEstado = async (nuevoEstado) => {
    setLoadingAction(true)
    try {
      await cambiarEstado(cambiandoEstado.id, nuevoEstado)
      setCambiandoEstado(null)
      showToast('Estado actualizado')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error')
    } finally { setLoadingAction(false) }
  }

  const handleCancelar = async () => {
    setLoadingAction(true)
    try {
      await cancelar(cancelando.id)
      setCancelando(null)
      showToast('Pedido cancelado')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al cancelar', 'error')
    } finally { setLoadingAction(false) }
  }

  if (cargando) return <Spinner />
  if (error)    return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Pedidos"
        subtitle={`${pedidosFiltrados.length} de ${pedidos.length} pedidos`}
        action={
          <Button onClick={() => setModalCrear(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo pedido
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Buscar por ID..." value={busqueda}
          onChange={e => setBusqueda(e.target.value)} className="max-w-xs" />
        <Select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="max-w-xs">
          <option value="">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
        </Select>
        {(busqueda || filtroEstado) && (
          <Button variant="ghost" onClick={() => { setBusqueda(''); setFiltroEstado('') }}>Limpiar</Button>
        )}
      </div>

      {pedidosFiltrados.length === 0 ? (
        <EmptyState
          title="Sin pedidos"
          subtitle="Aún no hay pedidos registrados"
          action={<Button onClick={() => setModalCrear(true)}>Crear pedido</Button>}
        />
      ) : (
        <Table headers={['ID', 'Cliente', 'Fecha', 'Items', 'Total', 'Estado', 'Acciones']}>
          {pedidosFiltrados.map(ped => (
            <tr key={ped.id} className="table-row">
              <Td>
                <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
                  #{ped.id?.slice(-8).toUpperCase()}
                </span>
              </Td>
              <Td>
                <span style={{ color: 'var(--text-primary)' }}>{getNombreCliente(ped.clienteId)}</span>
              </Td>
              <Td>
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {ped.fecha ? new Date(ped.fecha).toLocaleDateString('es-AR') : '—'}
                </span>
              </Td>
              <Td>
                <span style={{ color: 'var(--text-secondary)' }}>{ped.items?.length || 0} ítem(s)</span>
              </Td>
              <Td>
                <span className="font-mono font-bold" style={{ color: '#4ade80' }}>
                  ${Number(ped.total || 0).toLocaleString('es-AR')}
                </span>
              </Td>
              <Td>
                <Badge label={ped.estado} variant={ped.estado} />
              </Td>
              <Td>
                <div className="flex gap-2">
                  <Button variant="ghost" className="py-1 px-2 text-xs" onClick={() => setDetalle(ped)}>Ver</Button>
                  {ped.estado !== 'cancelado' && ped.estado !== 'entregado' && (
                    <Button variant="ghost" className="py-1 px-2 text-xs" onClick={() => setCambiandoEstado(ped)}>
                      Estado
                    </Button>
                  )}
                  {(ped.estado === 'pendiente' || ped.estado === 'procesando') && (
                    <Button variant="danger" className="py-1 px-2 text-xs" onClick={() => setCancelando(ped)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {/* Create Modal */}
      {modalCrear && (
        <Modal title="Nuevo pedido" onClose={() => setModalCrear(false)} maxWidth="max-w-3xl">
          <PedidoForm clientes={clientes} productos={productos}
            onSubmit={handleCrear} onCancel={() => setModalCrear(false)} loading={loadingAction} />
        </Modal>
      )}

      {/* Detail Modal */}
      {detalle && (
        <Modal title={`Pedido #${detalle.id?.slice(-8).toUpperCase()}`} onClose={() => setDetalle(null)} maxWidth="max-w-xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p style={{ color: 'var(--text-muted)' }}>Cliente</p>
                <p style={{ color: 'var(--text-primary)' }}>{getNombreCliente(detalle.clienteId)}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)' }}>Estado</p>
                <Badge label={detalle.estado} variant={detalle.estado} />
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)' }}>Fecha</p>
                <p style={{ color: 'var(--text-primary)' }}>
                  {detalle.fecha ? new Date(detalle.fecha).toLocaleString('es-AR') : '—'}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)' }}>Método de pago</p>
                <p style={{ color: 'var(--text-primary)' }}>{detalle.metodoPago || '—'}</p>
              </div>
            </div>
            <div className="border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Productos</p>
              {detalle.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div>
                    <p style={{ color: 'var(--text-primary)' }}>{item.nombreProducto}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>x{item.cantidad} · ${Number(item.precioUnitario).toLocaleString()}</p>
                  </div>
                  <span className="font-mono font-semibold" style={{ color: '#4ade80' }}>
                    ${Number(item.subtotal).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span className="font-mono">${Number(detalle.subtotal).toLocaleString()}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Descuento</span><span className="font-mono">-${Number(detalle.descuento).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-base"><span>Total</span><span className="font-mono" style={{ color: '#4ade80' }}>${Number(detalle.total).toLocaleString()}</span></div>
            </div>
            {detalle.observaciones && (
              <p className="text-sm p-3 rounded-lg" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                📝 {detalle.observaciones}
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* Change State Modal */}
      {cambiandoEstado && (
        <Modal title="Cambiar estado" onClose={() => setCambiandoEstado(null)} maxWidth="max-w-xs">
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Estado actual: <Badge label={cambiandoEstado.estado} variant={cambiandoEstado.estado} />
          </p>
          <div className="space-y-2">
            {ESTADOS.filter(e => e !== cambiandoEstado.estado && e !== 'cancelado').map(estado => (
              <button
                key={estado}
                onClick={() => handleCambiarEstado(estado)}
                disabled={loadingAction}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                → {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {cancelando && (
        <ConfirmDialog
          title="Cancelar pedido"
          message={`¿Cancelar el pedido #${cancelando.id?.slice(-8).toUpperCase()}? El stock será devuelto.`}
          onConfirm={handleCancelar}
          onCancel={() => setCancelando(null)}
          loading={loadingAction}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
