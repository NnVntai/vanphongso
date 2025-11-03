// App.js
import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppRoutes from './routes';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;