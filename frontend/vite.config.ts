import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    // Bind to all interfaces (not just localhost) so other devices on the
    // LAN can open this dev server directly, e.g. http://<this-machine-ip>:5173
    host: true,
  },
})
