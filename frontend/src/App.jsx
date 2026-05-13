import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { PrivateRoute } from './routes/PrivateRoute.jsx'
import { Layout } from './components/common/Layout.jsx'
import { Login } from './pages/Login.jsx'
import { Register } from './pages/Register.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { Reportes } from './pages/Reportes.jsx'
import { Mapa } from './pages/Mapa.jsx'
import { AdminPanel } from './pages/AdminPanel.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <PrivateRoute><Layout /></PrivateRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="mapa" element={<Mapa />} />
            <Route path="admin" element={
              <PrivateRoute requiredRole="ADMINISTRADOR">
                <AdminPanel />
              </PrivateRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}