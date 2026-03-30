import { useState } from 'react'
import { useCategorias } from '../hooks/useEntities'
import { useToast } from '../hooks/useToast'
import {
  Button, Input, Textarea, Modal, ConfirmDialog,
  Table, Td, Spinner, ErrorState, EmptyState,
  PageHeader, Toast, Badge,
} from '../components/ui/index.jsx'

// ─── FORM ─────────────────────────────────────────────────────────────────────
function CategoriaForm({ inicial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(inicial || { nombre: '', descripcion: '' })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
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
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre *"
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder="Ej: Muebles de madera"
        error={errors.nombre}
      />
      <Textarea
        label="Descripción"
        name="descripcion"
        value={form.descripcion}
        onChange={handleChange}
        placeholder="Descripción opcional..."
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>
          {inicial ? 'Guardar cambios' : 'Crear categoría'}
        </Button>
      </div>
    </form>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function CategoriasPage() {
  const { categorias, cargando, error, refetch, crear, actualizar, eliminar } = useCategorias()
  const { toast, showToast, hideToast } = useToast()

  const [modalCrear, setModalCrear]   = useState(false)
  const [editando, setEditando]       = useState(null)
  const [eliminando, setEliminando]   = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)

  const handleCrear = async (datos) => {
    setLoadingAction(true)
    try {
      await crear(datos)
      setModalCrear(false)
      showToast('Categoría creada exitosamente')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al crear', 'error')
    } finally { setLoadingAction(false) }
  }

  const handleActualizar = async (datos) => {
    setLoadingAction(true)
    try {
      await actualizar(editando.id, datos)
      setEditando(null)
      showToast('Categoría actualizada')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar', 'error')
    } finally { setLoadingAction(false) }
  }

  const handleEliminar = async () => {
    setLoadingAction(true)
    try {
      await eliminar(eliminando.id)
      setEliminando(null)
      showToast('Categoría eliminada')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al eliminar', 'error')
    } finally { setLoadingAction(false) }
  }

  if (cargando) return <Spinner />
  if (error)    return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Categorías"
        subtitle={`${categorias.length} categorías registradas`}
        action={
          <Button onClick={() => setModalCrear(true)}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva categoría
          </Button>
        }
      />

      {categorias.length === 0 ? (
        <EmptyState
          title="Sin categorías"
          subtitle="Creá la primera categoría para organizar tus productos"
          action={<Button onClick={() => setModalCrear(true)}>Crear categoría</Button>}
        />
      ) : (
        <Table headers={['Nombre', 'Descripción', 'Estado', 'Creada', 'Acciones']}>
          {categorias.map(cat => (
            <tr key={cat.id} className="table-row">
              <Td>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.nombre}</span>
              </Td>
              <Td>
                <span style={{ color: 'var(--text-secondary)' }}>{cat.descripcion || '—'}</span>
              </Td>
              <Td>
                <Badge label={cat.activa ? 'activa' : 'inactiva'} variant={cat.activa ? 'activo' : 'inactivo'} />
              </Td>
              <Td>
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {cat.fechaCreacion ? new Date(cat.fechaCreacion).toLocaleDateString('es-AR') : '—'}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="py-1 px-2 text-xs" onClick={() => setEditando(cat)}>
                    Editar
                  </Button>
                  <Button variant="danger" className="py-1 px-2 text-xs" onClick={() => setEliminando(cat)}>
                    Eliminar
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {modalCrear && (
        <Modal title="Nueva categoría" onClose={() => setModalCrear(false)}>
          <CategoriaForm onSubmit={handleCrear} onCancel={() => setModalCrear(false)} loading={loadingAction} />
        </Modal>
      )}

      {editando && (
        <Modal title="Editar categoría" onClose={() => setEditando(null)}>
          <CategoriaForm inicial={editando} onSubmit={handleActualizar} onCancel={() => setEditando(null)} loading={loadingAction} />
        </Modal>
      )}

      {eliminando && (
        <ConfirmDialog
          title="Eliminar categoría"
          message={`¿Estás seguro de eliminar "${eliminando.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={handleEliminar}
          onCancel={() => setEliminando(null)}
          loading={loadingAction}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
