export function MagnumLogo({ size = 'md' }) {
  const scale = size === 'sm' ? 0.6 : size === 'lg' ? 1.2 : 1
  return (
    <svg viewBox="0 0 260 60" style={{ width: 260 * scale, height: 60 * scale }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#0284c7"/>
        </linearGradient>
      </defs>
      {/* Círculo fondo */}
      <circle cx="30" cy="30" r="26" fill="rgba(14,165,233,0.1)" stroke="rgba(14,165,233,0.25)" strokeWidth="0.8"/>
      {/* M */}
      <path d="M16 42 L16 20 L30 36 L44 20 L44 42" fill="none" stroke="url(#mg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Barras de stock */}
      <rect x="20" y="45" width="4" height="6"  rx="1" fill="#0ea5e9" fillOpacity="0.9"/>
      <rect x="27" y="43" width="4" height="8"  rx="1" fill="#38bdf8" fillOpacity="0.9"/>
      <rect x="34" y="47" width="4" height="4"  rx="1" fill="#0ea5e9" fillOpacity="0.7"/>
      {/* Separador */}
      <line x1="65" y1="10" x2="65" y2="52" stroke="#0ea5e9" strokeOpacity="0.3" strokeWidth="0.8"/>
      {/* Texto */}
      <text x="74" y="37" fontFamily="Syne, sans-serif" fontWeight="700" fontSize="26" letterSpacing="-0.5" fill="var(--text-primary, #f0f6ff)">Magnum</text>
      <text x="75" y="50" fontFamily="DM Sans, sans-serif" fontSize="8" letterSpacing="2" fill="var(--text-secondary, #6b8fae)" textAnchor="start">GESTIÓN DE INVENTARIO</text>
    </svg>
  )
}