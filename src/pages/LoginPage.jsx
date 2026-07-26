import { useState } from 'react'
import { useNavigate } from 'react-router-dom' // Hook para redirigir al usuario tras el login.
import { useAuth } from '../context/AuthContext' // Acceso al "bouncer" global: el contexto de autenticación.
import { Input, Button } from '../components/ui/index.jsx' // Componentes de UI reutilizables.

export function LoginPage() {
  const { login } = useAuth() // Función que se comunica con la API para validar credenciales.
  const navigate = useNavigate()

  // Estados esenciales: datos del formulario, errores de validación/API y estado de carga.
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Sincroniza los inputs con el estado 'form'. 
  // UX Pro: Limpia el mensaje de error apenas el usuario vuelve a escribir.
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  // Proceso de autenticación
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validación básica antes de molestar al servidor.
    if (!form.email || !form.password) {
      setError('Completá todos los campos')
      return
    }

    setLoading(true) // Activa el spinner en el botón.
    try {
      // Intenta el login. Si falla, el error saltará al bloque 'catch'.
      await login(form.email, form.password)
      navigate('/dashboard') // Éxito: directo al panel principal.
    } catch (err) {
      // Manejo de errores: si la API envía un mensaje lo usamos, sino ponemos uno genérico.
      setError(err.response?.data?.message || 'Credenciales inválidas')
    } finally {
      setLoading(false) // Desactiva el estado de carga pase lo que pase.
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }} // Fondo oscuro definido en variables CSS globales.
    >
      {/* Decoración de fondo: Un círculo con desenfoque (blur) para dar profundidad. 
         'pointer-events-none' asegura que no interfiera con los clics.
      */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #0ea5e9 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Cabecera: Logo icónico y títulos */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--accent)', boxShadow: '0 0 32px rgba(14,165,233,0.4)' }}
          >
            {/* Ícono de rayo/energía */}
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
            Magnum
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            Ingresá a tu panel de control
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="card p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />

            {/* Alerta de Error: Solo se renderiza si el estado 'error' tiene contenido */}
            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm animate-shake"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171',
                }}
              >
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full justify-center py-2.5 mt-2">
              Iniciar sesión
            </Button>
          </form>
        </div>

        {/* Footer pequeño con versión del sistema y volver al inicio */}
        <div className="text-center mt-6 flex flex-col items-center gap-2">
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: 13,
              transition: 'color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </button>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Sistema de gestión interno · v1.0
          </p>
        </div>
      </div>
    </div>
  )
}