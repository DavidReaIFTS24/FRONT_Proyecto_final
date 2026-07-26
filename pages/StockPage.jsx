import { useState, useMemo } from 'react' // Hooks básicos de React para estado y optimización de memoria.
import { useStock, useProductos } from '../hooks/useEntities' // Hooks personalizados para obtener datos de stock y productos.
import { useToast } from '../hooks/useToast' // Hook para gestionar las notificaciones emergentes (toasts).
import {
  Button, Input, Modal, Table, Td,
  Spinner, ErrorState, EmptyState,
  PageHeader, Toast, Badge,
} from '../components/ui/index.jsx' // Componentes de la librería de UI para construir la interfaz.

// ─── COMPONENTE: MODAL PARA AUMENTAR STOCK ─────────────────────────────────────
// Este componente gestiona el formulario de entrada de nueva mercadería.
function AumentarStockModal({ stock, nombreProducto, onSubmit, onCancel, loading }) {
  const [cantidad, setCantidad] = useState('') // Estado local para el valor del input.
  const [error, setError] = useState('') // Estado para manejar mensajes de validación local.

  const handleSubmit = (e) => {
    e.preventDefault() // Evita que el navegador recargue la página al enviar el form.
    const cant = Number(cantidad) // Convierte el texto del input a número.
    // Validación: que no esté vacío, que sea número, mayor a 0 y entero (no aceptamos 1.5 tornillos).
    if (!cantidad || isNaN(cant) || cant <= 0 || !Number.isInteger(cant)) {
      setError('Ingresá un número entero mayor a 0')
      return
    }
    onSubmit(cant) // Si es válido, envía la cantidad al componente padre.
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tarjeta informativa dentro del modal que muestra el estado actual del producto */}
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
          {/* El color del número cambia según si está por debajo del mínimo configurado */}
          <p className="text-2xl font-mono font-bold" style={{ color: stock.cantidad <= stock.stockMinimo ? '#f97316' : '#4ade80' }}>
            {stock.cantidad}
          </p>
        </div>
      </div>
      {/* Campo de entrada para la cantidad a agregar */}
      <Input
        label="Cantidad a agregar *"
        type="number"
        min="1"
        step="1"
        value={cantidad}
        onChange={e => { setCantidad(e.target.value); setError('') }} // Limpia el error al escribir.
        placeholder="Ej: 50"
        error={error}
        autoFocus
      />
      {/* Feedback visual: muestra cuál será el stock final antes de confirmar la acción */}
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

// ─── COMPONENTE: MODAL PARA DESCONTAR STOCK ──────────────────────────────────
function DescontarStockModal({ stock, nombreProducto, onSubmit, onCancel, loading }) {
  const [cantidad, setCantidad] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const cant = Number(cantidad)
    if (!cantidad || isNaN(cant) || cant <= 0 || !Number.isInteger(cant)) {
      setError('Ingresá un número entero mayor a 0')
      return
    }
    if (cant > stock.cantidad) {
      setError(`No podés descontar más de ${stock.cantidad} unidades`)
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
        label="Cantidad a descontar *"
        type="number"
        min="1"
        max={stock.cantidad}
        step="1"
        value={cantidad}
        onChange={e => { setCantidad(e.target.value); setError('') }}
        placeholder="Ej: 10"
        error={error}
        autoFocus
      />
      {cantidad && !error && Number(cantidad) > 0 && Number(cantidad) <= stock.cantidad && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Nuevo stock: <span className="font-mono font-bold" style={{ color: (stock.cantidad - Number(cantidad)) <= stock.stockMinimo ? '#f97316' : '#4ade80' }}>
            {stock.cantidad - Number(cantidad)}
          </span>
        </p>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button
          type="submit"
          loading={loading}
          style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
        >
          Confirmar egreso
        </Button>
      </div>
    </form>
  )
}

// ─── COMPONENTE PRINCIPAL: PÁGINA DE STOCK ────────────────────────────────────
export function StockPage() {
  // Extraemos funciones y datos del hook de stock (incluyendo la función 'aumentar' para la API).
  const { stocks, bajoStock, cargando, error, refetch, aumentar, descontar } = useStock()
  // Necesitamos los productos para poder mostrar el NOMBRE del producto en lugar de solo el ID.
  const { productos } = useProductos()
  const { toast, showToast, hideToast } = useToast()

  // Estados locales para la lógica de la UI: modales, buscador y filtros.
  const [aumentando, setAumentando]       = useState(null)
  const [descontando, setDescontando]     = useState(null) // Guarda el stock para el modal de egreso.
  const [loadingAction, setLoadingAction] = useState(false)
  const [busqueda, setBusqueda]           = useState('') // Texto del buscador.
  const [soloAlerta, setSoloAlerta]       = useState(false) // Toggle para filtrar solo productos críticos.

  // useMemo para "Enriquecer" los datos: combina la lista de stocks con la información de productos.
  const stockEnriquecido = useMemo(() => {
    return stocks.map(s => ({
      ...s,
      producto: productos.find(p => p.id === s.productoId), // Busca el objeto producto por su ID.
    }))
  }, [stocks, productos])

  // useMemo para filtrar la lista según la búsqueda del usuario o la alerta de bajo stock.
  const stockFiltrado = useMemo(() => {
    return stockEnriquecido.filter(s => {
      const nombre = s.producto?.nombre?.toLowerCase() || ''
      const matchBusqueda = !busqueda || nombre.includes(busqueda.toLowerCase()) || s.productoId?.includes(busqueda)
      const matchAlerta = !soloAlerta || s.cantidad <= s.stockMinimo // Verifica si la cantidad es menor al mínimo.
      return matchBusqueda && matchAlerta
    })
  }, [stockEnriquecido, busqueda, soloAlerta])

  // Función asíncrona que conecta con la API para actualizar el stock físicamente.
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

  const handleDescontar = async (cantidad) => {
    setLoadingAction(true)
    try {
      await descontar(descontando.productoId, cantidad)
      setDescontando(null)
      showToast(`Stock descontado correctamente`)
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al descontar stock', 'error')
    } finally { setLoadingAction(false) }
  }

  // Lógica visual: determina el color, etiqueta y variante de Badge según el nivel de stock.
  const getStockStatus = (s) => {
    if (s.cantidad === 0)                    return { label: 'agotado',  variant: 'cancelado',  color: '#f87171' }
    if (s.cantidad <= s.stockMinimo)         return { label: 'bajo',     variant: 'pendiente',  color: '#fb923c' }
    return                                          { label: 'normal',   variant: 'activo',     color: '#4ade80' }
  }

  // Calcula el ancho de la barra de progreso visual (máximo 100%).
  const getBarWidth = (s) => {
    if (!s.stockMinimo) return 100
    // Definimos el 100% de la barra como 3 veces el stock mínimo para dar contexto visual.
    const porcentaje = (s.cantidad / (s.stockMinimo * 3)) * 100
    return Math.min(porcentaje, 100)
  }

  // Renders de estado global: Carga y Error de conexión.
  if (cargando) return <Spinner />
  if (error)    return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Inventario / Stock"
        subtitle={`${stocks.length} productos · ${bajoStock.length} con alerta`}
      />

      {/* Banner de alerta: Solo se muestra si hay productos con stock bajo o agotado */}
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
          {/* Botón rápido para filtrar la tabla y ver solo los problemas */}
          <Button variant="ghost" className="ml-auto py-1 px-3 text-xs"
            onClick={() => setSoloAlerta(true)} style={{ color: '#fb923c', borderColor: 'rgba(249,115,22,0.3)' }}>
            Ver alertas
          </Button>
        </div>
      )}

      {/* Barra de herramientas: Búsqueda de texto y botón de filtro de alertas */}
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
        {/* Botón para resetear todos los filtros aplicados */}
        {(busqueda || soloAlerta) && (
          <Button variant="ghost" onClick={() => { setBusqueda(''); setSoloAlerta(false) }}>Limpiar</Button>
        )}
      </div>

      {/* Renderizado de la tabla de stock */}
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
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="py-1 px-2 text-xs"
                      onClick={() => setAumentando(s)}
                      style={s.cantidad <= s.stockMinimo ? { color: '#fb923c', borderColor: 'rgba(249,115,22,0.3)' } : {}}
                    >
                      + Ingresar
                    </Button>
                    <Button
                      variant="ghost"
                      className="py-1 px-2 text-xs"
                      onClick={() => setDescontando(s)}
                      disabled={s.cantidad === 0}
                      style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
                    >
                      − Descontar
                    </Button>
                  </div>
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

      {descontando && (
        <Modal
          title="Egreso de stock"
          onClose={() => setDescontando(null)}
          maxWidth="max-w-sm"
        >
          <DescontarStockModal
            stock={descontando}
            nombreProducto={descontando.producto?.nombre || descontando.productoId}
            onSubmit={handleDescontar}
            onCancel={() => setDescontando(null)}
            loading={loadingAction}
          />
        </Modal>
      )}

      {/* Notificación Toast global */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}