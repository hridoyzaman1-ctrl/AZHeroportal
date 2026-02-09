
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('App failed to mount:', error);
  rootElement.innerHTML = `<div style="color:red;padding:20px;"><h1>App Error</h1><pre>${error}</pre></div>`;
}
