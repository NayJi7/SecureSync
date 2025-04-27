import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css' // Ajout de l'import des styles de Mantine
import ErrorBoundary from './components/ErrorBoundary'

// Initialisation des configurations pour les statistiques
const initStatsConfig = () => {
  // Définir la fréquence par défaut à 1 heure si elle n'existe pas déjà
  if (localStorage && !localStorage.getItem('statsFrequency')) {
    localStorage.setItem('statsFrequency', '3600000'); // 1 heure en millisecondes
  }
  
  // Activer la collecte par défaut si la valeur n'existe pas
  if (localStorage && localStorage.getItem('statsEnabled') === null) {
    localStorage.setItem('statsEnabled', 'true');
  }
};

// Appel de l'initialisation
initStatsConfig()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <MantineProvider>
        <App />
      </MantineProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
