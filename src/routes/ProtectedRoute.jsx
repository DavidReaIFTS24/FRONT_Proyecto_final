import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/index.jsx'

export function ProtectedRoute({ children, soloAdmin = false }) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  if (!usuario) return <Navigate to="/login" replace />
  if (soloAdmin && usuario.rol !== 'admin') return <Navigate to="/dashboard" replace />

  return children
}
