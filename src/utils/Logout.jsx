// src/utils/api.js hoặc logout.js

import axios from 'axios';
import config from '@/urlconfig';

// Tạo instance Axios
const api = axios.create({
  baseURL: `${config.API_BASE_URL}/api`,
});

// Gắn token mới nhất vào mỗi request
api.interceptors.request.use((req) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

/**
 * Đăng xuất người dùng
 * @param {Function} navigate - Hàm điều hướng (ví dụ từ useNavigate trong React Router)
 */
export async function logout(navigate) {
  const confirmed = window.confirm('Bạn có muốn đăng xuất không?');
  if (!confirmed) return;

  try {
    // Gọi API logout mà không cần gửi Authorization header (tùy backend của bạn)
    await api.post('/logout', null, {
      headers: { Authorization: undefined },
    });
  } catch (err) {
    const msg =
      err.response?.data?.message || err.message || 'Đã có lỗi xảy ra';
    alert(`Không thể đăng xuất: ${msg}`);
    localStorage.removeItem('authToken');

    // Điều hướng về trang đăng nhập
    if (navigate) {
      navigate('/login');
    } else {
      window.location.href = '/login';
    }
    return;
  }

  // Xoá token khỏi localStorage
  localStorage.removeItem('authToken');

  // Điều hướng về trang đăng nhập
  if (navigate) {
    navigate('/login');
  } else {
    window.location.href = '/login';
  }
}

// Export cả api instance để dùng chung
export default api;
