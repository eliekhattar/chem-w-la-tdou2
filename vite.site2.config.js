import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build and dev for the second app (site2/ folder)
export default defineConfig({
  root: 'site2',
  plugins: [react()],
})
