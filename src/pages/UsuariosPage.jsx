import { useState, useMemo } from 'react'
import { useUsuarios } from '../hooks/useEntities'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../context/AuthContext'
import {
  Button, Input, Select, Modal, ConfirmDialog,
  Table, Td, Spinner, ErrorState, EmptyState,
  PageHeader, Toast, Badge,
} from '../components/ui/index.jsx'

// ─── FORMULARIO DE CREACIÓN ───────────────────────────────────────────────────
function UsuarioCreateForm({ onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'empleado' })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim())    e.nombre   = 'Requerido'
    if (!form.email.trim())     e.email    = 'Requerido'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido'
    if (!form.password)         e.password = 'Requerido'
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    if (!form.rol)              e.rol      = 'Requerido'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre completo"
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder="Juan Pérez"
        error={errors.nombre}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="juan@empresa.com"
        error={errors.email}
      />
      <Input
        label="Contraseña"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Mínimo 6 caracteres"
        error={errors.password}
      />
      <Select label="Rol" name="rol" value={form.rol} onChange={handleChange} error={errors.rol}>
        <option value="empleado">Empleado</option>
        <option value="admin">Admin</option>
      </Select>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Crear usuario</Button>
      </div>
    </form>
  )
}

// ─── FORMULARIO DE EDICIÓN ────────────────────────────────────────────────────
function UsuarioForm({ inicial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    inicial ? { nombre: inicial.nombre, email: inicial.email, rol: inicial.rol } : {}
  )
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre?.trim()) e.nombre = 'Requerido'
    if (!form.email?.trim())  e.email  = 'Requerido'
    if (!form.rol)            e.rol    = 'Requerido'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nombre" name="nombre" value={form.nombre || ''} onChange={handleChange}
        placeholder="Nombre completo" error={errors.nombre} />
      <Input label="Email" name="email" type="email" value={form.email || ''} onChange={handleChange}
        placeholder="email@ejemplo.com" error={errors.email} />
      <Select label="Rol" name="rol" value={form.rol || ''} onChange={handleChange} error={errors.rol}>
        <option value="">Seleccionar rol...</option>
        <option value="admin">Admin</option>
        <option value="empleado">Empleado</option>
      </Select>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Guardar cambios</Button>
      </div>
    </form>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export function UsuariosPage() {
  // ✅ Se agrega `crear` al hook
  const { usuarios, cargando, error, refetch, crear, actualizar, eliminar } = useUsuarios()
  const { usuario: usuarioActual } = useAuth()
  const { toast, showToast, hideToast } = useToast()

  // ✅ Estado para el modal de creación
  const [modalCrear, setModalCrear]       = useState(false)
  const [editando, setEditando]           = useState(null)
  const [eliminando, setEliminando]       = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)
  const [busqueda, setBusqueda]           = useState('')
  const [filtroRol, setFiltroRol]         = useState('')

  const usuariosFiltrados = useMemo(() =>
    usuarios.filter(u => {
      const matchBusqueda = !busqueda ||
        u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email?.toLowerCase().includes(busqueda.toLowerCase())
      const matchRol = !filtroRol || u.rol === filtroRol
      return matchBusqueda && matchRol
    }), [usuarios, busqueda, filtroRol]
  )

  // ✅ Handler de creación
  const handleCrear = async (datos) => {
    setLoadingAction(true)
    try {
      await crear(datos)
      setModalCrear(false)
      showToast('Usuario creado exitosamente', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al crear usuario', 'error')
    } finally { setLoadingAction(false) }
  }

  const handleActualizar = async (datos) => {
    setLoadingAction(true)
    try {
      await actualizar(editando.id, datos)
      setEditando(null)
      showToast('Usuario actualizado')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar', 'error')
    } finally { setLoadingAction(false) }
  }

  const handleEliminar = async () => {
    setLoadingAction(true)
    try {
      await eliminar(eliminando.id)
      setEliminando(null)
      showToast('Usuario desactivado')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al eliminar', 'error')
    } finally { setLoadingAction(false) }
  }

  if (cargando) return <Spinner />
  if (error)    return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Usuarios"
        subtitle={`${usuariosFiltrados.length} de ${usuarios.length} usuarios del sistema`}
        // ✅ Botón de creación en el header
        action={
          <Button onClick={() => setModalCrear(true)}>
            + Nuevo usuario
          </Button>
        }
      />

      <div
        className="p-4 rounded-xl flex items-start gap-3"
        style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}
      >
        <span style={{ color: 'var(--accent)' }}>ℹ️</span>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Solo los administradores pueden gestionar usuarios.
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Buscar por nombre o email..." value={busqueda}
          onChange={e => setBusqueda(e.target.value)} className="max-w-xs" />
        <Select value={filtroRol} onChange={e => setFiltroRol(e.target.value)} className="max-w-xs">
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="empleado">Empleado</option>
        </Select>
        {(busqueda || filtroRol) && (
          <Button variant="ghost" onClick={() => { setBusqueda(''); setFiltroRol('') }}>Limpiar</Button>
        )}
      </div>

      {usuariosFiltrados.length === 0 ? (
        <EmptyState
          title="Sin usuarios"
          subtitle="No hay resultados para tu búsqueda"
          action={
            !busqueda && !filtroRol
              ? <Button onClick={() => setModalCrear(true)}>+ Nuevo usuario</Button>
              : null
          }
        />
      ) : (
        <Table headers={['Usuario', 'Email', 'Rol', 'Estado', 'Último acceso', 'Acciones']}>
          {usuariosFiltrados.map(u => {
            const esCuentaPropia = u.id === usuarioActual?.id
            return (
              <tr key={u.id} className="table-row">
                <Td>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: u.rol === 'admin' ? 'rgba(14,165,233,0.2)' : 'rgba(168,85,247,0.2)',
                        color: u.rol === 'admin' ? '#38bdf8' : '#c084fc',
                        border: `1px solid ${u.rol === 'admin' ? 'rgba(14,165,233,0.3)' : 'rgba(168,85,247,0.3)'}`,
                      }}
                    >
                      {u.nombre?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {u.nombre}
                        {esCuentaPropia && (
                          <span className="ml-2 text-xs font-mono" style={{ color: 'var(--accent)' }}>(vos)</span>
                        )}
                      </p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {u.id?.slice(-8)}
                      </p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <span style={{ color: 'var(--text-secondary)' }}>{u.email}</span>
                </Td>
                <Td>
                  <Badge label={u.rol} variant={u.rol} />
                </Td>
                <Td>
                  <Badge label={u.activo ? 'activo' : 'inactivo'} variant={u.activo ? 'activo' : 'inactivo'} />
                </Td>
                <Td>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    {u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleString('es-AR') : 'Nunca'}
                  </span>
                </Td>
                <Td>
                  {!esCuentaPropia && (
                    <div className="flex gap-2">
                      <Button variant="ghost" className="py-1 px-2 text-xs" onClick={() => setEditando(u)}>
                        Editar
                      </Button>
                      {u.activo && (
                        <Button variant="danger" className="py-1 px-2 text-xs" onClick={() => setEliminando(u)}>
                          Desactivar
                        </Button>
                      )}
                    </div>
                  )}
                </Td>
              </tr>
            )
          })}
        </Table>
      )}

      {/* ✅ Modal de creación */}
      {modalCrear && (
        <Modal title="Nuevo usuario" onClose={() => setModalCrear(false)} maxWidth="max-w-md">
          <UsuarioCreateForm
            onSubmit={handleCrear}
            onCancel={() => setModalCrear(false)}
            loading={loadingAction}
          />
        </Modal>
      )}

      {/* Modal de edición */}
      {editando && (
        <Modal title="Editar usuario" onClose={() => setEditando(null)} maxWidth="max-w-md">
          <UsuarioForm inicial={editando} onSubmit={handleActualizar}
            onCancel={() => setEditando(null)} loading={loadingAction} />
        </Modal>
      )}

      {/* Diálogo de confirmación de desactivación */}
      {eliminando && (
        <ConfirmDialog
          title="Desactivar usuario"
          message={`¿Desactivar la cuenta de "${eliminando.nombre}"? El usuario ya no podrá iniciar sesión.`}
          onConfirm={handleEliminar}
          onCancel={() => setEliminando(null)}
          loading={loadingAction}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
