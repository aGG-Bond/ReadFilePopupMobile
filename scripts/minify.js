const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

// 读取 package.json 获取 banner 信息
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
const { version, license, author, homepage } = packageJson;
const currentYear = new Date().getFullYear();

const banner = `/*!
 * ReadFilePopupMobile Component v${version}
 * GitHub: ${homepage}
 * (c) ${currentYear} ${author}
 * @license ${license}
 */`;

async function minifyFiles() {
  const distDir = path.join(__dirname, '../dist');
  
  // 读取 dist 目录中的文件
  const files = fs.readdirSync(distDir).filter(file => 
    file.endsWith('.js') && !file.includes('.min.') && !file.includes('types')
  );
  
  for (const file of files) {
    const filePath = path.join(distDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 生成压缩版本的文件名
    const minFileName = file.replace('.js', '.min.js');
    const minFilePath = path.join(distDir, minFileName);
    
    try {
      const result = await minify(content, {
        format: {
          comments: false,
          preamble: banner  // 为压缩版本添加 banner
        },
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.warn']
        }
      });
      
      fs.writeFileSync(minFilePath, result.code);
      console.log(`Generated: ${minFileName}`);
    } catch (error) {
      console.error(`Error minifying ${file}:`, error);
    }
  }
}

minifyFiles().catch(console.error);