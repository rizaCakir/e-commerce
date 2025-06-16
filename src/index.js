import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ApiProvider } from './contexts/ApiContext';
import { ToastProvider } from './contexts/ToastContext';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApiProvider>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </ApiProvider>
  </React.StrictMode>
);

reportWebVitals();
