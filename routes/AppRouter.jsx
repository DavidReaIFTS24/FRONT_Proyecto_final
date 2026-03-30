import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { MainLayout } from '../components/layout/MainLayout'
import { LoginPage } from '../pages/LoginPage'
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
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
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

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
