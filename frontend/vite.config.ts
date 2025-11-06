import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // 빌드 최적화
    target: 'esnext',
    minify: 'terser',

    // 소스맵 설정 (프로덕션에서는 hidden으로 설정)
    sourcemap: false,

    // 청크 크기 경고 설정
    chunkSizeWarningLimit: 500,

    // Rollup 옵션
    rollupOptions: {
      output: {
        // 청크 분할 전략
        manualChunks: {
          // React 관련 라이브러리를 별도 청크로 분리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // MUI 라이브러리를 별도 청크로 분리
          'mui-vendor': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
          ],

          // Socket.IO를 별도 청크로 분리
          'websocket-vendor': ['socket.io-client'],

          // 기타 라이브러리
          'utils-vendor': ['axios', 'zustand', 'i18next', 'react-i18next'],
        },

        // 청크 파일명 패턴
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // 빌드 성능 최적화
    terserOptions: {
      compress: {
        // 프로덕션 빌드에서 console.log 제거
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  // 개발 서버 설정
  server: {
    port: 3099,
    strictPort: false,
    host: true,
  },

  // 프리뷰 서버 설정
  preview: {
    port: 3099,
    strictPort: false,
    host: true,
  },
})
