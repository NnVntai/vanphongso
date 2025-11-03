import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';

import publicRoutes from './publicRoutes';
import privateRoutes from './privateRoutes';

import LoadingSpinner from '../components/LoadingSpinner';
const AppRoutes = () => {
  const routes = useRoutes([...publicRoutes,...privateRoutes]);

  return (
    <Suspense fallback={<LoadingSpinner fullscreen/>}>
      {routes}
    </Suspense>
  );
};

export default AppRoutes;
