// routes/privateRoutes.js
import { lazy } from 'react';

// const DashboardPage = lazy(() => import('../pages/Dashboard'));
// const ProfilePage = lazy(() => import('../pages/Profile'));
import CheckLogin from './CheckLogin';
import  RequireRole from './CheckPermission';

const Home = lazy(() => import('../pages/Home'));
const Setting = lazy(() => import('../pages/Setting'));
const ChangeAuth = lazy(() => import('../pages/Setting/changeAuth'));
const ReportHistory = lazy(() => import('../pages/Report/ReportHistory'));
const ReportAdmin = lazy(() => import('../pages/Report/ReportAdmin'));
const ReportManual = lazy(() => import('../pages/Report/ReportManual'));
const IndexAdmin = lazy(() => import('../pages/Report/indexAdmin'));
const ChitieuList = lazy(() => import('../pages/ChiTieu/ChitieuList'));
const IndexChiTieu = lazy(() => import('../pages/ChiTieu/IndexChiTieu'));
const ReportAll = lazy(() => import('../pages/Report/ReportAll'));
const ReportFile = lazy(() => import('../pages/Report/ReportFile'));
const UpdateUser = lazy(() => import('../pages/Auth/UpdateUser'));
const KeHoachManual = lazy(() => import('../pages/KeHoach/KeHoach'));
const KeHoach = lazy(() => import('../pages/KeHoach/'));
const KeHoachFile = lazy(() => import('../pages/KeHoach/KeHoachFile'));

const Userindex = lazy(() => import('../pages/User'));
const ChangePassword = lazy(() => import('../pages/Auth/ChangePassword'));
const MainLayout = lazy(() => import('../layouts/MainLayout'));

const TelePhone = lazy(() => import('../pages/Support/indexSupport'));

const FormPhone = lazy(() => import('../pages/Support/formSupport'));

const InfoPhone = lazy(() => import('../pages/Support/infoSupport'));
const Notification = lazy(() => import('../pages/Notification'));
const Monthly = lazy(() => import('../pages/Notification/Monthly.jsx'));
const Quarterly = lazy(() => import('../pages/Notification/Quarterly.jsx'));
const Yearly = lazy(() => import('../pages/Notification/Yearly.jsx'));
const Weekly = lazy(() => import('../pages/Notification/Weekly.jsx'));

const AdminSupport = lazy(() => import('../pages/Support/indexSupportAdmin.jsx'));
const ExcelFormular = lazy(() => import('../pages/ChiTieu/Formular.jsx'));

