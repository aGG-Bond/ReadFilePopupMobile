# ReadFilePopupMobile.js

移动端文件预览组件，支持 PDF、富文本、引用文本等多种文件类型。

> **注意：** 本插件仅提供 ES Module 格式（`import` 引入），不支持 UMD/CommonJS。

## 功能特性

- 📄 支持多种文件类型预览（PDF、富文本、引用文本）
- ✅ 强制阅读弹窗功能
- 📋 文件列表自动渲染
- 🔧 灵活的配置选项
- 🎨 自定义样式支持
- 🖼️ Canvas PDF 渲染，适合移动端预览
- 📦 PDF.js 通过动态 `import()` 从 CDN 加载，支持自定义版本和地址

## 安全特性

- HTML 内容自动净化（DOMPurify）
- 文件路径安全验证
- 文件类型白名单
- 错误信息脱敏

## 安装

```bash
npm install @aggbond/my-file-preview-mobile
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
| `control.getFileList()` | 获取文件列表 |
| `control.setButtonTitles(titles)` | 设置按钮标题 |
| `control.setCheckboxChecked(checked)` | 设置复选框状态 |
| `control.isCheckboxChecked()` | 获取复选框状态 |
| `control.getVisitedIndices()` | 获取已访问的索引列表 |
| `control.switchTab(index)` | 切换到指定 Tab（Tab 模式下） |
| `control.getCurrentTabIndex()` | 获取当前 Tab 索引（Tab 模式下） |

### Tab 切换模式

启用后，多文件以顶部 Tab 栏形式切换展示，而非逐个翻页：

```js
const preview = new FilePreview({
  coerceReadList: {
    titleText: "请阅读以下文件",
    fileList: [
      { name: "用户协议", file_type: 1, content_text: "<h2>用户协议</h2><p>协议内容...</p>" },
      { name: "隐私政策", file_type: 1, content_text: "<h2>隐私政策</h2><p>政策内容...</p>" },
      { name: "服务条款", file_type: 1, content_text: "<h2>服务条款</h2><p>条款内容...</p>" }
    ],
    btnArr: ["同意", "拒绝"],
    enableTabMode: true,
    coerceCallBack: (control, buttonIndex) => {
      if (buttonIndex === 0) {
        alert("已同意！");
        control.close();
      } else {
        control.close();
      }
    }
  }
});
preview.openCoerceReadPopup();
```

**Tab 按钮联动模式 (tabButtonLinkMode)：**

| 值 | 描述 |
|------|------|
| `"linked"` | 默认值。按钮和 Tab 都能切换文件 |
| `"noLinked"` | 只有 Tab 能切换文件，按钮仅触发回调 |

### 自定义 Tab 样式 (tabStyle)

```js
tabStyle: {
  indicatorColor: '#FF6B00',      // 底部指示条颜色
  tabMaxWidth: '120px',           // Tab 最大宽度
  tabMinWidth: '80px',            // Tab 最小宽度
  tabTextStyle: { color: '#999' },           // Tab 文字样式
  tabTextActiveStyle: { color: '#FF6B00' },  // 选中 Tab 文字样式
  tabBarStyle: { background: '#fff' },       // Tab 栏容器样式
  tabItemStyle: { padding: '10px' },         // Tab 项样式
  tabItemActiveStyle: { fontWeight: 'bold' } // 选中 Tab 项样式
}
```

### 可编辑文本区 (editableArea)

在 Tab 模式下，支持为每个 Tab 或所有 Tab 显示独立的提示文本：

```js
editableArea: {
  enabled: true,
  mode: 'per-tab',    // 'per-tab' 每个 Tab 独立文本 / 'shared' 所有 Tab 共享文本
  texts: [            // per-tab 模式：每个 Tab 对应的文本
    '请仔细阅读用户协议，如有疑问请联系客服。',
    '我们重视您的隐私保护，详情请查看完整政策。'
  ],
  text: '共享提示文本',  // shared 模式：所有 Tab 显示的文本
  containerStyle: {      // 文本区容器样式
    background: '#f0f9ff',
    borderTop: '2px solid #1890ff'
  },
  textStyle: {           // 文本样式
    color: '#FF6B00',
    fontWeight: 'bold'
  }
}
```

### Tab 切换回调 (onTabChange)

```js
onTabChange: ({ fromIndex, toIndex, control }) => {
  console.log(`从 Tab ${fromIndex} 切换到 Tab ${toIndex}`);
}
```

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

### PDF.js 加载机制

本插件**不打包 PDF.js**，而是在运行时通过动态 `import()` 从 CDN 加载。默认使用 `pdfjs-dist@6.2.108`，你可以通过 `pdfJsPath` 和 `pdfWorkerPath` 指定任意版本。

> **注意：** 本插件仅提供 ES Module 格式，PDF.js 通过动态 `import()` 加载 `.mjs` 文件。

```js
// 默认行为：自动从 CDN 加载 pdfjs-dist@6.2.108
new FilePreview({ useCanvasRender: true });

