# ReadFilePopupMobile.js

移动端文件预览组件，支持 PDF、富文本、引用文本等多种文件类型。
## 功能特性

- 📄 支持多种文件类型预览（PDF、富文本、引用文本）
- ✅ 强制阅读弹窗功能
- 📋 文件列表自动渲染
- 🔧 灵活的配置选项
- 🎨 自定义样式支持
- 🖼️ Canvas PDF 渲染，适合移动端预览
- 📦 PDF.js 主文件和 Worker 随 npm 包内置

## 安全特性

- HTML 内容自动净化（DOMPurify）
- 文件路径安全验证
- 文件类型白名单
- 错误信息脱敏

## 安装

```bash
npm install @aggbond/my-file-preview-mobile
```

或通过 CDN：
```html
<script src="https://cdn.jsdelivr.net/npm/@aggbond/my-file-preview-mobile@latest/dist/ReadFilePopupMobile.umd.min.js"></script>
```

## 快速开始

### 文件预览

```js
import FilePreview from '@aggbond/my-file-preview-mobile';

const preview = new FilePreview({});

// 通过 URL 加载
preview.loadFile('/path/to/file.pdf');
preview.loadFile('/path/to/file.txt', '自定义标题');

// 不指定 file_type，自动判断
preview.loadFile({ pdf_url: 'https://example.com/doc.pdf' });

// 通过文件对象加载
preview.loadFile({
  name: '用户协议',
  file_type: 1,
  content_text: '<h2>用户协议</h2><p>协议内容...</p>'
});

preview.loadFile({
  name: '隐私政策',
  file_type: 2,
  pdf_url: 'https://example.com/privacy.pdf'
});

// 引用文本（多份文件）
preview.loadFile({
  name: '服务条款',
  file_type: 3,
  com_terms: [
    { name: '条款一', pdf_url: 'https://example.com/term1.pdf' },
    { name: '条款二', content_text: '<p>条款二内容</p>' }
  ]
});


```

### 强制阅读弹窗

```js
const preview = new FilePreview({
  coerceReadList: {
    fileList: [
      { name: '用户协议', file_type: 1, content_text: '<p>协议内容...</p>' }
    ],
    btnArr: ['同意', '拒绝'],
    tipsText: '请仔细阅读以下内容，阅读完毕后点击按钮继续', // 显示在弹窗顶部，不配置不显示
    showProgressInButton: true,
    delayConfig: {
      seconds: 5,
      buttonIndex: 0,
      text: '请等待 {seconds} 秒'
    },
    coerceCallBack: (control, buttonIndex) => {
      if (buttonIndex === 0) {
        if (control.isLastFile()) {
          alert('已完成阅读');
        } else {
          control.next();
        }
      }
    }
  }
});
```

