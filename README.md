# ReadFilePopupMobile.js 组件文档

## ⚠️ 安全注意事项

**重要安全提醒：**
- 本组件已集成安全防护措施，但仍需谨慎使用
- 富文本内容建议来自可信源，已内置XSS防护
- 文件路径已实施验证，防止路径遍历攻击
- 网络请求已添加基本的CSRF防护检查

**安全特性：**
✅ HTML内容自动净化（DOMPurify）
✅ 文件路径安全验证
✅ 文件类型白名单控制
✅ 错误信息脱敏处理
✅ 基本CSRF防护机制

## 概述

[ReadFilePopupMobile.js](file://d:\Desktop\组件\CoerceReadPopup\src\ReadFilePopupMobile.js) 是一个移动端文件预览组件，支持多种文件类型的展示，包括 PDF、富文本和引用文本。该组件提供了协仪多份文件列表渲染、强制阅读弹窗、文件点击预览等功能。

## 功能特性

- 📄 支持多种文件类型预览（PDF、富文本、引用文本）
- ✅ 强制阅读弹窗功能
- 📋 文件列表自动渲染
- 🔧 灵活的配置选项
- 🎨 自定义样式支持
- 🖼️ Canvas PDF 渲染，适合移动端预览
- 📦 PDF.js 主文件和 Worker 随 npm 包内置

## 使用方法

### ES6 Import 方式
```js
import FilePreview from '@aggbond/my-file-preview-mobile';

const filePreview = new FilePreview({
  isDrawFileList: true,
  listObj: {
    listId: '#readBox',
    fileList: [
      {
        name: "《用户服务协议》",
        file_type: 1,
        content_text: "<h2>用户服务协议</h2><p>欢迎使用我们的服务...</p>"
      }
    ]
  }
});
```

### 浏览器直接引入（UMD 版本 - 推荐）⭐

**最简单的方式：**

```html
<!DOCTYPE html>
<html>
<head>
  <title>UMD 示例</title>
</head>
<body>
  <div id="readBox"></div>
  
  <!-- 1. 引入 UMD 版本 -->
  <script src="https://cdn.jsdelivr.net/npm/@aggbond/my-file-preview-mobile@latest/dist/ReadFilePopupMobile.umd.min.js"></script>
  
  <!-- 2. 直接使用；默认使用 iframe，开启 Canvas 见下方说明 -->
  <script>
    const filePreview = new window.FilePreview({
      // configuration
    });
  </script>
</body>
</html>
```

**优点：**
- ✅ 零配置，开箱即用
- ✅ 所有依赖已打包，无需 Import Map
- ✅ 兼容性好，支持各种环境
- ✅ 适合快速开发和测试

### 浏览器 ES Module 引入

当使用 ES Module 版本时，需要通过 Import Map 声明依赖：

```
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
    {
      "imports": {
        "@aggbond/my-popup": "https://cdn.jsdelivr.net/npm/@aggbond/my-popup@latest/dist/popup.esm.js",
        "dompurify": "https://cdn.jsdelivr.net/npm/dompurify@latest/dist/purify.es.js"
      }
    }
  </script>
</head>
<body>
  <div id="readBox"></div>
  
  <script type="module">
    import FilePreview from 'https://cdn.jsdelivr.net/npm/@aggbond/my-file-preview-mobile@latest/dist/ReadFilePopupMobile.es.js';
    
    const filePreview = new FilePreview({
      // configuration
    });
  </script>
</body>
</html>
```

**为什么需要 Import Map？**
- 构建后的 ES Module 保留了外部依赖的裸模块说明符（如 `@aggbond/my-popup`）
- 浏览器无法直接解析这些说明符，需要通过 Import Map 映射到完整的 CDN URL
- UMD 版本不需要 Import Map，因为所有依赖都已打包在一个文件中

### Canvas PDF 模式

默认情况下 PDF 使用 iframe。移动端或需要避免浏览器直接下载 PDF 时，可以开启 Canvas 渲染：

```js
const filePreview = new FilePreview({
  useCanvasRender: true
});
```

PDF.js 的 `pdf.min.js` 和 `pdf.worker.min.js` 会随 npm 包一起发布到 `dist` 目录，默认不需要用户单独下载，也不依赖 CDN：

```text
dist/
├─ pdf.min.js
└─ pdf.worker.min.js
```

也可以使用自动检测移动设备模式：

```js
const filePreview = new FilePreview({
  useCanvasRender: "auto"
});
```

如果通过 CDN 直接引入插件，建议显式配置 PDF.js 地址。插件主文件、PDF.js 和 Worker 应使用相同的版本：

```html
<script src="https://cdn.jsdelivr.net/npm/@aggbond/my-file-preview-mobile@1.0.4/dist/ReadFilePopupMobile.umd.min.js"></script>
<script>
  const filePreview = new FilePreview({
    useCanvasRender: true,
    pdfJsPath: "https://cdn.jsdelivr.net/npm/@aggbond/my-file-preview-mobile@1.0.4/dist/pdf.min.js",
    pdfWorkerPath: "https://cdn.jsdelivr.net/npm/@aggbond/my-file-preview-mobile@1.0.4/dist/pdf.worker.min.js"
  });
</script>
```

## 配置选项

### 基础选项

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| basePath | string | "/assets/pdfs/" | 文件基础路径 |
| modalId | string | "filePreviewModal" | 模态框ID |
| contentId | string | "filePreviewContent" | 内容容器ID |
| closeBtnId | string | "filePreviewCloseBtn" | 关闭按钮ID |
| isConfignFileKeyName | boolean | false | 是否需要转换文件key |
| isDrawFileList | boolean | false | 是否需要绘制阅读文件列表 |
| isBindFileClick | boolean | false | 是否需要绑定文件点击事件 |

### Canvas 配置

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| useCanvasRender | boolean/string | false | `true` 强制启用，`false` 使用 iframe，`"auto"` 自动检测移动设备 |
| pdfJsPath | string | `"./pdf.min.js"` | PDF.js 主文件地址，可覆盖为本地或 CDN 地址 |
| pdfWorkerPath | string | `"./pdf.worker.min.js"` | PDF.js Worker 地址，可覆盖为本地或 CDN 地址 |
| enableMobileDetect | boolean | true | `useCanvasRender` 为 `"auto"` 时是否启用移动设备检测 |
| mobileKeywords | string[] | 见源码 | 移动设备 User-Agent 关键词 |

Canvas 渲染参数：

```js
canvasRenderOptions: {
  scale: 1.5,
  maxZoom: 3,
  minZoom: 0.5,
  enableZoom: true,
  loadingBarColor: "#29AEEF",
  backgroundColor: "#ffffff"
}
```


### 文件类型配置

```js
fileTypes: {
  pdf: "application/pdf",
  txt: "text/plain",
  html: "text/html",
  1: "richTextFile",   // 富文本
  2: "choosePdfFile",  // PDF文件
  3: "quotePdfFile"    // 引用文本
}
```

### 文件键名映射配置

 ```js
 // 动态更改相关key值
fileKeyNameConfign: {
  fileTitle: "name",         // 标题字段
  fileType: "doc_type",      // 文件类型字段
  filePdfUrl: "pdf_url",     // PDF地址字段
  fileRichContent: "content_text", // 富文本内容字段
  fileArr: "com_terms"       // 文件数组字段
}
 ```

 ### 文件列表配置(listObj)
 ```js
 listObj: {
  listId: "",               // 列表容器ID
  fileList: [],             // 文件列表数据
  fileStyle: {},            // 文件样式
  isCheckButton: false,     // 是否显示复选框
  isCoerceReadPopup: true,  // 是否强制阅读弹窗
  checkCallBack: ()=>{},    // 复选框状态变更回调
  listText: "更多详情请阅读"
}
 ```
 
| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| listId | string | "" | 列表容器ID |
| fileList | Array | [] | 文件列表 |
| fileStyle | Object | {color: "red", "font-weight": "bold"} | 文件样式 |
| isCheckButton | boolean | false | 是否需要复选框 |
| isCoerceReadPopup | boolean | true | 是否强制阅读弹窗 |
| checkCallBack | Function | (isChecked) => {} | 复选框回调函数 |
| listText | string | "更多详情请阅读" | 列表文本 |
| checkButtonID | string | "ReadFileCheckBox" | 复选框ID |

 ### 强制阅读配置(coerceReadList)
 ```js
 coerceReadList: {
  titleText: "请阅读并同意以下文件",
  fileList: [],             // 强制阅读文件列表
  btnArr: ["确认已阅读并同意", "拒绝"],
  btnStyle: [{}, {}],       // 按钮样式
  coerceCallBack: [fn1, fn2] // 按钮点击回调
}
 ```

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| titleText | string | "请阅读并同意以下文件" | 弹窗标题 |
| fileList | Array | [] | 文件列表 |
| fileStyle | Object | {color: "red", "font-weight": "bold"} | 文件样式 |
| btnArr | Array | ["确认已阅读并同意", "拒绝"] | 按钮数组 |
| btnStyle | Array | [{ color: "red" }, { color: "gray" }] | 按钮样式 |
| btnBoxStyle | Object | {} | 按钮容器样式 |
| showProgressInButton | boolean/number | false | 是否在按钮上显示进度 |
| coerceCallBack | Array/Function | [callback1, callback2] | 按钮回调函数,return false 则不关闭弹窗 |

按钮进度显示
- showProgressInButton: true - 在btnArr[0]上显示进度
- showProgressInButton: 0 - 在btnArr[0]上显示进度
- showProgressInButton: 1 - 在btnArr[1]上显示进度
- showProgressInButton: n - 在btnArr[n]上显示进度
- showProgressInButton: false - 不显示进度

## 使用实例

### 基本文件列表
```html 
<div id="readBox"></div>
```
```js
const filePreview = new FilePreview({
  isDrawFileList: true,
  listObj: {
    listId: '#readBox',
    fileList: [
      {
        name: "《用户服务协议》",
        file_type: 1,
        content_text: "<h2>用户服务协议</h2><p>欢迎使用我们的服务...</p>"
      }
    ],
    isCheckButton: true,
    checkCallBack: (isChecked) => {
      console.log('复选框状态改变：', isChecked);
    }
  }
});
```

### 强制阅读弹窗

```js
const filePreview = new FilePreview({
  coerceReadList: {
    fileList: [
      {
        name: "《测试文档》",
        file_type: 1,
        content_text: "<p>这是第一个测试文档的内容...</p>"
      }
    ],
    btnArr: ['同意并继续', '拒绝'],
    showProgressInButton: true,  // 显示进度
    coerceCallBack: (control, buttonIndex) => {
      switch (buttonIndex) {
        case 0: // 同意
          if (control.isLastFile()) {
            control.setCheckboxChecked(true);
            alert('已完成所有文件阅读！');
          } else {
            control.next(); // 下一个文件
            // return false 则不会关闭弹窗
            // return true 返回非false则会关闭弹窗。默认关闭弹窗
          }
          break;
        case 1: // 拒绝
          // control.close(); // 关闭弹窗 
          // return false 则不会关闭弹窗
          // return true 返回非false则会关闭弹窗。默认关闭弹窗
          break;
      }
    }
  }
});
```
#### 控制对象方法
在回调函数中可以使用 control 对象的方法：
方法	描述
control.next()	下一个文件
control.prev()	上一个文件
control.close()	关闭弹窗
control.getCurrentIndex()	获取当前索引
control.getFileList()	获取文件列表
control.isLastFile()	是否为最后一个文件
control.setButtonTitles(titles)	设置按钮标题
control.getVisitedIndices()	获取已访问的索引
control.goTo(index)	跳转到指定索引
control.setCheckboxChecked(checked)	设置复选框状态
control.isCheckboxChecked()	获取复选框状态

### 文件预览

```js
// 预览单个文件
filePreview.loadFile('/path/to/file.pdf');
filePreview.loadFile('/path/to/file.txt');
```

### 文件类型支持

- 富文本 (file_type: 1): 直接在弹窗中显示 HTML 内容
- PDF (file_type: 2): 默认使用 iframe，也可以使用 Canvas 渲染
- 引用文本 (file_type: 3): 包含多个子文件的复合文档

## 核心方法
drawReadFileList(listObj)
渲染阅读文件列表

openCoerceReadPopup()
打开强制阅读弹窗

bindFileClick(containerSelector, fileArr)
绑定文件点击事件

judgeFileType(options)
判断文件类型并返回相应处理结果

## 文件类型说明

- 富文本文件 (type 1)

- 直接显示 HTML 内容
- 适用于条款、协议等文本内容
- PDF文件 (type 2)

- 默认使用 iframe/embed/object 显示 PDF
- 开启 `useCanvasRender` 后使用 PDF.js Canvas 渲染
- 支持工具栏控制
- 引用文本文件 (type 3)

## 注意事项
- npm/UMD 构建已包含 `@aggbond/my-popup`
- Canvas 模式使用随包发布的 PDF.js 文件，不需要用户额外下载
- 直接通过 CDN 引入插件时，建议显式配置 `pdfJsPath` 和 `pdfWorkerPath`
- PDF.js Canvas 模式仍要求 PDF 地址允许跨域访问，或与当前页面同源
- 对于跨域 PDF 文件，可能需要服务器端配合解决 CORS 问题
- 文件路径需要正确配置
- 对于 HTML 文件预览需要注意 XSS 安全问题
- 按钮进度显示功能支持在任意按钮上显示进度信息

## 贡献指南
欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可协议
MIT



