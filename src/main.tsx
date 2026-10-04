import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/biz-udpgothic/japanese-400.css'
import '@fontsource/biz-udpgothic/japanese-700.css'
import '@fontsource/biz-udpgothic/latin-400.css'
import '@fontsource/biz-udpgothic/latin-700.css'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