**tipsText 说明：**
- 显示在弹窗顶部，用于提示用户操作
- 自动 HTML 转义，防止 XSS
- 样式：红色背景 (#FFE7E5)，红色文字 (#FF3B30)
- 不配置则不显示

**控制对象方法：**

| 方法 | 描述 |
|------|------|
| `control.next()` | 下一个文件 |
| `control.prev()` | 上一个文件 |
| `control.close()` | 关闭弹窗 |
| `control.goTo(index)` | 跳转到指定索引 |
| `control.isLastFile()` | 是否为最后一个文件 |
| `control.getCurrentIndex()` | 获取当前索引 |
| `control.setButtonTitles(titles)` | 设置按钮标题 |
| `control.setCheckboxChecked(checked)` | 设置复选框状态 |

### 文件列表

```js
const preview = new FilePreview({
  isDrawFileList: true,
  listObj: {
    listId: '#readBox',
    fileList: [
      { name: '用户协议', file_type: 1, content_text: '<p>内容...</p>' }
    ],
    isCheckButton: true,
    checkCallBack: (isChecked) => {
      console.log('复选框状态：', isChecked);
    }
  }
});
```

## PDF 渲染模式

```js
// Canvas 渲染（默认，适合移动端）
new FilePreview({ useCanvasRender: true });

// iframe 渲染
new FilePreview({ useCanvasRender: false });

// 自动检测（移动端用 Canvas，桌面端用 iframe）
new FilePreview({ useCanvasRender: 'auto' });
```

CDN 使用时需配置 PDF.js 路径：
```js
new FilePreview({
  useCanvasRender: true,
  pdfJsPath: 'https://cdn.jsdelivr.net/npm/@aggbond/my-file-preview-mobile@1.0.4/dist/pdf.min.mjs',
  pdfWorkerPath: 'https://cdn.jsdelivr.net/npm/@aggbond/my-file-preview-mobile@1.0.4/dist/pdf.worker.min.mjs'
});
```

## 配置选项

### 基础配置

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `useCanvasRender` | boolean/string | `true` | PDF 渲染模式：`true` Canvas / `false` iframe / `"auto"` 自动检测 |
| `isConfignFileKeyName` | boolean | `false` | 是否转换文件键名 |

### 安全配置

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `allowLinksAndImages` | boolean | `false` | 是否允许富文本中的 `<a>` 和 `<img>` 标签 |

**allowLinksAndImages 说明：**

- 默认 `false`：出于安全考虑，自动过滤 `<a>` 和 `<img>` 标签及相关属性（href、src等）
- 设为 `true`：允许链接和图片显示，适用于需要展示外部链接或图片的场景

```js
// 默认模式：过滤 a/img 标签
new FilePreview({});

// 允许链接和图片
new FilePreview({ allowLinksAndImages: true });
```

> ⚠️ **安全提示**：开启此选项时，请确保富文本内容来源可信，避免 XSS 风险

### 文件列表配置 (listObj)

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `listId` | string | `""` | 列表容器 ID |
| `fileList` | Array | `[]` | 文件列表 |
| `fileStyle` | Object | `{}` | 文件样式 |
| `isCheckButton` | boolean | `false` | 是否显示复选框 |
| `isCoerceReadPopup` | boolean | `true` | 勾选后是否弹出强制阅读 |
| `checkCallBack` | Function | `() => {}` | 复选框回调 |
| `listText` | string | `"更多详情请阅读"` | 列表文本 |
| `checkButtonID` | string | `"ReadFileCheckBox"` | 复选框 ID |

### 强制阅读配置 (coerceReadList)

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `titleText` | string | `"请阅读并同意以下文件"` | 弹窗标题 |
| `tipsText` | string | `""` | 顶部提示信息 |
| `fileList` | Array | `[]` | 文件列表 |
| `btnArr` | Array | `["同意并继续"]` | 按钮文字 |
| `btnStyle` | Array | `[]` | 按钮样式 |
| `showProgressInButton` | boolean/number | `false` | 在按钮上显示进度（true 或按钮索引） |
| `delayConfig` | Object | `undefined` | 延迟配置 |
| `coerceCallBack` | Array/Function | `[]` | 按钮回调 |

**延迟配置 (delayConfig)：**
```js
delayConfig: {
  seconds: 5,           // 延迟秒数
  buttonIndex: 0,       // 延迟按钮索引
  text: '请等待 {seconds} 秒'  // 延迟文字
}
```

### 文件键名映射 (fileKeyNameConfign)

```js
fileKeyNameConfign: {
  fileTitle: "name",           // 标题字段
  fileType: "doc_type",        // 类型字段
  filePdfUrl: "pdf_url",       // PDF 地址字段
  fileRichContent: "content_text",  // 富文本字段
  fileArr: "com_terms"         // 文件数组字段
}
```

## 文件类型

| 类型 | file_type | 说明 |
|------|-----------|------|
| 富文本 | `1` | 直接显示 HTML 内容 |
| PDF | `2` | 使用 Canvas 或 iframe 渲染 |
| 引用文本 | `3` | 包含多个子文件的复合文档 |

## 方法

| 方法 | 描述 |
|------|------|
| `loadFile(fileOrPath, title?)` | 加载文件 |
| `clearPdfCache()` | 清除 PDF 缓存 |
| `destroy()` | 销毁实例，清理资源 |



## 示例

更多使用示例请参考 [demo/test.html](https://github.com/aGG-Bond/ReadFilePopupMobile/blame/main/demo/test.html)，包含 PDF 渲染模式、文件预览、强制阅读、延迟配置、提示信息、PDF 缓存、文件列表等完整功能演示。

## 注意事项

- Canvas 模式要求 PDF 地址允许跨域或与页面同源
- 页面关闭时自动清理缓存，也可调用 `destroy()` 手动清理
- UMD 版本已打包所有依赖，开箱即用

## 许可协议

MIT
