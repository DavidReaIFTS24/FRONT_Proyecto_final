import { useState, useMemo } from 'react'
import { useClientes } from '../hooks/useEntities'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../context/AuthContext'
import {
  Button, Input, Modal, ConfirmDialog,
  Table, Td, Spinner, ErrorState, EmptyState,
  PageHeader, Toast, Badge,
} from '../components/ui/index.jsx'

// ─── FORM ─────────────────────────────────────────────────────────────────────
function ClienteForm({ inicial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    inicial || { nombre: '', email: '', dni: '', telefono: '', direccion: '' }
  )
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email válido requerido'
    if (!form.dni.trim()) e.dni = 'El DNI es requerido'
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
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nombre completo *" name="nombre" value={form.nombre}
          onChange={handleChange} placeholder="Juan García" error={errors.nombre} />
        <Input label="DNI *" name="dni" value={form.dni}
          onChange={handleChange} placeholder="12345678" error={errors.dni} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email *" name="email" type="email" value={form.email}
          onChange={handleChange} placeholder="juan@email.com" error={errors.email} />
        <Input label="Teléfono" name="telefono" value={form.telefono}
          onChange={handleChange} placeholder="+54 11 1234-5678" />
      </div>
      <Input label="Dirección" name="direccion" value={form.direccion}
        onChange={handleChange} placeholder="Av. Corrientes 1234, CABA" />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{inicial ? 'Guardar cambios' : 'Crear cliente'}</Button>
      </div>
    </form>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function ClientesPage() {
  const { clientes, cargando, error, refetch, crear, actualizar, eliminar } = useClientes()
  const { usuario } = useAuth()
  const { toast, showToast, hideToast } = useToast()
  const esAdmin = usuario?.rol === 'admin'

  const [modalCrear, setModalCrear]     = useState(false)
  const [editando, setEditando]         = useState(null)
  const [eliminando, setEliminando]     = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)
  const [busqueda, setBusqueda]         = useState('')

  const clientesFiltrados = useMemo(() =>
    clientes.filter(c =>
      c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.dni?.includes(busqueda)
    ), [clientes, busqueda]
  )

  const handleCrear = async (datos) => {
    setLoadingAction(true)
    try {
      await crear(datos)
      setModalCrear(false)
      showToast('Cliente creado exitosamente')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al crear', 'error')
    } finally { setLoadingAction(false) }
  }

  const handleActualizar = async (datos) => {
    setLoadingAction(true)
    try {
      await actualizar(editando.id, datos)
      setEditando(null)
      showToast('Cliente actualizado')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar', 'error')
    } finally { setLoadingAction(false) }
  }

  const handleEliminar = async () => {
    setLoadingAction(true)
    try {
      await eliminar(eliminando.id)
      setEliminando(null)
      showToast('Cliente eliminado')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al eliminar', 'error')
    } finally { setLoadingAction(false) }
  }

  if (cargando) return <Spinner />
  if (error)    return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Clientes"
        subtitle={`${clientesFiltrados.length} de ${clientes.length} clientes activos`}
        action={
          esAdmin ? (
            <Button onClick={() => setModalCrear(true)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo cliente
            </Button>
          ) : null
        }
      />

      {/* Search */}
      <div className="flex gap-3">
        <Input
          placeholder="Buscar por nombre, email o DNI..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="max-w-sm"
        />
        {busqueda && (
          <Button variant="ghost" onClick={() => setBusqueda('')}>Limpiar</Button>
        )}
      </div>

      {clientesFiltrados.length === 0 ? (
        <EmptyState
          title="Sin clientes"
          subtitle={busqueda ? 'No hay resultados' : 'Registrá el primer cliente'}
          action={!busqueda && esAdmin && <Button onClick={() => setModalCrear(true)}>Crear cliente</Button>}
        />
      ) : (
        <Table headers={['Cliente', 'DNI', 'Contacto', 'Dirección', 'Estado', 'Acciones']}>
          {clientesFiltrados.map(cli => (
            <tr key={cli.id} className="table-row">
              <Td>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--border-accent)' }}
                  >
                    {cli.nombre?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cli.nombre}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {cli.fechaRegistro ? new Date(cli.fechaRegistro).toLocaleDateString('es-AR') : ''}
                    </p>
                  </div>
                </div>
              </Td>
              <Td>
                <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{cli.dni}</span>
              </Td>
              <Td>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{cli.email}</p>
                  {cli.telefono && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cli.telefono}</p>}
                </div>
              </Td>
              <Td>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{cli.direccion || '—'}</span>
              </Td>
              <Td>
                <Badge label={cli.activo ? 'activo' : 'inactivo'} variant={cli.activo ? 'activo' : 'inactivo'} />
              </Td>
              <Td>
                {esAdmin && (
                  <div className="flex gap-2">
                    <Button variant="ghost" className="py-1 px-2 text-xs" onClick={() => setEditando(cli)}>Editar</Button>
                    <Button variant="danger" className="py-1 px-2 text-xs" onClick={() => setEliminando(cli)}>Eliminar</Button>
                  </div>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {modalCrear && (
        <Modal title="Nuevo cliente" onClose={() => setModalCrear(false)} maxWidth="max-w-xl">
          <ClienteForm onSubmit={handleCrear} onCancel={() => setModalCrear(false)} loading={loadingAction} />
        </Modal>
      )}
      {editando && (
        <Modal title="Editar cliente" onClose={() => setEditando(null)} maxWidth="max-w-xl">
          <ClienteForm inicial={editando} onSubmit={handleActualizar} onCancel={() => setEditando(null)} loading={loadingAction} />
        </Modal>
      )}
      {eliminando && (
        <ConfirmDialog
          title="Eliminar cliente"
          message={`¿Eliminar a "${eliminando.nombre}"? Quedará marcado como inactivo.`}
          onConfirm={handleEliminar}
          onCancel={() => setEliminando(null)}
          loading={loadingAction}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
