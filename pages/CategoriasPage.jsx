import { useState } from 'react' // Importa el hook para manejar el estado local del formulario.
import { useCategorias } from '../hooks/useEntities' // Hook para las operaciones CRUD de categorías.
import { useToast } from '../hooks/useToast' // Hook para disparar alertas visuales.
import { useAuth } from '../context/AuthContext' // Hook para obtener el usuario y su rol.
import {
  Button, Input, Textarea, Modal, ConfirmDialog,
  Table, Td, Spinner, ErrorState, EmptyState,
  PageHeader, Toast, Badge,
} from '../components/ui/index.jsx' // Importa los componentes atómicos de la interfaz.

// ─── FORM: Maneja la creación y edición de una categoría ─────────────────────
function CategoriaForm({ inicial, onSubmit, onCancel, loading }) {
  // Inicializa el formulario con datos previos (si es edición) o campos vacíos (si es creación).
  const [form, setForm] = useState(inicial || { nombre: '', descripcion: '' })
  // Estado para almacenar errores de validación (ej: nombre vacío).
  const [errors, setErrors] = useState({})

  // Valida que los campos obligatorios cumplan las reglas de negocio.
  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido' // Verifica que el nombre no sea solo espacios.
    return e // Retorna el objeto de errores (vacío si todo es válido).
  }

  // Actualiza el estado del formulario cada vez que el usuario escribe.
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value })) // Actualiza la propiedad según el 'name' del input.
    setErrors(prev => ({ ...prev, [e.target.name]: '' })) // Limpia el error del campo que se está editando.
  }

  // Procesa el envío del formulario.
  const handleSubmit = (e) => {
    e.preventDefault() // Evita que la página se recargue.
    const e2 = validate() // Ejecuta la validación manual.
    if (Object.keys(e2).length) { setErrors(e2); return } // Si hay errores, detiene la ejecución.
    onSubmit(form) // Envía los datos limpios a la función padre.
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4"> {/* Contenedor con espaciado vertical */}
      <Input
        label="Nombre *"
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        placeholder="Ej: Muebles de madera"
        error={errors.nombre} // Muestra mensaje de error si existe.
      />
      <Textarea
        label="Descripción"
        name="descripcion"
        value={form.descripcion}
        onChange={handleChange}
        placeholder="Descripción opcional..."
      />
      <div className="flex justify-end gap-3 pt-2"> {/* Botonera alineada a la derecha */}
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>
          {inicial ? 'Guardar cambios' : 'Crear categoría'} {/* Cambia el texto según el modo */}
        </Button>
      </div>
    </form>
  )
}
// ─── PAGE: Vista principal de administración de categorías ────────────────────
export function CategoriasPage() {
  // Obtiene datos y funciones operativas desde el hook de lógica de negocio.
  const { categorias, cargando, error, refetch, crear, actualizar, eliminar } = useCategorias()
  const { toast, showToast, hideToast } = useToast() // Control de notificaciones emergentes.
  const { usuario } = useAuth() // Obtiene el usuario logueado para verificar su rol.
  const esAdmin = usuario?.rol === 'admin' // true si es admin, false si es empleado u otro rol.

  // Estados para controlar la visibilidad de ventanas emergentes (modales).
  const [modalCrear, setModalCrear]   = useState(false) // Controla el modal de creación.
  const [editando, setEditando]       = useState(null) // Almacena la categoría que se está editando.
  const [eliminando, setEliminando]   = useState(null) // Almacena la categoría que se pretende borrar.
  const [viendo, setViendo]           = useState(null) // Almacena la categoría para ver en modo solo lectura.
  const [loadingAction, setLoadingAction] = useState(false) // Estado de carga para botones durante la espera de la API.

  // Lógica para enviar una nueva categoría al servidor.
  const handleCrear = async (datos) => {
    setLoadingAction(true)
    try {
      await crear(datos) // Llama al servicio de creación.
      setModalCrear(false) // Cierra el modal tras el éxito.
      showToast('Categoría creada exitosamente') // Notifica al usuario.
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al crear', 'error') // Maneja errores de servidor.
    } finally { setLoadingAction(false) }
  }

  // Lógica para actualizar una categoría existente.
  const handleActualizar = async (datos) => {
    setLoadingAction(true)
    try {
      await actualizar(editando.id, datos) // Envía el ID y los nuevos datos.
      setEditando(null) // Cierra el modal de edición.
      showToast('Categoría actualizada')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar', 'error')
    } finally { setLoadingAction(false) }
  }

  // Lógica para confirmar y ejecutar la eliminación.
  const handleEliminar = async () => {
    setLoadingAction(true)
    try {
      await eliminar(eliminando.id) // Ejecuta el borrado físico o lógico.
      setEliminando(null) // Cierra el diálogo de confirmación.
      showToast('Categoría eliminada')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al eliminar', 'error')
    } finally { setLoadingAction(false) }
  }

  // Manejo de estados globales de carga y error de red.
  if (cargando) return <Spinner /> // Muestra un cargador mientras se obtienen los datos.
  if (error)    return <ErrorState message={error} onRetry={refetch} /> // Muestra error con botón de reintento.

  return (
    <div className="space-y-6 animate-fade-in"> {/* Contenedor con animación de entrada suave */}
      <PageHeader
        title="Categorías"
        subtitle={`${categorias.length} categorías registradas`}
        action={
          esAdmin && (
            <Button onClick={() => setModalCrear(true)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva categoría
            </Button>
          )
        }
      />

      {/* Renderizado condicional: si no hay datos muestra un estado vacío, sino la tabla */}
      {categorias.length === 0 ? (
        <EmptyState
          title="Sin categorías"
          subtitle="Creá la primera categoría para organizar tus productos"
          action={esAdmin ? <Button onClick={() => setModalCrear(true)}>Crear categoría</Button> : null}
        />
      ) : (
        <Table headers={['Nombre', 'Descripción', 'Estado', 'Creada', 'Acciones']}>
          {categorias.map(cat => ( // Itera sobre el array de categorías.
            <tr key={cat.id} className="table-row">
              <Td>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.nombre}</span>
              </Td>
              <Td>
                <span style={{ color: 'var(--text-secondary)' }}>{cat.descripcion || '—'}</span> {/* Muestra guion si es nulo */}
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
                  {esAdmin ? (
                    <>
                      <Button variant="ghost" className="py-1 px-2 text-xs" onClick={() => setEditando(cat)}>
                        Editar
                      </Button>
                      <Button variant="danger" className="py-1 px-2 text-xs" onClick={() => setEliminando(cat)}>
                        Eliminar
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" className="py-1 px-2 text-xs" onClick={() => setViendo(cat)}>
                      Ver detalle
                    </Button>
                  )}
                </div>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      {/* MODALES: Solo se montan si su estado de activación es verdadero o tiene datos */}
      
      {/* Modal de Creación */}
      {modalCrear && (
        <Modal title="Nueva categoría" onClose={() => setModalCrear(false)}>
          <CategoriaForm onSubmit={handleCrear} onCancel={() => setModalCrear(false)} loading={loadingAction} />
        </Modal>
      )}

      {/* Modal de Edición */}
      {editando && (
        <Modal title="Editar categoría" onClose={() => setEditando(null)}>
          <CategoriaForm inicial={editando} onSubmit={handleActualizar} onCancel={() => setEditando(null)} loading={loadingAction} />
        </Modal>
      )}

      {/* Modal de Solo Lectura (empleados) */}
      {viendo && (
        <Modal title="Detalle de categoría" onClose={() => setViendo(null)}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Nombre</p>
              <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{viendo.nombre}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Descripción</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{viendo.descripcion || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Estado</p>
              <Badge label={viendo.activa ? 'activa' : 'inactiva'} variant={viendo.activa ? 'activo' : 'inactivo'} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Fecha de creación</p>
              <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                {viendo.fechaCreacion ? new Date(viendo.fechaCreacion).toLocaleDateString('es-AR') : '—'}
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setViendo(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Diálogo de Confirmación para Borrado */}
      {eliminando && (
        <ConfirmDialog
          title="Eliminar categoría"
          message={`¿Estás seguro de eliminar "${eliminando.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={handleEliminar}
          onCancel={() => setEliminando(null)}
          loading={loadingAction}
        />
      )}

      {/* Componente de alerta flotante (Toast) */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}