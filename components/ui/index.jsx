// ─── BUTTON ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 font-medium text-sm rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'btn-primary',
    ghost:   'btn-ghost',
    danger:  'btn-danger',
  }
  return (
    <button
      disabled={loading || props.disabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      )}
      {children}
    </button>
  )
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <input
        className={`input-field ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

// ─── SELECT ───────────────────────────────────────────────────────────────────
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <select
        className={`input-field ${error ? 'border-red-500' : ''} ${className}`}
        style={{ background: 'var(--bg-primary)' }}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

// ─── TEXTAREA ─────────────────────────────────────────────────────────────────
export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <textarea
        className={`input-field resize-none ${error ? 'border-red-500' : ''} ${className}`}
        rows={3}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  pendiente:   { bg: 'rgba(234,179,8,0.15)',   border: 'rgba(234,179,8,0.3)',   text: '#fbbf24' },
  procesando:  { bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)',  text: '#60a5fa' },
  enviado:     { bg: 'rgba(139,92,246,0.15)',  border: 'rgba(139,92,246,0.3)',  text: '#a78bfa' },
  entregado:   { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)',   text: '#4ade80' },
  cancelado:   { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)',   text: '#f87171' },
  activo:      { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)',   text: '#4ade80' },
  inactivo:    { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)', text: '#94a3b8' },
  admin:       { bg: 'rgba(14,165,233,0.15)',  border: 'rgba(14,165,233,0.3)',  text: '#38bdf8' },
  empleado:    { bg: 'rgba(168,85,247,0.15)',  border: 'rgba(168,85,247,0.3)',  text: '#c084fc' },
}

export function Badge({ label, variant = 'pendiente' }) {
  const style = BADGE_STYLES[variant] || BADGE_STYLES['inactivo']
  return (
    <span
      className="badge"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
      }}
    >
      {label}
    </span>
  )
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex items-center justify-center py-12">
      <div
        className={`${sizes[size]} animate-spin rounded-full`}
        style={{ border: '2px solid var(--border-subtle)', borderTopColor: 'var(--accent)' }}
      />
    </div>
  )
}

// ─── ERROR STATE ──────────────────────────────────────────────────────────────
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
      {onRetry && <Button onClick={onRetry} variant="ghost">Reintentar</Button>}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function EmptyState({ title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-card-hover)' }}>
        <svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
        {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, maxWidth = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${maxWidth} rounded-2xl p-6 shadow-2xl animate-slide-up`}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
export function ConfirmDialog({ title, message, onConfirm, onCancel, loading = false }) {
  return (
    <Modal title={title} onClose={onCancel} maxWidth="max-w-sm">
      <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Confirmar</Button>
      </div>
    </Modal>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = 'var(--accent)', delta }) {
  return (
    <div className="card card-hover p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
        {delta !== undefined && (
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{delta}</p>
        )}
      </div>
    </div>
  )
}

// ─── PAGE HEADER ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── TABLE ────────────────────────────────────────────────────────────────────
export function Table({ headers, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-sm ${className}`} style={{ color: 'var(--text-primary)' }}>
      {children}
    </td>
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }) {
  const styles = {
    success: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', icon: '✓', color: '#4ade80' },
    error:   { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', icon: '✕', color: '#f87171' },
    info:    { bg: 'rgba(14,165,233,0.15)', border: 'rgba(14,165,233,0.3)', icon: 'i', color: '#38bdf8' },
  }
  const s = styles[type]
  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-slide-in-right"
      style={{ background: s.bg, border: `1px solid ${s.border}`, minWidth: 280 }}
    >
      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: s.color, color: '#0a0e1a' }}>{s.icon}</span>
      <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{message}</span>
      <button onClick={onClose} className="text-xs" style={{ color: 'var(--text-muted)' }}>✕</button>
    </div>
  )
}
