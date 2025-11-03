import { lazy } from 'react';

// const Home = lazy(() => import('../pages/Home'));
// const Setting = lazy(() => import('../pages/Setting'));
// const ChangeAuth = lazy(() => import('../pages/Setting/changeAuth'));
const MainLayout = lazy(() => import('../layouts/AuthLayout'));
const NoteFound = lazy(() => import('../pages/Error/404.jsx'));
const AuthPermission = lazy(() => import('../pages/Error/403.jsx'));

const Login = lazy(() => import('../pages/Auth/Login'));
export const publicRoutes = [
  {

    path: '/Login',
    element: <MainLayout />, // layout này sẽ bọc các route con
    children: [
      {
        index: true, // ✅ Trang mặc định khi path = "/"
        element: <Login />
      },
    ],
  },
  {
    path: '*',
    element: <MainLayout />, // layout này sẽ bọc các route con
    children: [
      {
        path: '*', // ✅ Trang mặc định khi path = "/"
        element: <NoteFound />
      },
      {
        path: "403", // ✅ Trang mặc định khi path = "/"
        element: <AuthPermission />,
        // roles: ['user', 'admin']
      },
    ]
  }
];

export default publicRoutes;