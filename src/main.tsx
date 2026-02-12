import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import './styles/fonts.css';
import './styles/animations.css';

// Initialize Telegram WebApp ASAP
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setBackgroundColor('#1A1008');
  tg.setHeaderColor('#1A1008');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
