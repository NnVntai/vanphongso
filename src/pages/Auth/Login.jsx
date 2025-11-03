import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '@/urlconfig';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/'); // Redirect nếu đã login
    }else {
      const savedUser = localStorage.getItem("savedUsername");
      const savedPass = localStorage.getItem("savedPassword");
      if (savedUser && savedPass) {
        setUsername(savedUser);
        setPassword(savedPass);
        setRememberMe(true);
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/login`, {
        username,
        password,
      });
      // console.log(response);
      const token = response.data.access_token;
      const serverTime = response.data.serverTime;
      // console.log(response.data);
      const role = response.data.user.id_xa;
      // console.log(role);
      localStorage.setItem('authToken', token);
      localStorage.setItem('username',JSON.stringify(response.data.user));
      localStorage.setItem("serverTimeAtLogin", serverTime*1000); // Thời gian server
      localStorage.setItem("clientTimeAtLogin", Date.now()); // Thời gian client
      if (rememberMe) {
        localStorage.setItem("savedUsername", username);
        localStorage.setItem("savedPassword", password); // ⚠️ Không an toàn nếu lưu plain text
      } else {
        localStorage.removeItem("savedUsername");
        localStorage.removeItem("savedPassword");
      }
      if(role!==null)
      {
        localStorage.setItem('role', "client");
      }else{
        navigate('/');
        localStorage.setItem('role', "admin");
      }
      navigate('/');
      // if(role.id_xa!==null)
      // {
      //   navigate('/client');
      // }else {
      //   navigate('/');
      // }
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Đăng nhập</h2>
      <form className="space-y-5" onSubmit={handleLogin}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600">Tên tài khoản</label>
          <input
            type="text"
            id="email"
            name="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-600">Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="form-checkbox text-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
}

export default Login;
