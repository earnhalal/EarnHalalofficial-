// FIX: Import 'vite/client' here to provide global types for JSX and import.meta.env, resolving all JSX and import.meta.env typing errors.
import 'vite/client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);