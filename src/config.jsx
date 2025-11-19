// api.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const api = axios.create({
  // baseURL: 'http://123.25.238.108:8092/api',
  // baseURL: 'http://localhost:8081/api',
  baseURL: 'https://tknn.ttcntnmt.com.vn/api',
});

// Interceptor request để check token
api.interceptors.request.use(
    async (config) => {
      const token = localStorage.getItem('authToken');

      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            // Token hết hạn
            localStorage.removeItem('authToken');
            confirmAlert({
              title: 'Phiên đăng nhập hết hạn',
              message: 'Vui lòng đăng nhập lại.',
              buttons: [
                {
                  label: 'OK',
                  onClick: () => {
                    window.location.href = '/login'; // dùng window.location thay vì <Navigate /> trong interceptor
                  }
                }
              ]
            });

            // Dừng request bằng cách throw lỗi
            throw new axios.Cancel('Token expired');
          }

          // Token còn hạn → thêm vào header
          config.headers.Authorization = `Bearer ${token}`;
        } catch (err) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          throw new axios.Cancel('Invalid token');
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

export default api;
