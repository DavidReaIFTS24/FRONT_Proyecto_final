import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// ─── LOGO MAGNUM ─────────────────────────────────────────────────────────────
function MagnumLogo() {
  return (
    <svg viewBox="0 0 210 52" style={{ width: 175, height: 44 }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mg-sidebar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#0284c7"/>
        </linearGradient>
      </defs>
      {/* Círculo fondo */}
      <circle cx="26" cy="26" r="22" fill="rgba(14,165,233,0.1)" stroke="rgba(14,165,233,0.25)" strokeWidth="0.8"/>
      {/* M */}
      <path
        d="M13 38 L13 16 L26 30 L39 16 L39 38"
        fill="none"
        stroke="url(#mg-sidebar)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Barras de stock */}
      <rect x="16" y="41" width="4" height="5"  rx="1" fill="#0ea5e9" fillOpacity="0.9"/>
      <rect x="23" y="39" width="4" height="7"  rx="1" fill="#38bdf8" fillOpacity="0.9"/>
      <rect x="30" y="43" width="4" height="3"  rx="1" fill="#0ea5e9" fillOpacity="0.7"/>
      {/* Separador vertical */}
      <line x1="58" y1="8" x2="58" y2="46" stroke="#0ea5e9" strokeOpacity="0.25" strokeWidth="0.8"/>
      {/* Nombre */}
      <text
        x="68" y="33"
        fontFamily="Syne, sans-serif"
        fontWeight="700"
        fontSize="22"
        letterSpacing="-0.5"
        fill="var(--text-primary, #f0f6ff)"
      >
        Magnum
      </text>
      {/* Subtítulo */}
      <text
        x="69" y="44"
        fontFamily="DM Sans, sans-serif"
        fontWeight="400"
        fontSize="7.5"
        letterSpacing="1.8"
        fill="var(--text-muted, #6b8fae)"
      >
        INVENTARIO
      </text>
    </svg>
  )
}

// ─── NAV ITEMS ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/productos',
    label: 'Productos',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    to: '/categorias',
    label: 'Categorías',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    to: '/clientes',
    label: 'Clientes',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/pedidos',
    label: 'Pedidos',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    to: '/stock',
    label: 'Stock',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
]

const ADMIN_ITEMS = [
  {
    to: '/usuarios',
    label: 'Usuarios',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive ? 'glow-border' : 'hover:bg-white/5'
        }`
      }
      style={({ isActive }) => ({
        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
        background: isActive ? 'var(--accent-glow)' : 'transparent',
      })}
    >
      {icon}
      {label}
    </NavLink>
  )
}

// ─── MAIN LAYOUT ─────────────────────────────────────────────────────────────
export function MainLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* SIDEBAR */}
      <aside
        className="w-60 flex-shrink-0 flex flex-col h-full"
        style={{
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Logo */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <MagnumLogo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Principal
          </p>
          {NAV_ITEMS.map(item => <NavItem key={item.to} {...item} />)}

          {usuario?.rol === 'admin' && (
            <>
              <p className="px-3 py-2 mt-4 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Administración
              </p>
              {ADMIN_ITEMS.map(item => <NavItem key={item.to} {...item} />)}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-card)' }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              {usuario?.nombre?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {usuario?.nombre || 'Usuario'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {usuario?.rol}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 rounded transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Cerrar sesión"
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
