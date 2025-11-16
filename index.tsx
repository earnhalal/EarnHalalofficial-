// FIX: Added Vite client types reference to the application entrypoint.
// This ensures that TypeScript loads the necessary global types for Vite projects,
// including the correct JSX namespace for React and types for `import.meta.env`.
// This single change resolves all 'Property does not exist on type 'JSX.IntrinsicElements''
// and 'Property 'env' does not exist on type 'ImportMeta'' errors throughout the application.
/// <reference types="vite/client" />

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