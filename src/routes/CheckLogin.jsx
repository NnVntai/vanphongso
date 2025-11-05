import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import React, { useEffect, useState } from "react";

const CheckLogin = () => {
  const [getusername, setGetusername] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('authToken');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      // Không có token → chuyển về login
      if (!token) {
        navigate('/login', { replace: true, state: { from: location } });
        return;
      }
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const decoded = jwtDecode(token);
        const tokenExp = decoded.exp * 1000; // chuyển về milliseconds

        const serverTimeAtLogin = parseInt(localStorage.getItem("serverTimeAtLogin"));
        const clientTimeAtLogin = parseInt(localStorage.getItem("clientTimeAtLogin"));
        const nowClient = Date.now();
        // console.log(serverTimeAtLogin,clientTimeAtLogin);
        const estimatedServerNow = serverTimeAtLogin + (nowClient - clientTimeAtLogin);
        // console.log(tokenExp, estimatedServerNow);
        if (tokenExp < estimatedServerNow) {
          localStorage.removeItem("authToken");
          confirmAlert({
            title: "Phiên đăng nhập hết hạn",
            message: "Vui lòng đăng nhập lại",
            buttons: [
              {
                label: "OK",
                onClick: () => {
                  // const navigate = useNavigate();
                  // const location = useLocation();
                  navigate("/login", { replace: true, state: { from: location } });
                },
              },
            ],
          });
          return;
        }

        const user = JSON.parse(localStorage.getItem("username"));
        setGetusername(user);
      } catch (error) {
        // Token sai định dạng
        localStorage.removeItem('authToken');
        confirmAlert({
          title: 'Lỗi xác thực',
          message: 'Phiên đăng nhập không hợp lệ',
          buttons: [
            {
              label: 'OK',
              onClick: () => {
                navigate('/login', { replace: true, state: { from: location } });
              }
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token, location, navigate]);

  useEffect(() => {
    // Khi getusername đã có dữ liệu → kiểm tra thiếu thông tin
    if (getusername) {
      const missingInfo =
          !getusername.name || !getusername.email || !getusername.phone;

      if (missingInfo) {
        navigate('/updateuser', { replace: true });
      }
    }
  }, [getusername, navigate]);

  if (loading) return <p>Đang kiểm tra đăng nhập...</p>;

  return <Outlet />;
};

export default CheckLogin;
