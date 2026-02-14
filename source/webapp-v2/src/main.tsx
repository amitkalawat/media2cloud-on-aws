import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { loadConfig } from '@/lib/config';

loadConfig()
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch((err) => {
    document.getElementById('root')!.innerHTML = `
      <div style="display:flex;height:100vh;align-items:center;justify-content:center;font-family:sans-serif">
        <p>Failed to load configuration: ${err.message}</p>
      </div>
    `;
  });
