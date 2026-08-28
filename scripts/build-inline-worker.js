import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workerPath = resolve(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
const outputPath = resolve(__dirname, '../src/pdf.worker.inline.ts');

const workerContent = readFileSync(workerPath);
const base64 = workerContent.toString('base64');

const output = `// 此文件由 scripts/build-inline-worker.js 自动生成
// 请勿手动修改

export const pdfWorkerBase64 = "${base64}";
`;

writeFileSync(outputPath, output);
console.log('✓ 已生成内联 worker 模块');
