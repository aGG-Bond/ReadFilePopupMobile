/*!
 * ReadFilePopupMobile Component v1.0.4
 * GitHub: https://github.com/aGG-Bond/ReadFilePopupMobile#readme
 * (c) 2025 aGG-Bond
 * @license MIT
 * 
 * 更新说明 v1.0.4:
 * - 新增 Canvas 渲染模式 (基于 PDF.js),彻底解决移动端下载问题
 * - 自动检测移动设备并切换至 Canvas 模式
 * - 保持向后兼容，支持原有 iframe/object/embed 模式
 */
import Popup from "@aggbond/my-popup";
const myPopup = new Popup();
console.log('ReadFilePopupMobile v1.0.4')
class FilePreview {
  Configns;
  pdfjsLib = null; // PDF.js 库实例
  
  constructor(options) {
    this.Configns = Object.assign(
      {
        basePath: "/assets/pdfs/",
        // 文件基础路径
        modalId: "filePreviewModal",
        // 模态框 ID
        contentId: "filePreviewContent",
        // 内容容器 ID
        closeBtnId: "filePreviewCloseBtn",
        // 关闭按钮 ID
        fileTypes: {
          // 支持的文件类型
          pdf: "application/pdf",
          txt: "text/plain",
          html: "text/html",
          "1": "richTextFile",
          // 富文本
          "2": "choosePdfFile",
          // pdf
          "3": "quotePdfFile"
          // 引用文本
          // 可以扩展更多类型
        },
        fileKeyNameConfign: {
          // 配置文件键值 key 免于不同格式的数据转换 isConfignFileKeyName 为 true，则 fielKeyNameConfign 为 required;
          fileTitle: "name",
          //标题
          fileType: "doc_type",
          // 文件类型 1 富文本 2 pdf 3 引用文本，引用文本通常有多份
          filePdfUrl: "pdf_url",
          //  pdf 地址 绝对路径
          fileRichContent: "content_text",
          // 富文本内容
          fileArr: "com_terms"
          // 可以扩展更多类型
        },
        isConfignFileKeyName: false,
        // 是否需要转换文件 key 默认为 false
        isDrawFileList: false,
        // 是否需要绘制阅读文件列表 
        listObj: {
          listId: "",
          // 列表容器 ID require
          fileList: [
            // 文件列表 require
            {
              name: "默认标题",
              //标题
              file_type: 3,
              // 文件类型 1 富文本 2 pdf 3 引用文本，引用文本通常有多份
              pdf_url: "",
              // pdf 地址 绝对路径
              content_text: "",
              // 富文本内容
              com_terms: [
                // 多份文件
                {
                  name: "默认标题",
                  //标题
                  pdf_url: "clause_pdf: https://showFile.com/address.pdf",
                  // pdf 地址
                  content_text: "disclaimer<p><strong>默认文件</strong></p>"
                  // 富文本内容
                }
              ],
              styleStr: {
                color: "red",
                "font-weight": "bold"
              }
            }
          ],
          fileStyle: {
            color: "red",
            "font-weight": "bold"
          },
          // 文件样式 span
          isCheckButton: false,
          // 列表是否需要复选框
          isCoerceReadPopup: true,
          // 是否强制阅读弹窗
          checkCallBack: (isChecked) => {
            console.log("复选框状态改变：", isChecked);
          },
          // 复选框回调函数
          listText: "更多详情请阅读",
          checkButtonID: "ReadFileCheckBox"
        },
        // 强制阅读弹窗参数
        coerceReadList: {
          titleText: "请阅读并同意以下文件",
          fileList: [
            // 文件列表 require
            {
              name: "默认标题",
              //标题
              file_type: 3,
              // 文件类型 1 富文本 2 pdf 3 引用文本，引用文本通常有多份
              pdf_url: "",
              // pdf 地址 绝对路径
              content_text: "",
              // 富文本内容
              com_terms: [
                // 多份文件
                {
                  name: "默认标题",
                  //标题
                  pdf_url: "clause_pdf: https://showFile.com/address.pdf",
                  // pdf 地址
                  content_text: "disclaimer<p><strong>默认文件</strong></p>"
                  // 富文本内容
                }
              ],
              styleStr: {
                color: "red",
                "font-weight": "bold"
              }
            }
          ],
          fileStyle: {
            color: "red",
            "font-weight": "bold"
          },
          btnArr: ["确认已阅读并同意", "拒绝"],
          btnStyle: [{ color: "red" }, { color: "gray" }],
          btnBoxStyle: {},
          showProgressInButton: false,
          coerceCallBack: [
            (control, buttonIndex) => {
              console.log("btn[0] 强制阅读弹窗结果：", control, buttonIndex);
            },
            (control, buttonIndex) => {
              console.log("btn[1] 强制阅读弹窗结果：", control, buttonIndex);
            }
          ]
        },
        isBindFileClick: false,
        // 是否需要绑定文件点击事件
        
        // ===== v1.0.4 新增配置 =====
        useCanvasRender: false,
        // 是否使用 Canvas 渲染 (PDF.js),彻底解决移动端下载问题
        // 可选值：true(始终使用) | false(不使用) | 'auto'(自动检测移动设备)
        pdfJsPath: "./pdf.min.mjs",
        // PDF.js 库的路径 (如果使用 Canvas 渲染)
        pdfWorkerPath: "./pdf.worker.min.mjs",
        // PDF.js Worker 路径 
        enableMobileDetect: true,
        // 是否启用移动设备自动检测 (当 useCanvasRender='auto' 时生效)
        mobileKeywords: ['MicroMessenger', 'Mobile', 'Android', 'iPhone', 'iPad'],
        // 移动设备关键词列表
        canvasRenderOptions: {
          // Canvas 渲染配置
          scale: 1.5,
          // 默认缩放比例
          maxZoom: 3,
          // 最大缩放
          minZoom: 0.5,
          // 最小缩放
          enableZoom: true,
          // 是否允许缩放
          loadingBarColor: '#29AEEF',
          // 加载条颜色
          backgroundColor: '#ffffff'
          // 背景颜色
        }
      },
      options
    );
    
    // 初始化时检查是否为移动设备
    if (this.Configns.useCanvasRender === 'auto' && this.Configns.enableMobileDetect) {
      this.Configns._isMobileDevice = this._detectMobileDevice();
      console.log('ReadFilePopupMobile: 检测到移动设备，自动启用 Canvas 渲染');
    } else {
      this.Configns._isMobileDevice = this.Configns.useCanvasRender === true;
    }
    // 初始化模态框
    this.initModal();
  }
  
