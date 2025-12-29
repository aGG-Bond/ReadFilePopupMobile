import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import dts from 'vite-plugin-dts';

const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

const { version, license, author, homepage } = packageJson;
const currentYear = new Date().getFullYear();

const bannerContent = `/*!
 * ReadFilePopupMobile Component v${version}
 * GitHub: ${homepage}
 * (c) ${currentYear} ${author}
 * @license ${license}
 */`;

export default defineConfig({
  server: {
    open: '/demo/test.html'
  },
  plugins: [
    {
      name: 'add-banner',
      generateBundle(options, bundle) {
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (fileName.endsWith('.js')) {
            if (chunk.type === 'chunk') {
              chunk.code = bannerContent + '\n' + chunk.code;
            }
          }
        }
      }
    },
    dts({
      outDir: 'dist/types',
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/ReadFilePopupMobile.ts'),
      name: 'FilePreview',
      formats: ['es', 'umd'],
      fileName: (format) => `ReadFilePopupMobile.${format}.js`,
    },
    outDir: 'dist',
    minify: false,
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