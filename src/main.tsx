import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NavigationEffects } from './components/NavigationEffects';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';
import './styles/admin.css';
import './styles/public.css';
import './styles/public-header.css';
import './styles/content-admin.css';
import './styles/leads.css';
import './styles/requirements.css';
import './styles/quotations.css';
import './styles/redesign.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <NavigationEffects />
      <AuthProvider>
        <ErrorBoundary><App /></ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
