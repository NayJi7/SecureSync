import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css' // Ajout de l'import des styles de Mantine
import ErrorBoundary from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <MantineProvider>
        <App />
      </MantineProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
