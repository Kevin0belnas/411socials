import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
    host: '0.0.0.0', // Enables LAN access
    port: 5174     // You can change if needed
  }
})


// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import os from 'os';

// // Dynamically detect the local IP address
// const getLocalIP = () => {
//   const interfaces = os.networkInterfaces();
//   for (const name of Object.keys(interfaces)) {
//     for (const net of interfaces[name]) {
//       if (net.family === 'IPv4' && !net.internal) {
//         return net.address;
//       }
//     }
//   }
//   return 'localhost'; // Fallback
// };

// const localIP = getLocalIP();

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0', // Allow access from LAN devices
//     port: 5173,
//     strictPort: true,
//     open: true
//   },
//   define: {
//     'process.env.VITE_LOCAL_API_URL': JSON.stringify(`http://localhost:3000`),
//     'process.env.VITE_NETWORK_API_URL': JSON.stringify(`http://${localIP}:3000`)
//   }
// });
