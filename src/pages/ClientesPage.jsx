import { useState, useMemo } from 'react' // Importa hooks para manejar estado y memorizar cálculos.
import { useClientes } from '../hooks/useEntities' // Hook personalizado para interactuar con la API de clientes.
import { useToast } from '../hooks/useToast' // Hook para manejar las notificaciones (toasts).
import { useAuth } from '../context/AuthContext' // Acceso a la información del usuario logueado.
import {
  Button, Input, Modal, ConfirmDialog,
  Table, Td, Spinner, ErrorState, EmptyState,
  PageHeader, Toast, Badge,
} from '../components/ui/index.jsx' // Importación masiva de componentes de la librería UI.

// ─── FORM ─────────────────────────────────────────────────────────────────────
function ClienteForm({ inicial, onSubmit, onCancel, loading }) {
  // Estado local para los campos del formulario. Si viene 'inicial', lo usa para editar.
  const [form, setForm] = useState(
    inicial || { nombre: '', email: '', dni: '', telefono: '', direccion: '' }
  )
  // Estado para capturar mensajes de error de validación local.
  const [errors, setErrors] = useState({})

  // Función de validación: comprueba reglas de negocio antes de enviar.
  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido' // Verifica que no esté vacío.
    // Validación de email mediante Expresión Regular (Regex).
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email válido requerido'
    if (!form.dni.trim()) e.dni = 'El DNI es requerido'
    return e // Retorna un objeto con los errores encontrados.
  }

  // Manejador universal de cambios en los inputs.
  const handleChange = (e) => {
    // Actualiza el campo correspondiente usando el atributo 'name' del input.
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    // Limpia el error del campo específico mientras el usuario escribe.
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  // Función que se dispara al hacer click en el botón de submit o presionar Enter.
  const handleSubmit = (e) => {
    e.preventDefault() // Detiene el comportamiento por defecto del navegador.
    const e2 = validate() // Ejecuta la validación.
    if (Object.keys(e2).length) { setErrors(e2); return } // Si hay errores, detiene el envío.
    onSubmit(form) // Si todo está bien, envía los datos al componente padre.
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Grid de dos columnas para Nombre y DNI */}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nombre completo *" name="nombre" value={form.nombre}
          onChange={handleChange} placeholder="Juan García" error={errors.nombre} />
        <Input label="DNI *" name="dni" value={form.dni}
          onChange={handleChange} placeholder="12345678" error={errors.dni} />
      </div>
      {/* Grid de dos columnas para Email y Teléfono */}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email *" name="email" type="email" value={form.email}
          onChange={handleChange} placeholder="juan@email.com" error={errors.email} />
        <Input label="Teléfono" name="telefono" value={form.telefono}
          onChange={handleChange} placeholder="+54 11 1234-5678" />
      </div>
      {/* Input de ancho completo para la dirección */}
      <Input label="Dirección" name="direccion" value={form.direccion}
        onChange={handleChange} placeholder="Av. Corrientes 1234, CABA" />
      {/* Acciones del formulario */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{inicial ? 'Guardar cambios' : 'Crear cliente'}</Button>
      </div>
    </form>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export function ClientesPage() {
  // Desestructura métodos y datos del hook de clientes (capa de datos).
  const { clientes, cargando, error, refetch, crear, actualizar, eliminar } = useClientes()
  const { usuario } = useAuth() // Obtiene info del usuario actual.
  const { toast, showToast, hideToast } = useToast() // Control de alertas visuales.
  // Lógica de permisos: solo el administrador puede crear, editar o borrar.
  const esAdmin = usuario?.rol === 'admin'

  // Estados para controlar qué modal o diálogo está abierto.
  const [modalCrear, setModalCrear]     = useState(false) // Booleano para el modal de creación.
  const [editando, setEditando]         = useState(null) // Almacena el objeto cliente que se va a editar.
  const [eliminando, setEliminando]     = useState(null) // Almacena el objeto cliente que se va a borrar.
  const [loadingAction, setLoadingAction] = useState(false) // Estado de carga para botones durante llamadas a la API.
  const [busqueda, setBusqueda]         = useState('') // Texto para el filtro de búsqueda.

  // Filtro inteligente memorizado: solo se recalcula si cambia la lista o el texto de búsqueda.
  const clientesFiltrados = useMemo(() =>
    clientes.filter(c =>
      c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.dni?.includes(busqueda)
    ), [clientes, busqueda]
  )

  // Función para crear un cliente en la base de datos.
  const handleCrear = async (datos) => {
    setLoadingAction(true) // Activa el estado visual de carga.
    try {
      await crear(datos) // Llamada asíncrona a la API.
      setModalCrear(false) // Cierra el modal si tiene éxito.
      showToast('Cliente creado exitosamente') // Notifica al usuario.
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al crear', 'error') // Muestra error si falla.
    } finally { setLoadingAction(false) } // Apaga la carga siempre.
  }

  // Función para actualizar un cliente existente.
  const handleActualizar = async (datos) => {
    setLoadingAction(true)
    try {
      await actualizar(editando.id, datos) // Envía el ID y los nuevos datos.
      setEditando(null) // Limpia el estado de edición (cierra el modal).
      showToast('Cliente actualizado')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar', 'error')
    } finally { setLoadingAction(false) }
  }

  // Función para eliminar (o inactivar) un cliente.
  const handleEliminar = async () => {
    setLoadingAction(true)
    try {
      await eliminar(eliminando.id) // Ejecuta la eliminación en el servidor.
      setEliminando(null) // Cierra el diálogo de confirmación.
      showToast('Cliente eliminado')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al eliminar', 'error')
    } finally { setLoadingAction(false) }
  }

  // Early returns: si está cargando o hubo un error general, muestra vistas especiales.
  if (cargando) return <Spinner />
  if (error)    return <ErrorState message={error} onRetry={refetch} />

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera de página con título y botón de acción condicional */}
      <PageHeader
        title="Clientes"
        subtitle={`${clientesFiltrados.length} de ${clientes.length} clientes activos`}
        action={
          esAdmin ? ( // Solo el admin ve el botón "+ Nuevo cliente"
            <Button onClick={() => setModalCrear(true)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo cliente
            </Button>
          ) : null
        }
      />

      {/* Barra de búsqueda */}
      <div className="flex gap-3">
        <Input
          placeholder="Buscar por nombre, email o DNI..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="max-w-sm"
        />
        {busqueda && ( // Botón para resetear la búsqueda solo si hay texto.
          <Button variant="ghost" onClick={() => setBusqueda('')}>Limpiar</Button>
        )}
      </div>

      {/* Tabla o Estado vacío */}
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
                {/* Avatar generado con la inicial del nombre */}
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
                {/* Acciones limitadas a Administradores */}
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

      {/* Modales: se renderizan solo cuando su estado respectivo es verdadero o tiene datos */}
      {modalCrear && (
        <Modal title="Nuevo cliente" onClose={() => setModalCrear(false)} maxWidth="max-w-xl">
          <ClienteForm onSubmit={handleCrear} onCancel={() => setModalCrear(false)} loading={loadingAction} />
        </Modal>
      )}
      {editando && (
        <Modal title="Editar cliente" onClose={() => setEditando(null)} maxWidth="max-w-xl">
          {/* Aquí pasamos el cliente actual como 'inicial' para rellenar los campos */}
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
      {/* Sistema de notificación flotante */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}