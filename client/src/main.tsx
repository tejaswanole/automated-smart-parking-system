import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { SocketProvider } from './context/SocketContext.tsx'
import { handleAsyncError } from './utils/errorHandler.ts'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Global error handlers
window.addEventListener('error', (event) => {
  handleAsyncError(event.error, 'Global Error Handler');
});

window.addEventListener('unhandledrejection', (event) => {
  handleAsyncError(event.reason, 'Unhandled Promise Rejection');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
