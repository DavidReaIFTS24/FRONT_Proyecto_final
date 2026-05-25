import { useState, useMemo } from 'react' // Hooks de React: useState para manejar datos locales y useMemo para optimizar cálculos.
import { useUsuarios } from '../hooks/useEntities' // Hook personalizado para realizar peticiones CRUD a la API de usuarios.
import { useToast } from '../hooks/useToast' // Hook para controlar las notificaciones emergentes (toasts).
import { useAuth } from '../context/AuthContext' // Contexto global para saber quién es el usuario logueado actualmente.
import {
  Button, Input, Select, Modal, ConfirmDialog,
  Table, Td, Spinner, ErrorState, EmptyState,
  PageHeader, Toast, Badge,
} from '../components/ui/index.jsx' // Importación masiva de componentes de la librería de UI interna.

// ─── COMPONENTE: FORMULARIO DE EDICIÓN ──────────────────────────────────────────
// Este componente recibe: el usuario inicial, la función al enviar, la de cancelar y el estado de carga.
function UsuarioForm({ inicial, onSubmit, onCancel, loading }) {
  // Estado 'form': Se inicializa con los datos del usuario (nombre, email, rol) si existen.
  const [form, setForm] = useState(
    inicial ? { nombre: inicial.nombre, email: inicial.email, rol: inicial.rol } : {}
  )
  // Estado 'errors': Guarda mensajes de error de validación (ej: "Requerido").
  const [errors, setErrors] = useState({})

  // Función que se ejecuta cada vez que el usuario escribe en un campo de texto o cambia el select.
  const handleChange = (e) => {
    // Actualiza la propiedad del objeto 'form' correspondiente al 'name' del input.
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    // Limpia el mensaje de error de ese campo específico mientras el usuario escribe.
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  // Función de validación manual antes de enviar al servidor.
  const validate = () => {
    const e = {}
    if (!form.nombre?.trim()) e.nombre = 'Requerido' // Valida que el nombre no esté vacío.
    if (!form.email?.trim())  e.email  = 'Requerido' // Valida que el email no esté vacío.
    if (!form.rol)            e.rol    = 'Requerido' // Valida que se haya seleccionado un rol.
    return e
  }

  // Manejador del evento 'submit' del formulario.
  const handleSubmit = (e) => {
    e.preventDefault() // Evita que el navegador recargue la página.
    const e2 = validate() // Ejecuta la validación.
    if (Object.keys(e2).length) { setErrors(e2); return } // Si hay errores, los guarda en el estado y detiene el envío.
    onSubmit(form) // Si es válido, llama a la función 'onSubmit' pasada por el padre.
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Inputs controlados: el valor depende del estado 'form' y los cambios se envían a 'handleChange' */}
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
        {/* Botón de cancelar: cierra el formulario sin hacer nada */}
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        {/* Botón de enviar: muestra un spinner si 'loading' es true */}
        <Button type="submit" loading={loading}>Guardar cambios</Button>
      </div>
    </form>
  )
}

