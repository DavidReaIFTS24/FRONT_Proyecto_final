import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/index.jsx'

/**
 * PublicRoute — el opuesto de ProtectedRoute.
 * Si el usuario YA tiene sesión activa, lo manda al dashboard.
 * Si NO tiene sesión, muestra el contenido normalmente (landing, login).
 */
export function PublicRoute({ children }) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  if (usuario) return <Navigate to="/dashboard" replace />

  return children
}