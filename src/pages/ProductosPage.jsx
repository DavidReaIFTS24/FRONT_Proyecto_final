import { useState, useMemo } from 'react'
import { useProductos, useCategorias } from '../hooks/useEntities'
import { useToast } from '../hooks/useToast'
import { imagenesApi } from '../api/entities.api'
import {
  Button, Input, Select, Textarea, Modal, ConfirmDialog,
  Table, Td, Spinner, ErrorState, EmptyState,
  PageHeader, Toast, Badge,
} from '../components/ui/index.jsx'

// ─── FORMULARIO DE PRODUCTO ───────────────────────────────────────────────────
function ProductoForm({ inicial, categorias, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    inicial || {
      nombre: '', descripcion: '', precio: '', categoriaId: '',
      color: '', material: '', dimensiones: '', imagen: '', imagenPublicId: '',
    }
  )
  const [errors, setErrors]           = useState({})
  const [subiendoImagen, setSubiendo] = useState(false)
  const [errorImagen, setErrorImagen] = useState('')
  const [uploadProgress, setProgress] = useState(0)

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())   e.nombre      = 'El nombre es requerido'
    if (!form.precio || isNaN(form.precio) || Number(form.precio) <= 0)
                               e.precio      = 'Precio válido requerido'
    if (!form.categoriaId)     e.categoriaId = 'Seleccioná una categoría'
    return e
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleImagenChange = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return

    if (archivo.size > 5 * 1024 * 1024) {
      setErrorImagen('La imagen no puede superar 5 MB')
      return
    }

    setErrorImagen('')
    setSubiendo(true)
    setProgress(0)

    // Simula progreso visual mientras sube
    const timer = setInterval(() => setProgress(p => Math.min(p + 15, 85)), 200)

    try {
      const res = await imagenesApi.upload(archivo)
      const { url, public_id } = res.data.data
      setForm(prev => ({ ...prev, imagen: url, imagenPublicId: public_id }))
      setProgress(100)
    } catch (err) {
      setErrorImagen('Error al subir la imagen. Intentá de nuevo.')
      console.error(err)
    } finally {
      clearInterval(timer)
      setSubiendo(false)
    }
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
          placeholder="Ej: Billetera de cuero" error={errors.nombre} />
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
        <Input label="Color"      name="color"       value={form.color}       onChange={handleChange} placeholder="Ej: Negro" />
        <Input label="Material"   name="material"    value={form.material}    onChange={handleChange} placeholder="Ej: Cuero" />
        <Input label="Dimensiones" name="dimensiones" value={form.dimensiones} onChange={handleChange} placeholder="Ej: 20x10cm" />
      </div>

      {/* ── Subida de imagen a Cloudinary ─────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Imagen del producto
        </label>

        <div className="flex items-start gap-4">
          {/* Preview */}
          <div
            className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}
          >
            {form.imagen ? (
              <img src={form.imagen} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">📦</span>
            )}
          </div>

          <div className="flex-1 space-y-2">
            {/* Botón de carga */}
            <label
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-all"
              style={{
                borderColor:  subiendoImagen ? 'var(--accent)' : 'var(--border-subtle)',
                color:        subiendoImagen ? 'var(--accent)' : 'var(--text-secondary)',
                background:   'var(--bg-secondary)',
                opacity:      subiendoImagen ? 0.8 : 1,
              }}
            >
              {subiendoImagen ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Subiendo a Cloudinary...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {form.imagen ? 'Cambiar imagen' : 'Subir imagen'}
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImagenChange}
                disabled={subiendoImagen}
              />
            </label>

            {/* Barra de progreso */}
            {subiendoImagen && (
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%`, background: 'var(--accent)' }}
                />
              </div>
            )}

            {errorImagen && (
              <p className="text-xs" style={{ color: '#f87171' }}>⚠ {errorImagen}</p>
            )}

            {form.imagen && !subiendoImagen && (
              <p className="text-xs" style={{ color: '#4ade80' }}>
                ✓ Imagen subida a Cloudinary
              </p>
            )}

            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              JPG, PNG, WebP · Máx. 5 MB · Se optimiza automáticamente
            </p>
          </div>
        </div>
      </div>
      {/* ──────────────────────────────────────────────────────────────────── */}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading || subiendoImagen}>
          {inicial ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}

// ─── PÁGINA DE PRODUCTOS ──────────────────────────────────────────────────────
export function ProductosPage() {
  const { productos, cargando, error, refetch, crear, actualizar, eliminar } = useProductos()
  const { categorias } = useCategorias()
  const { toast, showToast, hideToast } = useToast()

  const [modalCrear, setModalCrear]           = useState(false)
  const [editando, setEditando]               = useState(null)
  const [eliminando, setEliminando]           = useState(null)
  const [loadingAction, setLoadingAction]     = useState(false)
  const [busqueda, setBusqueda]               = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const matchBusqueda = p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
      const matchCat      = !filtroCategoria || p.categoriaId === filtroCategoria
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
      // Si el producto tiene imagen en Cloudinary, la eliminamos también
      if (eliminando.imagenPublicId) {
        await imagenesApi.delete(eliminando.imagenPublicId).catch(() => {
          // Si falla el borrado en Cloudinary, no bloqueamos la eliminación del producto
          console.warn('No se pudo eliminar la imagen de Cloudinary')
        })
      }
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

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="max-w-xs">
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </Select>
        {(busqueda || filtroCategoria) && (
          <Button variant="ghost" onClick={() => { setBusqueda(''); setFiltroCategoria('') }}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Tabla */}
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
              {/* Producto: miniatura Cloudinary + nombre */}
              <Td>
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}
                  >
                    {prod.imagen ? (
                      <img
                        src={prod.imagen}
                        alt={prod.nombre}
                        className="w-full h-full object-cover"
                        onError={e => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <span style={{ display: prod.imagen ? 'none' : 'flex' }} className="text-xl">📦</span>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{prod.nombre}</p>
                    {prod.descripcion && (
                      <p className="text-xs truncate max-w-[180px]" style={{ color: 'var(--text-muted)' }}>
                        {prod.descripcion}
                      </p>
                    )}
                  </div>
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
                <span className="font-mono font-bold"
                  style={{ color: prod.stock === 0 ? '#f87171' : prod.stock <= 5 ? '#fb923c' : '#4ade80' }}>
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