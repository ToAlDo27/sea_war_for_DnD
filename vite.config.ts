import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Локальное приложение без сервера: base './' чтобы работало из file:// и любых путей
export default defineConfig({
  base: './',
  plugins: [react()],
})