const privateRoutes = [
  {
    element: <CheckLogin />, // ⛔ kiểm tra token ở đây
    children: [{
      path: '/',
      element: <MainLayout />, // layout này sẽ bọc các route con
      children: [
        {
          index: true, // ✅ Trang mặc định khi path = "/"
          element:
              // (
              // <RequireRole allowedRoles={['admin']}>
                    <Home />
            // </RequireRole >),
        },
        {
           path: "updateuser",// ✅ Trang mặc định khi path = "/"
          element:
              // (
              // <RequireRole allowedRoles={['admin']}>
                    <UpdateUser />
            // </RequireRole >),
        },
          {
              path: "changepassword",// ✅ Trang mặc định khi path = "/"
              element:
              // (
              // <RequireRole allowedRoles={['admin']}>
                  <ChangePassword />
              // </RequireRole >),
          },
          {
              path: "kehoach",// ✅ Trang mặc định khi path = "/"
              element:
              // (
              // <RequireRole allowedRoles={['admin']}>
                  <KeHoach />
              // </RequireRole >),
          },
          {
              path: "kehoachmanual",// ✅ Trang mặc định khi path = "/"
              element:
              // (
              // <RequireRole allowedRoles={['admin']}>
                  <KeHoachManual />
              // </RequireRole >),
          },
          {
              path: "kehoachfile",// ✅ Trang mặc định khi path = "/"
              element:
              // (
              // <RequireRole allowedRoles={['admin']}>
                  <KeHoachFile />
              // </RequireRole >),
          },

         {
          path: "setting", // ✅ Trang mặc định khi path = "/"
          element: <Setting />,
           // roles: ['user', 'admin']
        },{
          path: "indexchitieu",
              element:(
                  <RequireRole allowedRoles={['admin']}>
                      <IndexChiTieu />
                  </RequireRole>)
          }
          ,
          {
              path: "listuser", // ✅ Trang mặc định khi path = "/"
              element: <Userindex />,
              // roles: ['user', 'admin']
          },
        {
          path: "setting/changeAuth", // ✅ Trang mặc định khi path = "/"
          element: (
              <RequireRole allowedRoles={['admin']}>
                <ChangeAuth />
              </RequireRole >)
          // , roles: ['user', 'admin']
        },
        {

          path: "chitieu", // ✅ Trang mặc định khi path = "/"
          element: (
              <RequireRole allowedRoles={['admin']}>
                <ChitieuList />
              </RequireRole >)
        },
        {
          path: "reportfile", // ✅ Trang mặc định khi path = "/"
          element: (
              <RequireRole allowedRoles={['client']}>
                <ReportFile />
              </RequireRole >)
        },
        {
          path: "reporthistory", // ✅ Trang mặc định khi path = "/"
          element: (
              <RequireRole allowedRoles={['client']}>
                <ReportHistory />
              </RequireRole >)
        },
          {
              path:"reportindex",
              element: (
                  <RequireRole allowedRoles={['admin']}>
                      <IndexAdmin />
                  </RequireRole>
              )
          },
        {
          path: "reportadmin", // ✅ Trang mặc định khi path = "/"
          element: (
              <RequireRole allowedRoles={['admin']}>
                <ReportAdmin />
              </RequireRole >)
        },
          {
              path: "reportall", // ✅ Trang mặc định khi path = "/"
              element: (
                  <RequireRole allowedRoles={['admin']}>
                      <ReportAll />
                  </RequireRole >)
          },
          {
              path: "reportmanual", // ✅ Trang mặc định khi path = "/"
              element: (
                  <RequireRole allowedRoles={['client']}>
                      <ReportManual />
                  </RequireRole >)
          },
          {
              path: "telephone", // ✅ Trang mặc định khi path = "/"
              element: (
                  <RequireRole allowedRoles={['client']}>
                      <TelePhone />
                  </RequireRole >)
          },
          {
              path: "formtelephone", // ✅ Trang mặc định khi path = "/"
              element: (
                  <RequireRole allowedRoles={['client']}>
                      <FormPhone />
                  </RequireRole >)
          },
          {
              path: "infotelephone", // ✅ Trang mặc định khi path = "/"
              element: (
                  <RequireRole allowedRoles={['client']}>
                      <InfoPhone />
                  </RequireRole >)
          },
          {
              path: "adminSupport", // ✅ Trang mặc định khi path = "/"
              element: (
                  <RequireRole allowedRoles={['admin']}>
                      <AdminSupport />
                  </RequireRole >)
          },
          {
              path: "notification", // ✅ Trang mặc định khi path = "/"
              element: (
                  <RequireRole allowedRoles={['admin']}>
                      <Notification />
                  </RequireRole >)
          },
          {
              path: "yearly", // ✅ Trang mặc định khi path = "/"
              element: (
                  <RequireRole allowedRoles={['admin']}>
                      <Yearly />
                  </RequireRole >)
          },
          {
              path: "weekly", // ✅ Trang mặc định khi path = "/"
              element: (
                  <RequireRole allowedRoles={['admin']}>
                      <Weekly />
                  </RequireRole >)
          },
          {
              path: "monthly", // ✅ Trang mặc định khi path = "/"
              element: (
                  <RequireRole allowedRoles={['admin']}>
                      <Monthly />
                  </RequireRole >)
          },
          {
              path: "quarterly", // ✅ Trang mặc định khi path = "/"
              element: (
                  <RequireRole allowedRoles={['admin']}>
                      <Quarterly />
                  </RequireRole >)
          },
          {
              path: "excelformular", // ✅ Trang mặc định khi path = "/"
              element: (
                  <RequireRole allowedRoles={['admin']}>
                      <ExcelFormular />
                  </RequireRole >)
          },



        // { path: 'about', element: <About /> }
      ]
    }]
  }
];

export default privateRoutes;