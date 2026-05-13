import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { PrivateRoute } from './routes/PrivateRoute.jsx'
import { Layout } from './components/common/Layout.jsx'
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx'
import { PageTitle } from './components/common/PageTitle.jsx'
import { Login } from './pages/Login.jsx'
import { Register } from './pages/Register.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { Reportes } from './pages/Reportes.jsx'
import { Mapa } from './pages/Mapa.jsx'
import { AdminPanel } from './pages/AdminPanel.jsx'
import { Estadisticas } from './pages/Estadisticas.jsx'

const TitleManager = () => {
  const location = useLocation()
  return <PageTitle path={location.pathname} />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TitleManager />
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={
              <PrivateRoute><Layout /></PrivateRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={
                <ErrorBoundary><Dashboard /></ErrorBoundary>
              } />
              <Route path="reportes" element={
                <ErrorBoundary><Reportes /></ErrorBoundary>
              } />
              <Route path="mapa" element={
                <ErrorBoundary><Mapa /></ErrorBoundary>
              } />
              <Route path="estadisticas" element={
                <ErrorBoundary><Estadisticas /></ErrorBoundary>
              } />
              <Route path="admin" element={
                <PrivateRoute requiredRole="ADMINISTRADOR">
                  <ErrorBoundary><AdminPanel /></ErrorBoundary>
                </PrivateRoute>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  )
}