// 兼容旧版 iOS（如 iOS 18 以下），使用低版本 PDF.js
const isLegacyIOS = /iPhone|iPad/i.test(navigator.userAgent) && !(/OS 18|OS 19|OS 20/i.test(navigator.userAgent));

new FilePreview({
  useCanvasRender: true,
  pdfJsPath: isLegacyIOS
    ? 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.mjs'
    : 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/legacy/build/pdf.mjs',
  pdfWorkerPath: isLegacyIOS
    ? 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.worker.min.mjs'
    : 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/legacy/build/pdf.worker.min.mjs'
});
```

> **提示**：当你指定了 `pdfJsPath` 但未指定 `pdfWorkerPath` 时，插件会自动从 `pdfJsPath` 中提取版本号来拼接对应的 Worker 地址。

### 可用的 PDF.js 地址

```js
// v3 legacy（最低 iOS 10.3+，推荐用于老设备，仅 .js 格式）
const v3PdfJsPath = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.js';
const v3PdfWorkerPath = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js';

// v4 legacy（最低 iOS 16.4+）
const legacyPdfJsPath = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.mjs';
const legacyPdfWorkerPath = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.worker.min.mjs';

// v6 modern（最低 iOS 17+，当前默认推荐）
const modernPdfJsPath = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/legacy/build/pdf.mjs';
const modernPdfWorkerPath = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/legacy/build/pdf.worker.min.mjs';
```

如果你自己托管 PDF.js，也可以从本地路径加载：

```js
const localPdfJsPath = '/node_modules/pdfjs-dist/legacy/build/pdf.mjs';
const localPdfWorkerPath = '/node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs';
```

### PDF.js 版本兼容性

| PDF.js 版本 | 最低 Safari | 最低 iOS | 文件路径 | 说明 |
|------------|------------|---------|---------|------|
| v3.x (3.11.174) legacy | Safari 10+ | iOS 10.3+ | `legacy/build/pdf.js` | 仅 UMD 格式 |
| v4.x (4.10.38) legacy | Safari 16.4+ | iOS 16.4+ | `legacy/build/pdf.mjs` | 仅 ESM 格式 |
| v6.x (6.2.108) | Safari 17+ | iOS 17+ | `legacy/build/pdf.mjs` | 默认版本 |

> **版本差异说明：**
> - **3.x**：仅 `.js`（UMD）格式，必须使用 `legacy/` 路径才能兼容 iOS 10-13
> - **4.x / 6.x**：仅 `.mjs`（ESM）格式，有 `legacy/` 目录
> - 插件会自动根据版本号推导 Worker 文件地址，无需手动处理

> **注意**：插件自身代码已编译为 ES2015（`target: 'es2015'`），兼容 iOS 10.3+。但 PDF.js 库的兼容性取决于你选择的版本。

### build/ 与 legacy/build/ 的区别

PDF.js 提供两个构建版本：

| 特性 | `build/` | `legacy/build/` |
|------|---------|----------------|
| 文件大小 | 较小 | 较大（约 20%） |
| 目标环境 | 现代浏览器 | 旧浏览器 |
| 包含 polyfill | 否 | 是 |
| 语法降级 | 否 | 是（经 Babel 转译） |

**v6.x 的 build/ 和 legacy/build/ 最低支持版本相同**（都是 Safari 17+ / iOS 17+），因为 v6.x 使用了 `Iterator` 等新特性，即使 legacy 版本也无法完全转译。

**建议**：优先使用 `legacy/build/` 路径，它包含更多兼容性代码，在相同最低版本下更稳定。

### 版本选择建议

根据用户实际运行的 iOS 版本选择：

| 用户 iOS 版本 | Safari 版本 | 推荐 PDF.js 版本 | 路径 |
|--------------|------------|-----------------|------|
| iOS 10.3 ~ 13.x | Safari 10 ~ 13 | v3.x legacy | `legacy/build/pdf.js` |
| iOS 14 ~ 16.3 | Safari 14 ~ 16.3 | v3.x legacy | `legacy/build/pdf.js` |
| iOS 16.4 ~ 16.x | Safari 16.4 ~ 16.x | v4.x legacy | `legacy/build/pdf.mjs` |
| iOS 17+ | Safari 17+ | v6.x（默认） | `legacy/build/pdf.mjs` |

**全球 iOS 版本分布（2026年9月，数据来源：StatCounter）：**

| 版本范围 | 市场份额 | 对应机型 |
|---------|---------|---------|
| iOS 17+ | ~70% | iPhone 15/16 系列 |
| iOS 16.x | ~12% | iPhone 8/X ~ iPhone 14 |
| iOS 14-15 | ~10% | iPhone XR/XS ~ iPhone 13 |
| iOS 13 及以下 | ~8% | iPhone 6S ~ iPhone 11 |

**选择策略：**
- **仅需 iOS 17+**：使用默认 v6.x
- **需要兼容 iOS 16.4+**：使用 v4.x legacy
- **需要兼容 iOS 10.3+**：使用 v3.x legacy（推荐，覆盖约 92% 用户）

## 配置选项

### 基础配置

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `useCanvasRender` | boolean/string | `true` | PDF 渲染模式：`true` Canvas / `false` iframe / `"auto"` 自动检测 |
| `isConfignFileKeyName` | boolean | `false` | 是否转换文件键名 |
| `pdfJsPath` | string | `''` (CDN 默认) | PDF.js 主模块加载地址，默认从 CDN 加载 6.2.108 版本 |
| `pdfWorkerPath` | string | `''` (自动推导) | PDF.js Worker 地址，未设置时自动从 `pdfJsPath` 推导版本 |

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
| `btnBoxStyle` | Object | `{}` | 按钮容器样式 |
| `showProgressInButton` | boolean/number | `false` | 在按钮上显示进度（true 或按钮索引） |
| `delayConfig` | Object | `undefined` | 延迟配置 |
| `coerceCallBack` | Array/Function | `[]` | 按钮回调 |
| `enableTabMode` | boolean | `false` | 是否启用 Tab 切换模式 |
| `tabButtonLinkMode` | string | `"linked"` | Tab 按钮联动模式：`"linked"` / `"noLinked"` |
| `tabStyle` | Object | `{}` | Tab 样式配置 |
| `editableArea` | Object | `undefined` | 可编辑文本区配置 |
| `onTabChange` | Function | `undefined` | Tab 切换回调 |

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

- API 文档：[demo/docs.html](https://github.com/aGG-Bond/ReadFilePopupMobile/blob/main/demo/docs.html) - 完整的 API 文档，包含可复制代码和实时预览
- 交互式 Playground：[demo/playground.html](https://github.com/aGG-Bond/ReadFilePopupMobile/blob/main/demo/playground.html) - 在线编辑代码，实时预览效果
- 功能测试：[demo/test.html](https://github.com/aGG-Bond/ReadFilePopupMobile/blob/main/demo/test.html) - 包含 PDF 渲染模式、文件预览、强制阅读、延迟配置、提示信息、PDF 缓存、文件列表等完整功能演示

## 注意事项

- 本插件仅提供 ES Module 格式，需要在支持 `import` 的环境中使用
- Canvas 模式要求 PDF 地址允许跨域或与页面同源
- 页面关闭时自动清理缓存，也可调用 `destroy()` 手动清理
- PDF.js 通过动态 `import()` 从 CDN 加载，需要网络连接；如需离线使用，请自行托管 PDF.js 文件并通过 `pdfJsPath` / `pdfWorkerPath` 指定
- 若不设置 `pdfJsPath`，默认从 jsDelivr CDN 加载 `pdfjs-dist@6.2.108`

## 许可协议

MIT