// ─── COMPONENTE: PÁGINA PRINCIPAL DE USUARIOS ──────────────────────────────────
export function UsuariosPage() {
  // Desestructuración de funciones y datos del hook de la entidad Usuarios.
  const { usuarios, cargando, error, refetch, actualizar, eliminar } = useUsuarios()
  // Extraemos el usuario actual del contexto de autenticación para aplicar reglas de negocio.
  const { usuario: usuarioActual } = useAuth()
  // Funciones para manejar la lógica de las notificaciones (toasts).
  const { toast, showToast, hideToast } = useToast()

  // Estados para controlar qué usuario está siendo editado o eliminado en ese momento.
  const [editando, setEditando]         = useState(null)
  const [eliminando, setEliminando]     = useState(null)
  // Estado para bloquear botones mientras se realiza una operación asíncrona.
  const [loadingAction, setLoadingAction] = useState(false)
  // Estados para los filtros de búsqueda y rol.
  const [busqueda, setBusqueda]         = useState('')
  const [filtroRol, setFiltroRol]       = useState('')

  // useMemo: Filtra la lista de usuarios solo cuando cambia la lista original, la búsqueda o el filtro de rol.
  const usuariosFiltrados = useMemo(() =>
    usuarios.filter(u => {
      // Comprueba si el texto de búsqueda coincide con el nombre o el email.
      const matchBusqueda = !busqueda ||
        u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email?.toLowerCase().includes(busqueda.toLowerCase())
      // Comprueba si el rol del usuario coincide con el seleccionado en el filtro.
      const matchRol = !filtroRol || u.rol === filtroRol
      return matchBusqueda && matchRol
    }), [usuarios, busqueda, filtroRol]
  )

  // Función para guardar los cambios de un usuario editado.
  const handleActualizar = async (datos) => {
    setLoadingAction(true) // Activa estado de carga.
    try {
      await actualizar(editando.id, datos) // Llama a la API para actualizar.
      setEditando(null) // Cierra el modal de edición.
      showToast('Usuario actualizado') // Muestra éxito.
    } catch (err) {
      // Maneja errores de la API y muestra el mensaje que venga del servidor.
      showToast(err.response?.data?.message || 'Error al actualizar', 'error')
    } finally { setLoadingAction(false) } // Desactiva carga pase lo que pase.
  }

  // Función para desactivar un usuario.
  const handleEliminar = async () => {
    setLoadingAction(true)
    try {
      await eliminar(eliminando.id) // Llama a la API para borrar/desactivar.
      setEliminando(null) // Cierra el diálogo de confirmación.
      showToast('Usuario desactivado')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al eliminar', 'error')
    } finally { setLoadingAction(false) }
  }

  // Si la API aún está cargando la lista inicial, muestra un Spinner.
  if (cargando) return <Spinner />
  // Si la API devolvió un error, muestra una pantalla de error con botón de reintento.
  if (error)    return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado de la página con el título y el contador de usuarios filtrados */}
      <PageHeader
        title="Usuarios"
        subtitle={`${usuariosFiltrados.length} de ${usuarios.length} usuarios del sistema`}
      />

      {/* Banner decorativo e informativo sobre permisos */}
      <div
        className="p-4 rounded-xl flex items-start gap-3"
        style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)' }}
      >
        <span style={{ color: 'var(--accent)' }}>ℹ️</span>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Solo los administradores pueden gestionar usuarios.
        </p>
      </div>

      {/* Sección de Filtros: Buscador de texto y selector de Rol */}
      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Buscar por nombre o email..." value={busqueda}
          onChange={e => setBusqueda(e.target.value)} className="max-w-xs" />
        <Select value={filtroRol} onChange={e => setFiltroRol(e.target.value)} className="max-w-xs">
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="empleado">Empleado</option>
        </Select>
        {/* Botón para limpiar filtros, solo visible si hay algo escrito o seleccionado */}
        {(busqueda || filtroRol) && (
          <Button variant="ghost" onClick={() => { setBusqueda(''); setFiltroRol('') }}>Limpiar</Button>
        )}
      </div>

      {/* Lógica para mostrar la tabla o un estado vacío si no hay resultados */}
      {usuariosFiltrados.length === 0 ? (
        <EmptyState title="Sin usuarios" subtitle="No hay resultados para tu búsqueda" />
      ) : (
        <Table headers={['Usuario', 'Email', 'Rol', 'Estado', 'Último acceso', 'Acciones']}>
          {usuariosFiltrados.map(u => {
            // Variable booleana para saber si la fila que estamos renderizando es la del usuario actual.
            const esCuentaPropia = u.id === usuarioActual?.id
            return (
              <tr key={u.id} className="table-row">
                <Td>
                  <div className="flex items-center gap-3">
                    {/* Avatar circular con la inicial del nombre y color dinámico según el rol */}
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
                        {/* Pequeña etiqueta "vos" para identificar al usuario logueado */}
                        {esCuentaPropia && (
                          <span className="ml-2 text-xs font-mono" style={{ color: 'var(--accent)' }}>(vos)</span>
                        )}
                      </p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {u.id?.slice(-8)} {/* Muestra solo el final del ID para no ocupar espacio */}
                      </p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <span style={{ color: 'var(--text-secondary)' }}>{u.email}</span>
                </Td>
                <Td>
                  {/* Badge que cambia de estilo visual según el valor del rol */}
                  <Badge label={u.rol} variant={u.rol} />
                </Td>
                <Td>
                  {/* Badge para mostrar si la cuenta está activa o inactiva */}
                  <Badge label={u.activo ? 'activo' : 'inactivo'} variant={u.activo ? 'activo' : 'inactivo'} />
                </Td>
                <Td>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    {/* Formateo de fecha de último acceso */}
                    {u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleString('es-AR') : 'Nunca'}
                  </span>
                </Td>
                <Td>
                  {/* Impedir que un usuario se edite o desactive a sí mismo desde esta lista */}
                  {!esCuentaPropia && (
                    <div className="flex gap-2">
                      {/* Al hacer clic, se guarda el usuario en el estado 'editando' para abrir el modal */}
                      <Button variant="ghost" className="py-1 px-2 text-xs" onClick={() => setEditando(u)}>
                        Editar
                      </Button>
                      {/* Solo mostrar el botón desactivar si el usuario está activo */}
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

      {/* MODAL DE EDICIÓN: Se renderiza condicionalmente si 'editando' no es null */}
      {editando && (
        <Modal title="Editar usuario" onClose={() => setEditando(null)} maxWidth="max-w-md">
          <UsuarioForm inicial={editando} onSubmit={handleActualizar}
            onCancel={() => setEditando(null)} loading={loadingAction} />
        </Modal>
      )}

      {/* DIÁLOGO DE CONFIRMACIÓN: Se renderiza condicionalmente si 'eliminando' no es null */}
      {eliminando && (
        <ConfirmDialog
          title="Desactivar usuario"
          message={`¿Desactivar la cuenta de "${eliminando.nombre}"? El usuario ya no podrá iniciar sesión.`}
          onConfirm={handleEliminar}
          onCancel={() => setEliminando(null)}
          loading={loadingAction}
        />
      )}

      {/* COMPONENTE DE NOTIFICACIÓN: Se muestra cuando hay un mensaje en el estado de 'toast' */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}