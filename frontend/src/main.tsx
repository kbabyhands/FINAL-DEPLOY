import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializePolyfills } from './utils/polyfills.ts';
import { usePerformanceMonitor } from './utils/performance.ts';

// Initialize polyfills for browser compatibility
initializePolyfills();

// Performance monitoring wrapper component
const AppWithPerformanceMonitor: React.FC = () => {
  usePerformanceMonitor();
  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithPerformanceMonitor />
  </React.StrictMode>,
);
