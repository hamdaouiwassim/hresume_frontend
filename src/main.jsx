import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
     {/* your routes/components here */}
       <AuthProvider>
      <Toaster
        richColors 
        position="bottom-center" 
        expand={true}
      />
    <App />
    </AuthProvider>
  </StrictMode>,
)
