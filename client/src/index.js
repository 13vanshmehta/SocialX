/**
 * SocialX - Application Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Disable the service worker by default so production updates are not blocked by stale cached bundles.
serviceWorkerRegistration.unregister();

// Performance monitoring
reportWebVitals();
