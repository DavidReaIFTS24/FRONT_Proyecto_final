import { useState, useMemo } from 'react'
import { useProductos, useCategorias } from '../hooks/useEntities'
import { useToast } from '../hooks/useToast'
import {
  Button, Input, Select, Textarea, Modal, ConfirmDialog,
  Table, Td, Spinner, ErrorState, EmptyState,
  PageHeader, Toast, Badge,
} from '../components/ui/index.jsx'

// ─── FORM ─────────────────────────────────────────────────────────────────────
function ProductoForm({ inicial, categorias, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    inicial || { nombre: '', descripcion: '', precio: '', categoriaId: '', color: '', material: '', dimensiones: '', imagen: '' }
  )
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())     e.nombre      = 'El nombre es requerido'
    if (!form.precio || isNaN(form.precio) || Number(form.precio) <= 0) e.precio = 'Precio válido requerido'
    if (!form.categoriaId)       e.categoriaId = 'Seleccioná una categoría'
    return e
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    onSubmit({ ...form, precio: Number(form.precio) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange}
          placeholder="Ej: Silla de oficina" error={errors.nombre} />
        <Input label="Precio *" name="precio" type="number" min="0" step="0.01"
          value={form.precio} onChange={handleChange} placeholder="0.00" error={errors.precio} />
      </div>
      <Select label="Categoría *" name="categoriaId" value={form.categoriaId}
        onChange={handleChange} error={errors.categoriaId}>
        <option value="">Seleccionar categoría...</option>
        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
      </Select>
      <Textarea label="Descripción" name="descripcion" value={form.descripcion}
        onChange={handleChange} placeholder="Descripción del producto..." />
      <div className="grid grid-cols-3 gap-4">
        <Input label="Color" name="color" value={form.color} onChange={handleChange} placeholder="Ej: Negro" />
        <Input label="Material" name="material" value={form.material} onChange={handleChange} placeholder="Ej: Madera" />
        <Input label="Dimensiones" name="dimensiones" value={form.dimensiones} onChange={handleChange} placeholder="Ej: 80x60cm" />
      </div>
      <Input label="URL Imagen" name="imagen" value={form.imagen} onChange={handleChange}
        placeholder="https://..." />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{inicial ? 'Guardar cambios' : 'Crear producto'}</Button>
      </div>
    </form>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function ProductosPage() {
  const { productos, cargando, error, refetch, crear, actualizar, eliminar } = useProductos()
  const { categorias } = useCategorias()
  const { toast, showToast, hideToast } = useToast()

  const [modalCrear, setModalCrear]     = useState(false)
  const [editando, setEditando]         = useState(null)
  const [eliminando, setEliminando]     = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)
  const [busqueda, setBusqueda]         = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const matchBusqueda = p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
      const matchCat = !filtroCategoria || p.categoriaId === filtroCategoria
      return matchBusqueda && matchCat
    })
  }, [productos, busqueda, filtroCategoria])

  const handleCrear = async (datos) => {
    setLoadingAction(true)
    try {
      await crear(datos)
      setModalCrear(false)
      showToast('Producto creado exitosamente')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al crear', 'error')
    } finally { setLoadingAction(false) }
  }

  const handleActualizar = async (datos) => {
    setLoadingAction(true)
    try {
      await actualizar(editando.id, datos)
      setEditando(null)
      showToast('Producto actualizado')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar', 'error')
    } finally { setLoadingAction(false) }
  }

  const handleEliminar = async () => {
    setLoadingAction(true)
    try {
      await eliminar(eliminando.id)
      setEliminando(null)
      showToast('Producto eliminado')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al eliminar', 'error')
    } finally { setLoadingAction(false) }
  }

  const getNombreCategoria = (id) => categorias.find(c => c.id === id)?.nombre || '—'

  if (cargando) return <Spinner />
  if (error)    return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Productos"
        subtitle={`${productosFiltrados.length} de ${productos.length} productos`}
        action={
          <Button onClick={() => setModalCrear(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo producto
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={filtroCategoria}
          onChange={e => setFiltroCategoria(e.target.value)}
          className="max-w-xs"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </Select>
        {(busqueda || filtroCategoria) && (
          <Button variant="ghost" onClick={() => { setBusqueda(''); setFiltroCategoria('') }}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {productosFiltrados.length === 0 ? (
        <EmptyState
          title="Sin productos"
          subtitle={busqueda ? 'No hay resultados para tu búsqueda' : 'Creá el primer producto'}
          action={!busqueda && <Button onClick={() => setModalCrear(true)}>Crear producto</Button>}
        />
      ) : (
        <Table headers={['Producto', 'Categoría', 'Precio', 'Color / Material', 'Stock', 'Acciones']}>
          {productosFiltrados.map(prod => (
            <tr key={prod.id} className="table-row">
              <Td>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{prod.nombre}</p>
                  {prod.descripcion && (
                    <p className="text-xs truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
                      {prod.descripcion}
                    </p>
                  )}
                </div>
              </Td>
              <Td>
                <Badge label={getNombreCategoria(prod.categoriaId)} variant="procesando" />
              </Td>
              <Td>
                <span className="font-mono font-semibold" style={{ color: '#4ade80' }}>
                  ${Number(prod.precio || 0).toLocaleString('es-AR')}
                </span>
              </Td>
              <Td>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {[prod.color, prod.material].filter(Boolean).join(' · ') || '—'}
                </span>
              </Td>
              <Td>
                <span className="font-mono font-bold" style={{ color: prod.stock === 0 ? '#f87171' : prod.stock <= 5 ? '#fb923c' : '#4ade80' }}>
                  {prod.stock ?? '—'}
                </span>
              </Td>
              <Td>
                <div className="flex gap-2">
                  <Button variant="ghost" className="py-1 px-2 text-xs" onClick={() => setEditando(prod)}>
                    Editar
                  </Button>
                  <Button variant="danger" className="py-1 px-2 text-xs" onClick={() => setEliminando(prod)}>
                    Eliminar
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {modalCrear && (
        <Modal title="Nuevo producto" onClose={() => setModalCrear(false)} maxWidth="max-w-2xl">
          <ProductoForm categorias={categorias} onSubmit={handleCrear} onCancel={() => setModalCrear(false)} loading={loadingAction} />
        </Modal>
      )}
      {editando && (
        <Modal title="Editar producto" onClose={() => setEditando(null)} maxWidth="max-w-2xl">
          <ProductoForm inicial={editando} categorias={categorias} onSubmit={handleActualizar} onCancel={() => setEditando(null)} loading={loadingAction} />
        </Modal>
      )}
      {eliminando && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Eliminar "${eliminando.nombre}"? El registro quedará inactivo.`}
          onConfirm={handleEliminar}
          onCancel={() => setEliminando(null)}
          loading={loadingAction}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
