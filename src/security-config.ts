/**
 * 安全配置文件
 * 定义组件的安全策略和验证规则
 */

import DOMPurify from 'dompurify';

export interface SecurityConfig {
  allowedFileTypes: string[];
  allowedTags: string[];
  allowedAttributes: string[];
  forbiddenTags: string[];
  forbiddenAttributes: string[];
  maxFileNameLength: number;
  maxFileSize: number; // bytes
  allowedProtocols: string[]; // 允许的 URL 协议
}

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  // 允许的文件类型
  allowedFileTypes: ['pdf', 'txt', 'html', 'htm'],
  
  // 允许的 HTML 标签（用于富文本净化）
  allowedTags: [
    // 文本格式化
    'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'span', 'div', 'blockquote', 'pre', 'code',
    
    // 列表
    'ol', 'ul', 'li',
    
    // 链接和图片（常用且安全）
    'a', 'img',
    
    // 表格（协议中常见）
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],
  
  // 允许的 HTML 属性
  allowedAttributes: [
    'style', 'class', 'id',
    'href', 'target', 'rel',        // 链接属性
    'src', 'alt', 'width', 'height', // 图片属性
    'colspan', 'rowspan'             // 表格属性
  ],
  
  // 禁止的标签
  forbiddenTags: [
    'script', 'iframe', 'object', 'embed',
    'form', 'input', 'textarea', 'button',
    'select', 'option', 'style', 'meta', 'link',
    'video', 'audio', 'source' // 媒体标签
  ],
  
  // 禁止的属性（事件处理器）
  forbiddenAttributes: [
    'onload', 'onclick', 'onerror', 'onmouseover',
    'onsubmit', 'onchange', 'onfocus', 'onblur',
    'onkeydown', 'onkeyup', 'onkeypress', 'onmouseout',
    'onmousedown', 'onmouseup', 'ondblclick', 'oncontextmenu'
  ],
  
  // 文件名最大长度
  maxFileNameLength: 255,
  
  // 文件大小限制 (10MB)
  maxFileSize: 10 * 1024 * 1024,
  
  // 允许的 URL 协议（白名单）
  allowedProtocols: ['http:', 'https:']
};

/**
 * 安全检查结果接口
 */
export interface SecurityCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 创建安全检查结果
 */
export function createSecurityCheckResult(
  isValid: boolean = true,
  errors: string[] = [],
  warnings: string[] = []
): SecurityCheckResult {
  return { isValid, errors, warnings };
}

/**
 * 验证文件路径安全性
 * 借鉴 DOMPurify 的思路：使用浏览器原生 URL API + 协议白名单
 */
export function isValidFilePath(path: string): SecurityCheckResult {
  const result = createSecurityCheckResult(true);
  
  // 1. 空值检查
  if (!path || typeof path !== 'string') {
    result.isValid = false;
    result.errors.push('路径不能为空');
    return result;
  }
  
  // 2. 长度检查
  if (path.length > DEFAULT_SECURITY_CONFIG.maxFileNameLength) {
    result.isValid = false;
    result.errors.push(`路径长度超过限制 (${DEFAULT_SECURITY_CONFIG.maxFileNameLength}字符)`);
    return result;
  }
  
  // 3. HTTP/HTTPS URL 检测（使用浏览器原生 URL API）
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      // 协议白名单检查
      if (!DEFAULT_SECURITY_CONFIG.allowedProtocols.includes(url.protocol)) {
        result.isValid = false;
        result.errors.push('不允许的协议');
        return result;
      }
      // URL 格式有效，返回成功
      return result;
    } catch {
      result.isValid = false;
      result.errors.push('URL 格式错误');
      return result;
    }
  }
  
  // 4. 本地路径检测（简化的黑名单）
  // 防止路径遍历攻击
  if (path.includes('..')) {
    result.isValid = false;
    result.errors.push('路径包含非法字符（..）');
    return result;
  }
  
  // 防止空字节注入
  if (path.includes('\0')) {
    result.isValid = false;
    result.errors.push('路径包含非法字符（空字节）');
    return result;
  }
  
  // 5. 文件扩展名检查
  const ext = path.split('.').pop()?.toLowerCase();
  if (!ext || !DEFAULT_SECURITY_CONFIG.allowedFileTypes.includes(ext)) {
    result.isValid = false;
    result.errors.push(`不支持的文件类型: ${ext || '未知'}`);
    return result;
  }
  
  return result;
}

/**
 * 安全工具类
 * 提供 XSS 防护、路径验证、HTML 净化等功能
 */
export class SecurityUtils {
  // 验证文件路径安全性
  static isValidFilePath(path: string): SecurityCheckResult {
    return isValidFilePath(path);
  }

  // 验证文件扩展名
  static isValidFileExtension(ext: string): boolean {
    return DEFAULT_SECURITY_CONFIG.allowedFileTypes.includes(ext.toLowerCase());
  }

  // 净化HTML内容，防止XSS攻击
  static sanitizeHTML(html: string, allowLinksAndImages: boolean = false): string {
    try {
      // 根据配置动态调整允许的标签和属性
      let allowedTags = [...DEFAULT_SECURITY_CONFIG.allowedTags];
      let allowedAttributes = [...DEFAULT_SECURITY_CONFIG.allowedAttributes];
      
      // 如果不允许链接和图片，移除相关标签和属性
      if (!allowLinksAndImages) {
        allowedTags = allowedTags.filter(tag => tag !== 'a' && tag !== 'img');
        allowedAttributes = allowedAttributes.filter(
          attr => !['href', 'target', 'rel', 'src', 'alt', 'width', 'height'].includes(attr)
        );
      }
      
      // 配置DOMPurify选项
      const cleanHTML = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: allowedAttributes,
        FORBID_TAGS: DEFAULT_SECURITY_CONFIG.forbiddenTags,
        FORBID_ATTR: DEFAULT_SECURITY_CONFIG.forbiddenAttributes
      });
      return cleanHTML;
    } catch (error) {
      console.warn('HTML净化失败:', error);
      return '<p>内容加载失败</p>';
    }
  }

  // 安全的错误信息处理
  static getSafeErrorMessage(originalError: string): string {
    // 移除可能暴露系统信息的敏感内容
    let safeError = originalError.replace(/(file:\/\/|\/[^\/].*?\.[^\/\s]+)/gi, '[文件路径]');
    safeError = safeError.replace(/(localhost|127\.0\.0\.1|::1)/gi, '[本地地址]');
    return safeError;
  }

  // HTML 实体转义，防止 XSS
  static escapeHtml(str: string | undefined): string {
    if (!str) return '';
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return str.replace(/[&<>"']/g, match => htmlEntities[match]);
  }

  // 验证文件大小
  static isValidFileSize(size: number): boolean {
    return size <= DEFAULT_SECURITY_CONFIG.maxFileSize;
  }
}