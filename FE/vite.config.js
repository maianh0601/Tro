import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Đảm bảo Vite có thể lắng nghe từ bên ngoài container
    port: 3000, // Cổng mặc định cho Vite
  },
});

// watch: {
//   usePolling: true, // Quan trọng trên Docker để phát hiện thay đổi
// },
// proxy: {
//   "/": {
//     target: "http://bephongtro.hoclaptrinhiz.com", // Địa chỉ backend nếu bạn có một API backend , nếu chạy localhost thì để vào là http://bephongtro.hoclaptrinhiz.com , còn chạy backend ở docker thì http://backend:5000
//     changeOrigin: true, // Thay đổi header của origin, cần thiết để proxy thành công
//     rewrite: (path) => path, // Đảm bảo đường dẫn đúng .replace(/^\/api/, ""),
//   },
// },
