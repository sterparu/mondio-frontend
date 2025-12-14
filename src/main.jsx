import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// vite-plugin-pwa se ocupă automat de înregistrarea service worker-ului
// Nu este nevoie de cod manual pentru asta

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
