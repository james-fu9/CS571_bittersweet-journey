import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './app/App.jsx';
import { JourneyProvider } from './state/JourneyContext.jsx';
import './styles/app.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <JourneyProvider><App /></JourneyProvider>
    </HashRouter>
  </StrictMode>,
);
