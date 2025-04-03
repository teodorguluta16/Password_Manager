import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  //server: {
  //  host: 'secure-facebook-login.net',
  //  port: 3000
  //}
})
