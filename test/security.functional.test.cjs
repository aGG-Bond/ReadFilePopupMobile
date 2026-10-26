/**
 * 功能性安全测试
 * 测试构建后的文件是否包含预期的安全功能
 */

const fs = require('fs');
const path = require('path');

describe('Build Output Tests', () => {
  test('should have ES module dist file after build', () => {
    const esFile = path.join(__dirname, '../dist/ReadFilePopupMobile.es.js');
    expect(fs.existsSync(esFile)).toBe(true);
  });

  test('should have security-related code in built files', () => {
    const esFile = path.join(__dirname, '../dist/ReadFilePopupMobile.es.js');
    const content = fs.readFileSync(esFile, 'utf-8');
    
    expect(content).toContain('sanitize');
    expect(content).toContain('SecurityUtils');
    expect(content).toContain('DOMPurify');
    expect(content).toContain('DEFAULT_SECURITY_CONFIG');
  });

  test('should have type definition files', () => {
    const typeFile = path.join(__dirname, '../dist/types/ReadFilePopupMobile.d.ts');
    expect(fs.existsSync(typeFile)).toBe(true);
  });

  test('should not have UMD files (ESM only)', () => {
    const umdFile = path.join(__dirname, '../dist/ReadFilePopupMobile.umd.js');
    expect(fs.existsSync(umdFile)).toBe(false);
  });
});
