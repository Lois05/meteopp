import { createRoot } from 'react-dom/client'
import "./styles/global.css";
import App from './App.jsx'

// On enlève <StrictMode> pour éviter le double appel de l'API au démarrage
createRoot(document.getElementById('root')).render(
    <App />
)