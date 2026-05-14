import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '13px',
              fontFamily: 'Plus Jakarta Sans, Inter, system-ui, sans-serif',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              style: { background: '#0F172A', color: '#fff' },
              iconTheme: { primary: '#22C55E', secondary: '#fff' },
            },
            error: {
              style: { background: '#0F172A', color: '#fff' },
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)