import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

// ─── DATOS ────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: 'Productos',
    desc: 'Registrá y gestioná tu catálogo completo con imágenes, precios y categorías. Subida de imágenes a Cloudinary integrada.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    title: 'Stock',
    desc: 'Control de inventario en tiempo real. Alertas automáticas de stock bajo y movimientos de entrada y salida registrados.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: 'Pedidos',
    desc: 'Seguí el ciclo de vida de cada pedido desde su creación hasta la entrega. Historial completo por cliente.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Clientes',
    desc: 'Base de clientes centralizada con historial de compras y datos de contacto siempre a mano.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    title: 'Categorías',
    desc: 'Organizá tu catálogo en categorías personalizadas para facilitar la búsqueda y el filtrado de productos.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: 'Usuarios',
    desc: 'Gestión de roles y permisos. Acceso diferenciado para administradores y operadores según sus responsabilidades.',
  },
]

const STACK = [
  { label: 'React', color: '#61dafb' },
  { label: 'Node.js', color: '#68d391' },
  { label: 'Firebase', color: '#fbbf24' },
  { label: 'Cloudinary', color: '#a78bfa' },
  { label: 'Tailwind CSS', color: '#38bdf8' },
  { label: 'Axios', color: '#f87171' },
]

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const [scrollY, setScrollY] = useState(0)

  // Parallax sutil en el hero
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(16px)',
        background: 'rgba(10,14,26,0.85)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}
          className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18 }}>
              Magnum
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 20px', borderRadius: 8,
              background: 'var(--accent)', color: '#fff',
              fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer',
              transition: 'opacity .15s',
            }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Ingresar →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px',
        position: 'relative',
      }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          transform: `translateY(${scrollY * 0.15}px)`,
        }} />

        {/* Glow central */}
        <div style={{
          position: 'absolute', top: '35%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 999,
          border: '1px solid var(--border-accent)',
          background: 'var(--accent-glow)',
          fontSize: 13, color: 'var(--accent)', marginBottom: 32,
          position: 'relative', zIndex: 1,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--accent)', display: 'inline-block',
            boxShadow: '0 0 6px var(--accent)',
          }} />
          Sistema de Gestión Integral
        </div>

        {/* Título */}
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700,
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          lineHeight: 1.1, letterSpacing: '-0.03em',
          textAlign: 'center', maxWidth: 800, marginBottom: 24,
          position: 'relative', zIndex: 1,
        }}>
          Control total de tu{' '}
          <span style={{
            background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            negocio
          </span>{' '}
          desde un solo lugar
        </h1>

        {/* Subtítulo */}
        <p style={{
          color: 'var(--text-secondary)', fontSize: 18, maxWidth: 560,
          textAlign: 'center', lineHeight: 1.7, marginBottom: 48,
          position: 'relative', zIndex: 1,
        }}>
          Administrá productos, stock, pedidos y clientes con una interfaz pensada para la eficiencia.
          Roles diferenciados, datos en tiempo real y sin complicaciones.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center" style={{ position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '14px 32px', borderRadius: 10,
              background: 'var(--accent)', color: '#fff',
              fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer',
              boxShadow: '0 0 32px rgba(14,165,233,0.35)',
              transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 48px rgba(14,165,233,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 32px rgba(14,165,233,0.35)' }}
          >
            Acceder al sistema →
          </button>
          <a
            href="#features"
            style={{
              padding: '14px 32px', borderRadius: 10,
              border: '1px solid var(--border-accent)',
              color: 'var(--text-primary)',
              fontWeight: 600, fontSize: 16, textDecoration: 'none',
              background: 'transparent', cursor: 'pointer',
              transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-glow)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            Ver funcionalidades
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 justify-center" style={{ marginTop: 72, position: 'relative', zIndex: 1 }}>
          {[
            { n: '6', label: 'Módulos integrados' },
            { n: '2', label: 'Roles de usuario' },
            { n: '∞', label: 'Escalabilidad' },
          ].map(({ n, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: 36, color: 'var(--accent)', lineHeight: 1,
              }}>{n}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Funcionalidades
          </p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 16 }}>
            Todo lo que tu operación necesita
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
            Cada módulo está diseñado para trabajar en conjunto, manteniendo la información sincronizada y accesible.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── ARQUITECTURA / STACK ── */}
      <section style={{
        padding: '100px 24px',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Stack tecnológico
            </p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 16 }}>
              Construido con tecnologías modernas
            </h2>
          </div>

          {/* Stack pills */}
          <div className="flex flex-wrap gap-3 justify-center" style={{ marginBottom: 72 }}>
            {STACK.map(({ label, color }) => (
              <span key={label} style={{
                padding: '8px 20px', borderRadius: 999,
                border: `1px solid ${color}33`,
                background: `${color}11`,
                color,
                fontWeight: 600, fontSize: 14,
              }}>{label}</span>
            ))}
          </div>

          {/* Diagrama simplificado */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2, maxWidth: 800, margin: '0 auto',
          }}>
            {[
              { top: 'Cliente (Browser)', bottom: 'React + Tailwind', accent: '#0ea5e9' },
              { top: 'API REST', bottom: 'Node.js + Express', accent: '#68d391' },
              { top: 'Persistencia & Media', bottom: 'Firebase + Cloudinary', accent: '#fbbf24' },
            ].map(({ top, bottom, accent }, i) => (
              <div key={top} style={{ position: 'relative' }}>
                {i > 0 && (
                  <div style={{
                    position: 'absolute', left: -1, top: '50%',
                    width: 2, height: 2,
                    transform: 'translateY(-50%)',
                  }} />
                )}
                <div style={{
                  padding: '24px 20px', textAlign: 'center',
                  background: 'var(--bg-card)',
                  border: `1px solid ${accent}33`,
                  borderRadius: i === 0 ? '12px 0 0 12px' : i === 2 ? '0 12px 12px 0' : 0,
                }}>
                  <div style={{ color: accent, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{top}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{bottom}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 12, color: 'var(--text-muted)', fontSize: 12 }}>
            Arquitectura cliente → servidor → servicios externos
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Accesos
          </p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            Dos roles, control total
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            {
              role: 'Administrador',
              color: '#0ea5e9',
              perks: ['Gestión completa de usuarios', 'Alta/baja/modificación de cualquier entidad', 'Acceso al módulo de Usuarios', 'Visualización del dashboard completo'],
            },
            {
              role: 'Operador',
              color: '#a78bfa',
              perks: ['Gestión de productos y stock', 'Carga y seguimiento de pedidos', 'Consulta de clientes y categorías', 'Dashboard operativo'],
            },
          ].map(({ role, color, perks }) => (
            <div key={role} style={{
              padding: 32, borderRadius: 16,
              background: 'var(--bg-card)',
              border: `1px solid ${color}33`,
              boxShadow: `0 0 32px ${color}11`,
            }}>
              <div style={{
                display: 'inline-block',
                padding: '4px 12px', borderRadius: 999,
                background: `${color}22`, color,
                fontSize: 12, fontWeight: 700,
                letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 20,
              }}>{role}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {perks.map(p => (
                  <li key={p} className="flex items-start gap-3">
                    <span style={{ color, marginTop: 2, flexShrink: 0 }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{
        padding: '100px 24px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700, height: 400,
          background: 'radial-gradient(ellipse, rgba(14,165,233,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            marginBottom: 16, letterSpacing: '-0.02em',
          }}>
            Listo para gestionar
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 40, maxWidth: 400, margin: '0 auto 40px' }}>
            Ingresá con tus credenciales y comenzá a operar.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '16px 48px', borderRadius: 12,
              background: 'var(--accent)', color: '#fff',
              fontWeight: 700, fontSize: 18, border: 'none', cursor: 'pointer',
              boxShadow: '0 0 48px rgba(14,165,233,0.4)',
              transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 0 64px rgba(14,165,233,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 48px rgba(14,165,233,0.4)' }}
          >
            Ir al sistema →
          </button>

          {/* ── CONTACTO ── */}
          <div style={{
            marginTop: 64,
            paddingTop: 56,
            borderTop: '1px solid var(--border-subtle)',
            maxWidth: 680,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            <p style={{
              color: 'var(--accent)', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12,
            }}>
              Contacto
            </p>
            <h3 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              marginBottom: 8,
            }}>
              ¿Tenés alguna consulta?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 36 }}>
              Escribinos o llamanos, respondemos a la brevedad.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              {/* Mail */}
              <a
                href="mailto:40808658@ifts24.edu.ar"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '16px 24px', borderRadius: 12,
                  border: '1px solid var(--border-accent)',
                  background: 'var(--accent-glow)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  transition: 'all .2s',
                  minWidth: 260,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(14,165,233,0.15)'
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--accent-glow)'
                  e.currentTarget.style.borderColor = 'var(--border-accent)'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <span style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(14,165,233,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)',
                }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }}>
                    Email
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    40808658@ifts24.edu.ar
                  </div>
                </div>
              </a>

              {/* Teléfono */}
              <a
                href="tel:+541138825052"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '16px 24px', borderRadius: 12,
                  border: '1px solid rgba(167,139,250,0.3)',
                  background: 'rgba(167,139,250,0.07)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  transition: 'all .2s',
                  minWidth: 220,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(167,139,250,0.15)'
                  e.currentTarget.style.borderColor = '#a78bfa'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(167,139,250,0.07)'
                  e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                <span style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(167,139,250,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#a78bfa',
                }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }}>
                    Teléfono
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    11 3882-5052
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '32px 24px',
        borderTop: '1px solid var(--border-subtle)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 13,
      }}>
        Magnum · {new Date().getFullYear()}
      </footer>

    </div>
  )
}

// ─── FEATURE CARD ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 28, borderRadius: 14,
        background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: hovered ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
        boxShadow: hovered ? '0 0 24px var(--accent-glow)' : 'none',
        transition: 'all .2s',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10, marginBottom: 16,
        background: hovered ? 'rgba(14,165,233,0.2)' : 'rgba(14,165,233,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent)',
        transition: 'background .2s',
      }}>
        {icon}
      </div>
      <h3 style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18,
        marginBottom: 8, color: 'var(--text-primary)',
      }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{desc}</p>
    </div>
  )
}