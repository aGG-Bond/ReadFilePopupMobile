/**
 * 功能性安全测试
 * 测试构建后的文件是否包含预期的安全功能
 */

const fs = require('fs');
const path = require('path');

describe('Security Functional Tests', () => {
  test('should have dist files after build', () => {
    // 检查构建后的文件是否存在
    const esFile = path.join(__dirname, '../dist/ReadFilePopupMobile.es.js');
    const umdFile = path.join(__dirname, '../dist/ReadFilePopupMobile.umd.js');
    
    expect(fs.existsSync(esFile)).toBe(true);
    expect(fs.existsSync(umdFile)).toBe(true);
  });

  test('should have security-related code in built files', () => {
    // 检查构建后的文件是否包含安全相关的代码
    const esFile = path.join(__dirname, '../dist/ReadFilePopupMobile.es.js');
    const content = fs.readFileSync(esFile, 'utf-8');
    
    // 检查是否包含安全相关的关键字
    expect(content).toContain('sanitize');
    expect(content).toContain('SecurityUtils');
    expect(content).toContain('isValidFilePath');
    expect(content).toContain('DOMPurify');
    expect(content).toContain('DEFAULT_SECURITY_CONFIG');
  });

  test('should have type definition files', () => {
    // 检查类型定义文件是否存在
    const typeFile = path.join(__dirname, '../dist/types/ReadFilePopupMobile.d.ts');
    expect(fs.existsSync(typeFile)).toBe(true);
  });
});