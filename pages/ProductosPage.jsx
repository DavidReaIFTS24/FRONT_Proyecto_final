import { useState, useMemo } from 'react' // Importación de hooks fundamentales: estado local y optimización de cálculos.
import { useProductos, useCategorias } from '../hooks/useEntities' // Hooks personalizados para el CRUD de productos y carga de categorías.
import { useToast } from '../hooks/useToast' // Hook para disparar alertas visuales (éxito/error).
import {
  Button, Input, Select, Textarea, Modal, ConfirmDialog,
  Table, Td, Spinner, ErrorState, EmptyState,
  PageHeader, Toast, Badge,
} from '../components/ui/index.jsx' // Componentes de la librería de UI interna.

// ─── COMPONENTE: FORMULARIO DE PRODUCTO ───────────────────────────────────────
// Se encarga de capturar los datos tanto para creación como para edición.
function ProductoForm({ inicial, categorias, onSubmit, onCancel, loading }) {
  // Inicializa el estado con los datos del producto si estamos editando, o campos vacíos si es nuevo.
  const [form, setForm] = useState(
    inicial || { nombre: '', descripcion: '', precio: '', categoriaId: '', color: '', material: '', dimensiones: '', imagen: '' }
  )
  // Estado para capturar y mostrar mensajes de validación bajo cada input.
  const [errors, setErrors] = useState({})

  // Función interna para validar reglas de negocio antes de enviar al servidor.
  const validate = () => {
    const e = {}
    if (!form.nombre.trim())     e.nombre      = 'El nombre es requerido' // Verifica texto no vacío.
    if (!form.precio || isNaN(form.precio) || Number(form.precio) <= 0) e.precio = 'Precio válido requerido' // Valida número positivo.
    if (!form.categoriaId)       e.categoriaId = 'Seleccioná una categoría' // Obliga a elegir categoría.
    return e
  }

  // Actualiza el estado 'form' dinámicamente según el atributo 'name' del input que cambió.
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' })) // Limpia el error del campo al escribir.
  }

  // Procesa el envío: valida y luego ejecuta la acción del componente padre.
  const handleSubmit = (e) => {
    e.preventDefault() // Evita recarga de página.
    const e2 = validate() // Ejecuta validaciones.
    if (Object.keys(e2).length) { setErrors(e2); return } // Si hay errores, detiene el proceso.
    onSubmit({ ...form, precio: Number(form.precio) }) // Envía los datos asegurando que el precio sea numérico.
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Input para nombre con manejo de error visual */}
        <Input label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange}
          placeholder="Ej: Silla de oficina" error={errors.nombre} />
        {/* Input numérico para precio */}
        <Input label="Precio *" name="precio" type="number" min="0" step="0.01"
          value={form.precio} onChange={handleChange} placeholder="0.00" error={errors.precio} />
      </div>
      {/* Selector dinámico de categorías cargadas desde la API */}
      <Select label="Categoría *" name="categoriaId" value={form.categoriaId}
        onChange={handleChange} error={errors.categoriaId}>
        <option value="">Seleccionar categoría...</option>
        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
      </Select>
      {/* Área de texto para la descripción larga */}
      <Textarea label="Descripción" name="descripcion" value={form.descripcion}
        onChange={handleChange} placeholder="Descripción del producto..." />
      <div className="grid grid-cols-3 gap-4">
        {/* Campos adicionales de características físicas */}
        <Input label="Color" name="color" value={form.color} onChange={handleChange} placeholder="Ej: Negro" />
        <Input label="Material" name="material" value={form.material} onChange={handleChange} placeholder="Ej: Madera" />
        <Input label="Dimensiones" name="dimensiones" value={form.dimensiones} onChange={handleChange} placeholder="Ej: 80x60cm" />
      </div>
      {/* Campo para la ruta de la imagen del producto */}
      <Input label="URL Imagen" name="imagen" value={form.imagen} onChange={handleChange}
        placeholder="https://..." />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        {/* Botón dinámico que muestra spinner si 'loading' es true */}
        <Button type="submit" loading={loading}>{inicial ? 'Guardar cambios' : 'Crear producto'}</Button>
      </div>
    </form>
  )
}

