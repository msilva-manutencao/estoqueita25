import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeApp } from './init'

// Inicializa configurações para evitar conflitos
initializeApp();

createRoot(document.getElementById("root")!).render(<App />);
