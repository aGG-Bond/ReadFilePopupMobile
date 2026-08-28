# ReadFilePopupMobile 安全使用指南

## 🛡️ 安全特性概览

本组件已集成多重安全防护机制：

### 1. XSS防护
- ✅ 使用DOMPurify自动净化所有HTML内容
- ✅ 严格的标签和属性白名单控制
- ✅ 自动移除危险的JavaScript代码和事件处理器

### 2. 路径安全验证
- ✅ 文件路径格式验证
- ✅ 防止路径遍历攻击（`../`）
- ✅ 特殊字符过滤
- ✅ 长度限制检查

### 3. 文件类型控制
- ✅ 白名单文件类型验证
- ✅ 禁止可执行文件类型
- ✅ 支持安全的文档格式（PDF、TXT、HTML）

### 4. 请求安全
- ✅ 基本CSRF防护检查
- ✅ 跨域请求监控
- ✅ URL格式验证

### 5. 错误处理安全
- ✅ 敏感信息脱敏
- ✅ 安全的错误消息显示
- ✅ 防止信息泄露

## 🔧 安全配置说明

### 文件类型白名单
```typescript
const allowedFileTypes = ['pdf', 'txt', 'html', 'htm'];
// 禁止: exe, js, php, asp, jsp 等可执行文件
```

### 链接与图片控制 (allowLinksAndImages)

```javascript
// 默认模式：过滤 a/img 标签（更安全）
new FilePreview({
  allowLinksAndImages: false  // 默认值
});

// 允许模式：显示链接和图片
new FilePreview({
  allowLinksAndImages: true
});
```

**工作原理：**
- `false`（默认）：从允许列表中移除 `a`、`img` 标签及 `href`、`src` 等属性
- `true`：保留这些标签，允许富文本中显示链接和图片

**使用场景：**
- 协议文档包含外部链接 → 设为 `true`
- 协议文档包含图片说明 → 设为 `true`
- 内容来源不可信 → 保持 `false`（默认）

### HTML净化规则

```typescript
// 基础允许标签
ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup', 
               'h1-h6', 'span', 'div', 'blockquote', 'pre', 'code',
               'ol', 'ul', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td']

// 动态标签（根据 allowLinksAndImages 配置）
// allowLinksAndImages: false（默认）→ 过滤 a、img 标签
// allowLinksAndImages: true → 允许 a、img 标签

// 允许的属性
ALLOWED_ATTR: ['style', 'class', 'id', 'colspan', 'rowspan']
// allowLinksAndImages: true 时额外允许: 'href', 'target', 'rel', 'src', 'alt', 'width', 'height'

// 始终禁止的标签
FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 
              'textarea', 'button', 'select', 'option', 'style', 'meta', 
              'link', 'video', 'audio', 'source']

// 始终禁止的属性（事件处理器）
FORBID_ATTR: ['onload', 'onclick', 'onerror', 'onmouseover', 'onsubmit', 
              'onchange', 'onfocus', 'onblur', 'onkeydown', 'onkeyup', 
              'onkeypress', 'onmouseout', 'onmousedown', 'onmouseup', 
              'ondblclick', 'oncontextmenu']
```

## 🚀 最佳安全实践

### 1. 内容来源控制
```javascript
// ✅ 推荐：使用可信源的内容
const filePreview = new FilePreview({
  coerceReadList: {
    fileList: [{
      name: "用户协议",
      file_type: 1,
      content_text: "<p>来自可信源的协议内容</p>"
    }]
  }
});

// ❌ 避免：直接使用用户输入的内容
const userInput = document.getElementById('user-content').value;
// 应该先进行服务器端验证和净化
```

### 2. 文件路径安全
```javascript
// ✅ 推荐：使用相对路径
filePreview.loadFile('documents/terms.pdf');

// ❌ 避免：使用可疑路径
filePreview.loadFile('../../../etc/passwd');
filePreview.loadFile('http://malicious-site.com/malware.exe');
```

### 3. 错误处理
```javascript
// 组件会自动处理安全错误，但你也可以自定义处理
try {
  filePreview.loadFile(userProvidedPath);
} catch (error) {
  // 错误信息已自动脱敏，不会暴露敏感信息
  console.error('文件加载失败:', error.message);
}
```

## ⚠️ 安全警告

### 高风险场景
1. **用户生成内容**：如果允许用户上传或编辑内容，务必在服务器端进行额外验证
2. **第三方内容**：加载外部网站内容时要格外小心
3. **动态文件路径**：避免让用户直接控制文件路径参数

### 中等风险场景
1. **内部文档**：即使是内部文档也要进行基本的安全检查
2. **跨域请求**：注意检查跨域资源共享(CORS)配置

## 🔍 安全测试

### 自动化测试
```bash
# 运行安全测试
npm run test

# 运行安全审计
npm run security-audit
```

### 手动安全检查清单
- [ ] 验证所有用户输入都经过净化
- [ ] 确认文件路径符合安全规范
- [ ] 检查是否使用了最新的安全依赖
- [ ] 验证错误消息不会泄露敏感信息
- [ ] 确认没有绕过安全检查的后门代码

## 🔄 安全更新

### 依赖更新
```bash
# 定期更新依赖包
npm update

# 检查安全漏洞
npm audit
npm audit fix
```

### 组件更新
```bash
# 更新到最新版本
npm install @aggbond/my-file-preview-mobile@latest
```

## 📞 安全问题报告

如果发现任何安全问题，请通过以下方式联系：
- GitHub Issues: [项目仓库](https://github.com/aGG-Bond/ReadFilePopupMobile/issues)
- 邮件: [维护者邮箱]

## 📚 相关资源

- [DOMPurify文档](https://github.com/cure53/DOMPurify)
- [OWASP XSS防护指南](https://owasp.org/www-community/xss-filter-evasion-cheatsheet)
- [内容安全策略(CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---