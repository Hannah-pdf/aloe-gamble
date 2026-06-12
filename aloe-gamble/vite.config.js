import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 배포 시 레포 이름으로 base 경로를 맞춰주세요.
// 예: https://<username>.github.io/aloe-gamble/  -> base: '/aloe-gamble/'
export default defineConfig({
  plugins: [react()],
  base: '/aloe-gamble/',
})