// ─── COMPONENTE PRINCIPAL: PÁGINA DE PRODUCTOS ────────────────────────────────
export function ProductosPage() {
  // Desestructuración de métodos y estados del hook de productos (Llamadas a API).
  const { productos, cargando, error, refetch, crear, actualizar, eliminar } = useProductos()
  // Carga de categorías para usar en filtros y formularios.
  const { categorias } = useCategorias()
  // Funciones para el control de notificaciones flotantes.
  const { toast, showToast, hideToast } = useToast()

  // Estados locales para controlar la visibilidad de los modales (Crear, Editar, Eliminar).
  const [modalCrear, setModalCrear]     = useState(false)
  const [editando, setEditando]         = useState(null)
  const [eliminando, setEliminando]     = useState(null)
  const [loadingAction, setLoadingAction] = useState(false) // Bloquea botones durante peticiones asíncronas.
  const [busqueda, setBusqueda]         = useState('') // Texto del buscador.
  const [filtroCategoria, setFiltroCategoria] = useState('') // ID de la categoría seleccionada en filtros.

  // useMemo: Filtra la lista de productos de manera eficiente según búsqueda y categoría.
  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const matchBusqueda = p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
      const matchCat = !filtroCategoria || p.categoriaId === filtroCategoria
      return matchBusqueda && matchCat
    })
  }, [productos, busqueda, filtroCategoria])

  // Lógica para enviar un nuevo producto al servidor.
  const handleCrear = async (datos) => {
    setLoadingAction(true)
    try {
      await crear(datos)
      setModalCrear(false) // Cierra modal al tener éxito.
      showToast('Producto creado exitosamente')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al crear', 'error')
    } finally { setLoadingAction(false) }
  }

  // Lógica para actualizar un producto existente por ID.
  const handleActualizar = async (datos) => {
    setLoadingAction(true)
    try {
      await actualizar(editando.id, datos)
      setEditando(null) // Cierra modal de edición.
      showToast('Producto actualizado')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar', 'error')
    } finally { setLoadingAction(false) }
  }

  // Lógica para marcar un producto como eliminado/inactivo.
  const handleEliminar = async () => {
    setLoadingAction(true)
    try {
      await eliminar(eliminando.id)
      setEliminando(null) // Cierra el diálogo de confirmación.
      showToast('Producto eliminado')
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al eliminar', 'error')
    } finally { setLoadingAction(false) }
  }

  // Función auxiliar para traducir el UUID de categoría a un nombre legible.
  const getNombreCategoria = (id) => categorias.find(c => c.id === id)?.nombre || '—'

  // Renders condicionales para estados globales de la página.
  if (cargando) return <Spinner /> // Mientras la API responde.
  if (error)    return <ErrorState message={error} onRetry={refetch} /> // Si falla la carga inicial.

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera de la página con título, estadísticas y botón principal de acción */}
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

      {/* Barra de herramientas: Filtros de búsqueda y categoría */}
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
        {/* Botón para resetear filtros si el usuario aplicó alguno */}
        {(busqueda || filtroCategoria) && (
          <Button variant="ghost" onClick={() => { setBusqueda(''); setFiltroCategoria('') }}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Renderizado condicional: Tabla con datos o pantalla de 'Sin resultados' */}
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
                  {/* Nombre y descripción (truncada para no romper el diseño) */}
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{prod.nombre}</p>
                  {prod.descripcion && (
                    <p className="text-xs truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
                      {prod.descripcion}
                    </p>
                  )}
                </div>
              </Td>
              <Td>
                {/* Badge con el nombre de la categoría resuelto mediante el helper */}
                <Badge label={getNombreCategoria(prod.categoriaId)} variant="procesando" />
              </Td>
              <Td>
                {/* Precio formateado a moneda local */}
                <span className="font-mono font-semibold" style={{ color: '#4ade80' }}>
                  ${Number(prod.precio || 0).toLocaleString('es-AR')}
                </span>
              </Td>
              <Td>
                {/* Combinación de atributos físicos opcionales */}
                <span style={{ color: 'var(--text-secondary)' }}>
                  {[prod.color, prod.material].filter(Boolean).join(' · ') || '—'}
                </span>
              </Td>
              <Td>
                {/* Indicador visual de stock: cambia de color según la escasez */}
                <span className="font-mono font-bold" style={{ color: prod.stock === 0 ? '#f87171' : prod.stock <= 5 ? '#fb923c' : '#4ade80' }}>
                  {prod.stock ?? '—'}
                </span>
              </Td>
              <Td>
                {/* Botones de acción rápida por fila */}
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

      {/* MODAL: Creación de nuevo producto */}
      {modalCrear && (
        <Modal title="Nuevo producto" onClose={() => setModalCrear(false)} maxWidth="max-w-2xl">
          <ProductoForm categorias={categorias} onSubmit={handleCrear} onCancel={() => setModalCrear(false)} loading={loadingAction} />
        </Modal>
      )}

      {/* MODAL: Edición de producto (Se activa al pasar un objeto al estado 'editando') */}
      {editando && (
        <Modal title="Editar producto" onClose={() => setEditando(null)} maxWidth="max-w-2xl">
          <ProductoForm inicial={editando} categorias={categorias} onSubmit={handleActualizar} onCancel={() => setEditando(null)} loading={loadingAction} />
        </Modal>
      )}

      {/* DIÁLOGO: Confirmación para eliminación física/lógica */}
      {eliminando && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Eliminar "${eliminando.nombre}"? El registro quedará inactivo.`}
          onConfirm={handleEliminar}
          onCancel={() => setEliminando(null)}
          loading={loadingAction}
        />
      )}

      {/* Alerta flotante global */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}