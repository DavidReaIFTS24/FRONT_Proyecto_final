import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'               // ← NUEVO
import { MainLayout } from '../components/layout/MainLayout'
import { LoginPage } from '../pages/LoginPage'
import { LandingPage } from '../pages/LandingPage'
import { DashboardPage } from '../pages/DashboardPage'
import { ProductosPage } from '../pages/ProductosPage'
import { CategoriasPage } from '../pages/CategoriasPage'
import { ClientesPage } from '../pages/ClientesPage'
import { PedidosPage } from '../pages/PedidosPage'
import { StockPage } from '../pages/StockPage'
import { UsuariosPage } from '../pages/UsuariosPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Públicas (redirigen al dashboard si ya hay sesión) ── */}
        <Route path="/" element={
          <PublicRoute><LandingPage /></PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute><LoginPage /></PublicRoute>
        } />

        {/* ── Protegidas (rutas originales sin cambios) ── */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard"  element={<DashboardPage />} />
          <Route path="productos"  element={<ProductosPage />} />
          <Route path="categorias" element={<CategoriasPage />} />
          <Route path="clientes"   element={<ClientesPage />} />
          <Route path="pedidos"    element={<PedidosPage />} />
          <Route path="stock"      element={<StockPage />} />
          <Route
            path="usuarios"
            element={
              <ProtectedRoute soloAdmin>
                <UsuariosPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ── Fallback ─────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}