  // ===== v1.0.4 新增方法 =====
  
  /**
   * 检测是否为移动设备
   * @returns {boolean}
   */
  _detectMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return this.Configns.mobileKeywords.some(keyword => 
      new RegExp(keyword, 'i').test(userAgent)
    );
  }
  
  /**
   * 动态加载 PDF.js 库
   * @returns {Promise}
   */
  async _loadPdfJs() {
    if (this.pdfjsLib) {
      return this.pdfjsLib; // 已加载
    }

    try {
      const pdfModule = await import(/* @vite-ignore */ this.Configns.pdfJsPath);
      this.pdfjsLib = pdfModule;
      if (this.pdfjsLib.GlobalWorkerOptions) {
        this.pdfjsLib.GlobalWorkerOptions.workerSrc = this.Configns.pdfWorkerPath;
      }
      console.log('PDF.js Worker 已配置:', this.Configns.pdfWorkerPath);
      return this.pdfjsLib;
    } catch (error) {
      throw new Error(`无法加载 PDF.js 从 ${this.Configns.pdfJsPath}: ${error.message}`);
    }
  }
  
  /**
   * 使用 Canvas 渲染 PDF (基于 PDF.js)
   * @param {Object} params - 参数
   * @returns {Promise<string>} HTML 字符串
   */
  async _renderPdfWithCanvas(params) {
    const { file: filebox, fromChooseList = false, isCoerce = false } = params;
    const { pdf_url: url, name: title } = filebox;
    const popupInstance = fromChooseList ? new Popup() : myPopup;
    
    try {
      // 加载 PDF.js
      await this._loadPdfJs();
      
      // 创建容器
      const containerId = `pdf-canvas-${Date.now()}`;
      const loadingBarId = `loading-bar-${Date.now()}`;
      
      const html = `
        <div id="${containerId}" style="width: 100%; height: 600px; position: relative; background: ${this.Configns.canvasRenderOptions.backgroundColor};">
          <div id="${loadingBarId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: #f0f0f0; z-index: 999;">
            <div class="progress" style="height: 100%; width: 0%; background: ${this.Configns.canvasRenderOptions.loadingBarColor}; transition: width 0.3s;"></div>
          </div>
          <div class="pdf-canvas-container" style="width: 100%; height: 100%; overflow: auto; -webkit-overflow-scrolling: touch; padding: 10px;">
          </div>
        </div>
      `;
      
      if (isCoerce) {
        // 强制阅读模式需要特殊处理，返回带标记的 HTML
        return `<div data-pdf-render-type="canvas" data-pdf-url="${url}">${html}</div>`; 
      }
      
      // 显示弹窗
      popupInstance.showBottomPopup({
        title,
        content: html,
        titleStyle: {
        width: '90%',
        fontSize: '4.266vw',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontWeight: "bold",
        height: '13.33vw',
        minHeight: '13.33vw',
        lineHeight: '13.33vw',
      },
      contentStyle: {
        // maxHeight: '100vh',
        // overflow: 'hidden',
        overflowY: 'auto',
        flex: '1',
        padding: "0",
      },
      contentBoxStyle: {
        maxHeight: "100vh",
        overflow: 'hidden'
      },
        callbacks: [() => {
          console.log("Canvas PDF 弹窗关闭");
        }]
      });
      
      // 获取容器并渲染
      setTimeout(() => {
        this._initPdfCanvas(url, containerId, loadingBarId);
      }, 100);
      
      return;
      
    } catch (error) {
      console.error("Canvas 渲染失败，回退到 iframe 模式:", error);
      // Fallback: 回退到传统 iframe 模式
      return this._renderPdfWithIframe(params);
    }
  }
  
  /**
   * 初始化 PDF Canvas 渲染
   * @param {string} url - PDF URL
   * @param {string} containerId - 容器 ID
   * @param {string} loadingBarId - 加载条 ID
   */
  async _initPdfCanvas(url, containerId, loadingBarId) {
    try {
      const pdfjsLib = this.pdfjsLib || window.pdfjsLib;
      if (!pdfjsLib) {
        throw new Error("PDF.js 未加载");
      }
      
      // 加载 PDF 文档
      const loadingTask = pdfjsLib.getDocument(url);
      
      // 监听加载进度
      loadingTask.onProgress = (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        const progressBar = document.querySelector(`#${loadingBarId} .progress`);
        if (progressBar) {
          progressBar.style.width = `${percent}%`;
        }
      };
      
      const pdf = await loadingTask.promise;
      
      // 隐藏加载条
      const loadingBar = document.getElementById(loadingBarId);
      if (loadingBar) {
        loadingBar.style.display = 'none';
      }
      
      // 获取容器
      const container = document.querySelector(`#${containerId} .pdf-canvas-container`);
      if (!container) {
        throw new Error("Canvas 容器未找到");
      }
      
      // 渲染所有页面
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        await this._renderPdfPage(pdf, pageNum, container);
      }
      
    } catch (error) {
      console.error("PDF Canvas 渲染错误:", error);
      // 显示错误信息
      const container = document.querySelector(`#${containerId} .pdf-canvas-container`);
      if (container) {
        container.innerHTML = `
          <div style="text-align: center; padding: 50px; color: #999;">
            <p>PDF 加载失败</p>
            <p style="font-size: 12px;">${error.message}</p>
          </div>
        `;
      }
    }
  }
  
  /**
   * 渲染单个 PDF 页面
   * @param {PDFDocumentProxy} pdf - PDF 文档对象
   * @param {number} pageNum - 页码
   * @param {HTMLElement} container - 容器元素
   */
  async _renderPdfPage(pdf, pageNum, container) {
    const page = await pdf.getPage(pageNum);
    const scale = this.Configns.canvasRenderOptions.scale;
    const viewport = page.getViewport({ scale });
    
    // 创建页面容器
    const pageDiv = document.createElement('div');
    pageDiv.className = 'pdf-page-container';
    pageDiv.style.cssText = `
      margin: 0 auto 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      background: white;
      max-width: 100%;
      overflow: hidden;
    `;
    
    // 创建 Canvas
    const canvas = document.createElement('canvas');
    canvas.id = `page-${pageNum}`;
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // 响应式适配
    const maxWidth = container.clientWidth - 20;
    if (viewport.width > maxWidth) {
      const responsiveScale = maxWidth / viewport.width;
      canvas.style.width = `${maxWidth}px`;
      canvas.style.height = `${viewport.height * responsiveScale}px`;
    }
    
    pageDiv.appendChild(canvas);
    container.appendChild(pageDiv);
    
    // 渲染到 Canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
  }
  
  /**
   * 使用 iframe 渲染 PDF (传统方式)
   * @param {Object} params - 参数
   * @returns {string} HTML 字符串
   */
  _renderPdfWithIframe(params) {
    const { file: filebox, fromChooseList = false, isControl = false, isCoerce = false } = params;
    const { pdf_url: url, name: title, divType = "iframe" } = filebox;
    const popupInstance = fromChooseList ? new Popup() : myPopup;
    const modifiedUrl = isControl ? url : `${url}#toolbar=0&navpanes=0&scrollbar=0`;
    const iframeHtml = `<iframe src="${modifiedUrl}" width="100%" height="800" style="border:none;"></iframe>`;
    const objectHtml = `<object data="${modifiedUrl}" type="application/pdf" width="100%" height="800">
    <p>您的浏览器不支持 PDF 查看。请<a href="${modifiedUrl}">下载文件</a>。</p></object>`;
    const embedHtml = `<embed src="${modifiedUrl}" type="application/pdf" width="100%" height="800" />`;
    const html = divType === "iframe" ? iframeHtml : divType === "object" ? objectHtml : embedHtml;
    if (isCoerce) return html;
    popupInstance.showBottomPopup({
      title,
      content: html,
      titleStyle: {
        width: '90%',
        fontSize: '4.266vw',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontWeight: "bold",
        height: '13.33vw',
        minHeight: '13.33vw',
        lineHeight: '13.33vw',
      },
      contentStyle: {
        // maxHeight: '100vh',
        // overflow: 'hidden',
        overflowY: 'auto',
        flex: '1',
        padding: "0",
      },
      contentBoxStyle: {
        maxHeight: "100vh",
        overflow: 'hidden'
      },
      callbacks: [function() {
        console.log("quotePdfFile callback");
      }]
    });
    return;
  }
  // 初始化
  initModal() {
    const {
      isDrawFileList,
      listObj,
      isBindFileClick,
      isConfignFileKeyName,
      coerceReadList
    } = this.Configns;
    if (isConfignFileKeyName && listObj.fileList && listObj.fileList.length > 0) {
      this.Configns.listObj.fileList = this.dataChange(listObj.fileList);
    }
    if (coerceReadList.fileList && coerceReadList.fileList.length > 0) {
      this.Configns.coerceReadList.fileList = this.dataChange(
        coerceReadList.fileList
      );
    }
    isDrawFileList && this.drawReadFileList(listObj);
    isBindFileClick && this.bindFileClick(listObj.listId, void 0);
  }
  // 数据转换
  dataChange(data) {
    if (!this.Configns.fileKeyNameConfign)
      throw new Error("请传入文件keyNameConfign");
    const { fileTitle, filePdfUrl, fileRichContent, fileArr, fileType } = this.Configns.fileKeyNameConfign;
    if (!fileTitle || !filePdfUrl || !fileRichContent || !fileArr)
      throw new Error("请传入文件keyNameConfign的参数");
    data.forEach((item) => {
      item.name = item[fileTitle];
      item.file_type = item[fileType];
      item.pdf_url = item[filePdfUrl];
      item.content_text = item[fileRichContent];
      item.com_terms = item[fileArr];
    });
    return data;
  }
  //渲染阅读文件列表
  async drawReadFileList(listObj) {
    const {
      listId: ID,
      fileList,
      isCheckButton,
      isCoerceReadPopup,
      checkCallBack,
      listText,
      checkButtonID,
      fileStyle
    } = listObj;
    if (!ID) throw new Error("请传入需要添加的dom ID");
    if (fileList.length < 1) throw new Error("请传入需要渲染的文件数据");
    let html = `${isCheckButton ? `<input type="checkbox" id="${checkButtonID}" />` : ""}${listText}`;
    for (let i = 0, len = fileList.length; i < len; i++) {
      const { name, pdf_url, file_type, styleStr } = fileList[i];
      const type = file_type || await this.judgeFileType({ type: "", file: fileList[i], index: i });
      html += `<span class="pdfsee item-contract" data-pdf="${file_type == 2 ? pdf_url : ""}" data-title="${name}" data-index="${i}" data-type="${type}" style="${this.objToStr(
        styleStr ? styleStr : fileStyle || {}
      )}">${name}</span>`;
    }
    const element = document.querySelector(ID);
    if (!element) throw new Error("未找到元素" + ID);
    element.insertAdjacentHTML("beforeend", html);
    if (checkButtonID) {
      const inputBox = document.getElementById(checkButtonID);
      if (inputBox) {
        inputBox.addEventListener("click", (e) => {
          const target = e.target;
          const isChecked = target.checked;
          checkCallBack && checkCallBack(isChecked);
          if(isCheckButton){
            if(isChecked) return this.openCoerceReadPopup();
          }else {
            isCoerceReadPopup && this.openCoerceReadPopup();
          }
        });
      }
    }
  }
  // 对象转换为字符串
  objToStr(obj) {
    return Object.entries(obj).reduce(
      (str, [key, value]) => `${str}${key}:${value};`,
      ""
    );
  }
  // 判断文件格式 - v1.0.4 升级为异步方法支持 Canvas 渲染
  async judgeFileType(params) {
    const { type, file, index, fromChooseList = false, isCoerce = false } = params;
    if (!file) throw new Error("未找到对应文件信息 file is not defined");
    let html;
    switch (type) {
      case "1":
      case 1:
        html = this.richTextFile({ file, fromChooseList, isCoerce });
        break;
      case "2":
      case 2:
        // quotePdfFile 现在是异步方法
        html = await this.quotePdfFile({ file, fromChooseList, isCoerce });
        break;
      case "3":
      case 3:
        html = this.choosePdfFile({ file, index, fromChooseList, isCoerce });
        break;
      default:
        const { com_terms, content_text, pdf_url } = file;
        if (com_terms && com_terms.length > 0) {
          return 3;
        } else if (content_text) {
          return 1;
        } else if (pdf_url) {
          return 2;
        }
        break;
    }
    if (isCoerce) return html;
  }
  // 富文本文件
  richTextFile(params) {
    const { file: filebox, fromChooseList = false, isCoerce = false } = params;
    const { name: title, content_text: text } = filebox;
    const popupInstance = fromChooseList ? new Popup() : myPopup;
    if (isCoerce) return text;
    popupInstance.showBottomPopup({
      title,
      content: text,
      contentStyle: {},
      titleStyle: {
        width: '90%',
        fontSize: '4.266vw',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontWeight: "bold",
        height: '13.33vw',
        minHeight: '13.33vw',
        lineHeight: '13.33vw',
      },
      contentStyle: {
        // maxHeight: '100vh',
        // overflow: 'hidden',
        overflowY: 'auto',
        flex: '1',
        // padding: "0",
      },
      contentBoxStyle: {
        // maxHeight: "80vh",
        overflow: 'hidden'
      },
      // btns: ['确定'],
      callbacks: [function() {
        console.log("richTextFile callbacks");
      }]
    });
  }
  // 多分pdf选择
  async choosePdfFile(params) {
    const { file: filebox, index: _index, fromChooseList = false, isCoerce = false } = params;
    console.log("filebox", filebox);
    const { com_terms: fileArr = [], name: title } = filebox;
    const popupInstance = fromChooseList ? new Popup() : myPopup;
    let html = "<dl class='ChoosePdfFileList' style='margin:0;padding:0;'>";
    for (let i = 0; i < fileArr.length; i++) {
      const { pdf_url, name, file_type } = fileArr[i];
      const type = file_type || await this.judgeFileType({ type: "", file: fileArr[i], index: i });
      html += `<dd class="cl" data-pdf="${pdf_url}" data-title="${name}" data-index="${i}" style="margin:0">
          <span class="pdfsee item-contract" data-pdf="${pdf_url}" data-title="${name}" data-index="${i}" data-type="${type}">${name}</span>
        </dd>`;
    }
    html += "</dl>";
    if (isCoerce) return html;
    popupInstance.showBottomPopup({
      title,
      content: html,
      contentStyle: {},
      titleStyle: {
        fontWeight: "bold"
      },
      // btns: ['确定'],
      callbacks: [function() {
        console.log("choosePDffile callbacks");
      }]
    });
    // 异步绑定点击事件
    this.bindFileClick(".ChoosePdfFileList", fileArr);
  }
  // 引用条款 pdf 文件 - v1.0.4 升级为 Canvas 渲染
  async quotePdfFile(params) {
    const { file: filebox, fromChooseList = false, isControl = false, isCoerce = false } = params;
    
    // 判断是否使用 Canvas 渲染
    const shouldUseCanvas = this.Configns._isMobileDevice || this.Configns.useCanvasRender === true;
    
    if (shouldUseCanvas && !isCoerce) {
      // 使用 Canvas 渲染 (彻底解决下载问题)
      return await this._renderPdfWithCanvas({ 
        file: filebox, 
        fromChooseList, 
        isControl, 
        isCoerce 
      });
    } else {
      // 使用传统 iframe/object/embed 渲染
      return this._renderPdfWithIframe({ 
        file: filebox, 
        fromChooseList, 
        isControl, 
        isCoerce 
      });
    }
  }
  // 绑定文件点击事件 - v1.0.4 支持异步处理
  async bindFileClick(containerSelector, fileArr) {
    const container = document.querySelector(containerSelector);
    if (!container) throw new Error("容器未找到:" + containerSelector);
    container.addEventListener("click", async (event) => {
      const target = event.target;
      if (target.tagName.toLowerCase() === "span") {
        const dataset = target.dataset;
        const type = dataset.type;
        const index = dataset.index ? parseInt(dataset.index) : void 0;
        if (index !== void 0) {
          const file = fileArr?.[index] || this.Configns?.listObj?.fileList?.[index];
          console.log("read", index, type, file);
          if (type !== void 0 && file) {
            await this.judgeFileType({ type, file, index, fromChooseList: !!fileArr });
          }
        }
      }
    });
  }
  // 渲染强制阅读文件内容 - v1.0.4 支持异步 Canvas 渲染
  async openCoerceReadPopup() {
    const {
      fileList,
      btnArr = ["同意并继续"],
      btnStyle,
      btnBoxStyle,
      coerceCallBack,
      titleText,
      showProgressInButton
    } = this.Configns.coerceReadList;
    if (fileList.length === 0) throw new Error("fileList 不能为空");
    let currentIndex = 0;
    let customButtonTitles = null;
    let visitedIndices = [0];
    
    // 内部函数改为异步
    const showNextFile = async (_btnTitleArr) => {
      if (currentIndex >= fileList.length) return;
      const file = fileList[currentIndex];
      const isLastFile = currentIndex === fileList.length - 1;
      if (!file.file_type) {
        file.file_type = await this.judgeFileType({
          type: "",
          file,
          isCoerce: true
        });
      }
      const fileContent = await this.judgeFileType({
        type: file.file_type,
        file,
        isCoerce: true
      });
      const control = {
        next: () => {
          customButtonTitles = null;
          currentIndex++;
          if (!visitedIndices.includes(currentIndex)) {
            visitedIndices.push(currentIndex);
          }
          showNextFile();
        },
        prev: () => {
          customButtonTitles = null;
          if (currentIndex > 0) {
            currentIndex--;
            showNextFile();
          }
        },
        close: () => {
          myPopup.close();
        },
        getCurrentIndex: () => currentIndex,
        // 获取当前索引
        getFileList: () => [...fileList],
        // 返回副本防止外部修改
        isLastFile: () => isLastFile,
        // 是否为最后一份文件
        setButtonTitles: (titles) => {
          if (Array.isArray(titles)) {
            customButtonTitles = titles;
          }
        },
        // 获取已访问的文件索引列表
        getVisitedIndices: () => [...visitedIndices],
        // 跳转到指定文件索引
        goTo: (index) => {
          if (index >= 0 && index < fileList.length) {
            customButtonTitles = null;
            currentIndex = index;
            if (!visitedIndices.includes(currentIndex)) {
              visitedIndices.push(currentIndex);
            }
            showNextFile();
          }
        },
        // 控制复选框选中状态
        setCheckboxChecked: (isChecked) => {
          const checkboxId = this.Configns.listObj?.checkButtonID;
          if (checkboxId) {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
              checkbox.checked = isChecked;
              const event = new Event("change");
              checkbox.dispatchEvent(event);
            }
          }
        },
        // 获取复选框当前状态
        isCheckboxChecked: () => {
          const checkboxId = this.Configns.listObj?.checkButtonID;
          if (checkboxId) {
            const checkbox = document.getElementById(checkboxId);
            return checkbox ? checkbox.checked : false;
          }
          return false;
        }
      };
      const callbacks = [];
      if (btnArr && btnArr.length > 0) {
        for (let i = 0; i < btnArr.length; i++) {
          callbacks.push(
            /* @__PURE__ */ ((buttonIndex) => {
              return () => {
                if (typeof coerceCallBack === "function") {
                  return coerceCallBack(control, buttonIndex);
                } else if (Array.isArray(coerceCallBack) && typeof coerceCallBack[buttonIndex] === "function") {
                  return coerceCallBack[buttonIndex](control);
                }
              };
            })(i)
          );
        }
      }
      let finalButtons = customButtonTitles || btnArr;
      if (showProgressInButton !== false && !customButtonTitles && btnArr && btnArr.length > 0) {
        const currentDisplayIndex = currentIndex + 1;
        const totalLength = fileList.length;
        finalButtons = [...btnArr];
        if (typeof showProgressInButton === "number") {
          const buttonIndex = showProgressInButton;
          if (buttonIndex >= 0 && buttonIndex < finalButtons.length) {
            finalButtons[buttonIndex] = `${btnArr[buttonIndex]}(${currentDisplayIndex}/${totalLength})`;
          }
        } else if (showProgressInButton === true) {
          finalButtons[0] = `${btnArr[0]}(${currentDisplayIndex}/${totalLength})`;
        }
      }
      console.log("showNextFile", btnArr, finalButtons);
      const popupConfig = {
        title: file.name || `${titleText || "文件"} (${currentIndex + 1}/${fileList.length})`,
        content: fileContent,
        btnBoxStyle: btnBoxStyle || {
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "0 2.4vw"
        },
        btns: finalButtons,
        btnStyle: btnStyle || [
          {
            display: "inline-block",
            width: "91vw",
            height: "10.667vw",
            color: "#fff",
            backgroundColor: "#29AEEF",
            borderRadius: "8.533vw",
            textAlign: "center",
            lineHeight: "10.667vw",
            cursor: "pointer",
            margin: "5.33vw auto"
          },
          {
            display: "inline-block",
            width: "91vw",
            height: "10.667vw",
            color: "#fff",
            backgroundColor: "#29AEEF",
            borderRadius: "8.533vw",
            textAlign: "center",
            lineHeight: "10.667vw",
            cursor: "pointer",
            margin: "5.33vw auto"
          }
        ],
        callbacks
      };
      control.setCheckboxChecked(false);
      myPopup.showBottomPopup(popupConfig);
      if (file.file_type === 3 && file.com_terms) {
        this.bindFileClick(".ChoosePdfFileList", file.com_terms);
      }
    };
    await showNextFile();
  }
  // 加载文件内容
  loadFile(filePath) {
    const fileExtension = filePath.split(".").pop()?.toLowerCase();
    if (!fileExtension) {
      console.error("无法识别文件类型:", filePath);
      return;
    }
    const contentType = this.Configns.fileTypes[fileExtension];
    if (!contentType) {
      console.error("不支持的文件类型:", fileExtension);
      return;
    }
    const fileName = filePath.split("/").pop() || "文件";
    if (contentType === "application/pdf") {
      myPopup.showBottomPopup({
        title: fileName,
        content: `<iframe src="${filePath}" width="100%" height="600px" style="border:none;"></iframe>`,
        contentStyle: {},
        titleStyle: {
          fontWeight: "bold"
        },
        // btns: ['确定'],
        callbacks: [function() {
          console.log("loadFile callback");
        }]
      });
    } else {
      fetch(filePath).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      }).then((data) => {
        let content;
        if (fileExtension === "html" || fileExtension === "htm") {
          content = `<div style="max-height: 70vh; overflow-y: auto;">${data}</div>`;
        } else {
          content = `<pre style="white-space: pre-wrap; word-wrap: break-word; max-height: 70vh; overflow-y: auto;">${data}</pre>`;
        }
        myPopup.showBottomPopup({
          title: fileName,
          content,
          contentStyle: {
            maxHeight: "70vh",
            overflow: "auto"
          },
          titleStyle: {
            fontWeight: "bold"
          },
          callbacks: [function() {
            console.log("文件内容弹窗关闭");
          }]
        });
      }).catch((error) => {
        console.error("文件加载失败:", error);
        myPopup.showBottomPopup({
          title: "文件加载失败",
          content: `<p style="color: red;">无法加载文件: ${filePath}</p><p>错误详情: ${error.message}</p>`,
          callbacks: [function() {
            console.log("错误提示弹窗关闭");
          }]
        });
      });
    }
  }
}

// 导出默认
export default FilePreview;
