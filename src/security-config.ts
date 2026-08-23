/**
 * 安全配置文件
 * 定义组件的安全策略和验证规则
 */

export interface SecurityConfig {
  allowedFileTypes: string[];
  allowedTags: string[];
  allowedAttributes: string[];
  forbiddenTags: string[];
  forbiddenAttributes: string[];
  maxFileNameLength: number;
  maxFileSize: number; // bytes
}

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  // 允许的文件类型
  allowedFileTypes: ['pdf', 'txt', 'html', 'htm'],
  
  // 允许的HTML标签（用于富文本净化）
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'
  ],
  
  // 允许的HTML属性
  allowedAttributes: ['style', 'class', 'id'],
  
  // 禁止的标签
  forbiddenTags: [
    'script', 'iframe', 'object', 'embed', 'form', 
    'input', 'textarea', 'button', 'select', 'option'
  ],
  
  // 禁止的属性
  forbiddenAttributes: [
    'onload', 'onclick', 'onerror', 'onmouseover', 
    'onsubmit', 'onchange', 'onfocus', 'onblur'
  ],
  
  // 文件名最大长度
  maxFileNameLength: 255,
  
  // 文件大小限制 (10MB)
  maxFileSize: 10 * 1024 * 1024
};

// 路径安全验证正则表达式
export const PATH_VALIDATION_REGEX = /^[a-zA-Z0-9\/._\-]+$/;

// 文件路径黑名单模式
export const PATH_BLACKLIST_PATTERNS = [
  /\.\./g,           // 防止路径遍历
  /\/\//g,           // 防止双斜杠
  /^\//,             // 防止绝对路径
  /[<>:"|?*\x00-\x1f]/g  // 防止特殊字符
];

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