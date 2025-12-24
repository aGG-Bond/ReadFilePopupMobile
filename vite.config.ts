import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import dts from 'vite-plugin-dts'

const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

const { version, license, author, homepage } = packageJson;
const currentYear = new Date().getFullYear();

const banner = `/*!
 * myPopup Component v${version}
 * GitHub: ${homepage}
 * (c) ${currentYear} ${author}
 * @license ${license}
 */`;

export default defineConfig({
  server: {
    open: '/demo/test.html'
  },
  plugins: [
    dts({
      outDir: 'dist/types',  // 指定类型文件输出目录
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/ReadFilePopupMobile.ts'),
      name: 'FilePreview',
      formats: ['es', 'umd'],
      fileName: (format) => `ReadFilePopupMobile.${format}.min.js`,
    },
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn']
      },
      format: {
        comments: false,
        preamble: banner
      }
    },
    rollupOptions: {
      external: ['@aggbond/my-popup'],
      output: {
        globals: {
          '@aggbond/my-popup': 'Popup'
        },
        exports: 'default'
      },
    },
  },
});