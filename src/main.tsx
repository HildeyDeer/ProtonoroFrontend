import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/index.css'
import App from './App.tsx'

// Проверяем сохраненную тему перед рендерингом
const savedSettings = localStorage.getItem('timerSettings');
if (savedSettings) {
  try {
    const settings = JSON.parse(savedSettings);
    if (settings.darkMode !== undefined) {
      if (settings.darkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
      } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
      }
    }
  } catch (error) {
    console.error('Error loading theme from localStorage:', error);
    // По умолчанию темная тема
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  }
} else {
  // По умолчанию темная тема
  document.body.classList.add('dark-mode');
  document.body.classList.remove('light-mode');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)