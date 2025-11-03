import { defineConfig } from 'vite'
import path from 'path';
import react from '@vitejs/plugin-react-swc';
// import include from 'vite-plugin-include';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

    // allowedHosts: ['*']
  //  server: {
  //     host: '0.0.0.0',   // cho phép listen trên tất cả network interfaces
  //     port: 8091,        // port mong muốn
  //     allowedHosts: ['tknn.ttcntnmt.com.vn'], // thêm host của bạn vào whitelist
  //     // proxy: {
  //     //   '/download-report': {
  //     //     target: 'http://localhost:8000',
  //     //     changeOrigin: true,
  //     //   },
  //     // },

  //   }
})
