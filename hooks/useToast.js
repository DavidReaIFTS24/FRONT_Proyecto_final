import { useState, useCallback } from 'react' // Importa useState para los datos y useCallback para optimizar funciones.

export function useToast() {
  // Estado local que guarda el objeto de la notificación { mensaje, tipo } o null si no hay nada.
  const [toast, setToast] = useState(null)

  // Función para mostrar la alerta. Se usa useCallback para que la función no se recree en cada renderizado.
  const showToast = useCallback((message, type = 'success') => {
    // Setea el objeto con el texto a mostrar y el tipo (por defecto es 'success' o éxito).
    setToast({ message, type })
    
    // Configura un temporizador para que la notificación desaparezca sola tras 3.5 segundos.
    setTimeout(() => setToast(null), 3500)
  }, []) // El array vacío indica que esta función solo se crea una vez al montar el componente.

  // Función para cerrar la notificación manualmente (por ejemplo, al hacer clic en una "X").
  const hideToast = useCallback(() => setToast(null), [])

  // Devuelve el estado actual y las dos funciones de control para ser usadas en las páginas.
  return { toast, showToast, hideToast }
}