import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, readFileSync } from 'fs';
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
    {
      name: 'copy-pdfjs-assets',
      writeBundle() {
        const pdfJsDir = resolve(__dirname, 'node_modules/pdfjs-dist/build');
        const outputDir = resolve(__dirname, 'dist');
        copyFileSync(resolve(pdfJsDir, 'pdf.min.js'), resolve(outputDir, 'pdf.min.js'));
        copyFileSync(resolve(pdfJsDir, 'pdf.worker.min.js'), resolve(outputDir, 'pdf.worker.min.js'));
      }
    },
    dts({
      outDir: 'dist/types',
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/ReadFilePopupMobile.es.js'),
      name: 'FilePreview',
      formats: ['es', 'umd'],
      fileName: (format) => `ReadFilePopupMobile.${format}.js`,
    },
    outDir: 'dist',
    minify: false,
    rollupOptions: {
      // UMD 构建时不 externalize 依赖，让它们被打包进文件
      output: {
        exports: 'named'
      },
    },
  },
});