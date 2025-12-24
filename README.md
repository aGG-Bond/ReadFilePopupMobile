# ReadFilePopupMobile.js 组件文档

## 概述

[ReadFilePopupMobile.js](file://d:\Desktop\组件\CoerceReadPopup\src\ReadFilePopupMobile.js) 是一个移动端文件预览组件，支持多种文件类型的展示，包括 PDF、富文本和引用文本。该组件提供了文件列表渲染、强制阅读弹窗、文件点击预览等功能。

## 功能特性

- 📄 支持多种文件类型预览（PDF、富文本、引用文本）
- ✅ 强制阅读弹窗功能
- 📋 文件列表自动渲染
- 🔧 灵活的配置选项
- 🎨 自定义样式支持

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

### 浏览器直接引入
```js
<script src="https://unpkg.com/@yourname/file-preview-plugin@latest/dist/ReadFilePopupMobile.js"></script>
<script>
  const filePreview = new window.FilePreview({
    // configuration
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
- PDF (file_type: 2): 使用 iframe 预览 PDF 文件
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

- 使用 iframe/embed/object 显示 PDF
- 支持工具栏控制
- 引用文本文件 (type 3)

## 注意事项
- 使用前需确保引入 @aggbond/my-popup 组件库
- PDF 文件预览依赖浏览器的 PDF 查看能力
- 对于跨域 PDF 文件，可能需要服务器端配合解决 CORS 问题
- 文件路径需要正确配置
- 对于 HTML 文件预览需要注意 XSS 安全问题
- 按钮进度显示功能支持在任意按钮上显示进度信息

## 贡献指南
欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可协议
MIT



