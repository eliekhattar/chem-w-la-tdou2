import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/chem-w-la-tdou2/',
  server: {
    host: true, // listen on 0.0.0.0 so you can open from phone: http://YOUR_PC_IP:5173/chem-w-la-tdou2/
    port: 5173,
  },
})
