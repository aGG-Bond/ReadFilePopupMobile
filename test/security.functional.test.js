/**
 * 功能性安全测试
 * 测试构建后的文件是否包含预期的安全功能
 */

const fs = require('fs');
const path = require('path');

// 导入安全工具进行测试
const { SecurityUtils } = require('../dist/ReadFilePopupMobile.umd.js');

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

describe('DOMPurify XSS Protection Tests', () => {
  describe('JavaScript 过滤测试', () => {
    test('应过滤 script 标签', () => {
      const malicious = '<p>正常内容</p><script>alert("XSS")</script>';
      const clean = SecurityUtils.sanitizeHTML(malicious, false);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert');
      expect(clean).toContain('正常内容');
    });

    test('应过滤 javascript: 协议', () => {
      const malicious = '<a href="javascript:alert(1)">点击</a>';
      const clean = SecurityUtils.sanitizeHTML(malicious, true);
      expect(clean).not.toContain('javascript:');
      expect(clean).not.toContain('alert');
    });

    test('应过滤事件处理器 onclick', () => {
      const malicious = '<button onclick="alert(1)">按钮</button>';
      const clean = SecurityUtils.sanitizeHTML(malicious, false);
      expect(clean).not.toContain('onclick');
      expect(clean).not.toContain('alert');
    });

    test('应过滤事件处理器 onerror', () => {
      const malicious = '<img src="x" onerror="alert(1)">';
      const clean = SecurityUtils.sanitizeHTML(malicious, true);
      expect(clean).not.toContain('onerror');
      expect(clean).not.toContain('alert');
    });

    test('应过滤 onload 事件', () => {
      const malicious = '<img src="x" onload="alert(1)">';
      const clean = SecurityUtils.sanitizeHTML(malicious, true);
      expect(clean).not.toContain('onload');
      expect(clean).not.toContain('alert');
    });

    test('应过滤 iframe 标签', () => {
      const malicious = '<iframe src="javascript:alert(1)"></iframe>';
      const clean = SecurityUtils.sanitizeHTML(malicious, false);
      expect(clean).not.toContain('<iframe');
      expect(clean).not.toContain('javascript:');
    });

    test('应过滤 embed 标签', () => {
      const malicious = '<embed src="javascript:alert(1)">';
      const clean = SecurityUtils.sanitizeHTML(malicious, false);
      expect(clean).not.toContain('<embed');
    });

    test('应过滤 object 标签', () => {
      const malicious = '<object data="javascript:alert(1)"></object>';
      const clean = SecurityUtils.sanitizeHTML(malicious, false);
      expect(clean).not.toContain('<object');
    });

    test('应过滤 form 标签', () => {
      const malicious = '<form action="javascript:alert(1)"><input type="submit"></form>';
      const clean = SecurityUtils.sanitizeHTML(malicious, false);
      expect(clean).not.toContain('<form');
      expect(clean).not.toContain('<input');
    });

    test('应过滤 style 标签（防止 CSS 注入）', () => {
      const malicious = '<style>body{background:url(javascript:alert(1))}</style>';
      const clean = SecurityUtils.sanitizeHTML(malicious, false);
      expect(clean).not.toContain('<style');
    });

    test('应过滤 data: 协议的脚本', () => {
      const malicious = '<a href="data:text/html,<script>alert(1)</script>">链接</a>';
      const clean = SecurityUtils.sanitizeHTML(malicious, true);
      expect(clean).not.toContain('data:');
      expect(clean).not.toContain('<script>');
    });

    test('应过滤 vbscript: 协议', () => {
      const malicious = '<a href="vbscript:MsgBox(1)">链接</a>';
      const clean = SecurityUtils.sanitizeHTML(malicious, true);
      expect(clean).not.toContain('vbscript:');
    });
  });

  describe('allowLinksAndImages 配置测试', () => {
    test('默认模式应过滤 a 标签', () => {
      const html = '<a href="https://example.com">链接</a>';
      const clean = SecurityUtils.sanitizeHTML(html, false);
      expect(clean).not.toContain('<a');
      expect(clean).not.toContain('href');
    });

    test('默认模式应过滤 img 标签', () => {
      const html = '<img src="image.jpg" alt="图片">';
      const clean = SecurityUtils.sanitizeHTML(html, false);
      expect(clean).not.toContain('<img');
      expect(clean).not.toContain('src');
    });

    test('开启后应保留 a 标签', () => {
      const html = '<a href="https://example.com">链接</a>';
      const clean = SecurityUtils.sanitizeHTML(html, true);
      expect(clean).toContain('<a');
      expect(clean).toContain('href');
    });

    test('开启后应保留 img 标签', () => {
      const html = '<img src="image.jpg" alt="图片">';
      const clean = SecurityUtils.sanitizeHTML(html, true);
      expect(clean).toContain('<img');
      expect(clean).toContain('src');
    });

    test('开启后仍应过滤 JavaScript', () => {
      const malicious = '<a href="javascript:alert(1)">恶意链接</a>';
      const clean = SecurityUtils.sanitizeHTML(malicious, true);
      expect(clean).not.toContain('javascript:');
      expect(clean).not.toContain('alert');
    });

    test('开启后仍应过滤 onerror 事件', () => {
      const malicious = '<img src="x" onerror="alert(1)">';
      const clean = SecurityUtils.sanitizeHTML(malicious, true);
      expect(clean).not.toContain('onerror');
      expect(clean).not.toContain('alert');
    });
  });

  describe('安全内容保留测试', () => {
    test('应保留正常文本', () => {
      const html = '<p>这是一段正常的文本</p>';
      const clean = SecurityUtils.sanitizeHTML(html, false);
      expect(clean).toContain('这是一段正常的文本');
    });

    test('应保留格式化标签', () => {
      const html = '<strong>加粗</strong><em>斜体</em><u>下划线</u>';
      const clean = SecurityUtils.sanitizeHTML(html, false);
      expect(clean).toContain('<strong>');
      expect(clean).toContain('<em>');
      expect(clean).toContain('<u>');
    });

    test('应保留标题标签', () => {
      const html = '<h1>标题1</h1><h2>标题2</h2>';
      const clean = SecurityUtils.sanitizeHTML(html, false);
      expect(clean).toContain('<h1>');
      expect(clean).toContain('<h2>');
    });

    test('应保留列表标签', () => {
      const html = '<ul><li>项目1</li><li>项目2</li></ul>';
      const clean = SecurityUtils.sanitizeHTML(html, false);
      expect(clean).toContain('<ul>');
      expect(clean).toContain('<li>');
    });

    test('应保留表格标签', () => {
      const html = '<table><tr><td>单元格</td></tr></table>';
      const clean = SecurityUtils.sanitizeHTML(html, false);
      expect(clean).toContain('<table>');
      expect(clean).toContain('<td>');
    });
  });
});