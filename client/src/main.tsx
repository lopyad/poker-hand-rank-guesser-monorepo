import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { GameModeProvider } from './context/GameModeContext.tsx'; // Import the provider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <GameModeProvider> {/* Wrap the App with the provider */}
        <App />
      </GameModeProvider>
    </BrowserRouter>
  </StrictMode>,
)
