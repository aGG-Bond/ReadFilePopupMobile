// ReadFilePopupMobile.ts
import Popup from "@aggbond/my-popup";
import { SecurityUtils, DEFAULT_SECURITY_CONFIG } from './security-config';
import * as pdfjsLib from 'pdfjs-dist';
import { pdfWorkerBase64 } from './pdf.worker.inline';

interface FileObject {
  name?: string;
  file_type?: number;
  pdf_url?: string;
  content_text?: string;
  com_terms?: FileObject[];
  styleStr?: Record<string, string>;
  divType?: string;
}

interface ListObject {
  listId: string;
  fileList: FileObject[];
  fileStyle?: Record<string, string>;
  isCheckButton?: boolean;
  isCoerceReadPopup?: boolean;
  checkCallBack?: (isChecked: boolean) => void;
  listText?: string;
  checkButtonID?: string;
}

interface CoerceReadList {
  titleText?: string;
  fileList: FileObject[];
  fileStyle?: Record<string, string>;
  btnArr?: string[];
  tipsText?: string;
  delayConfig?: {
    seconds: number;
    buttonIndex?: number;
    text?: string;
  };
  btnStyle?: Record<string, string>[];
  btnBoxStyle?: Record<string, string>;
  showProgressInButton?: boolean | number;
  coerceCallBack?: ((control: ControlObject, buttonIndex: number) => void) | ((control: ControlObject) => void)[];
}

interface ConfigOptions {
  basePath?: string;
  modalId?: string;
  contentId?: string;
  closeBtnId?: string;
  fileTypes?: Record<string, string>;
  fileKeyNameConfign?: {
    fileTitle: string;
    fileType?: string;
    filePdfUrl?: string;
    fileRichContent: string;
    fileArr: string;
  };
  isConfignFileKeyName?: boolean;
  isDrawFileList?: boolean;
  listObj?: ListObject;
  coerceReadList?: CoerceReadList;
  isBindFileClick?: boolean;
  useCanvasRender?: boolean | 'auto';
  pdfJsPath?: string;
  pdfWorkerPath?: string;
  enableMobileDetect?: boolean;
  mobileKeywords?: string[];
  canvasRenderOptions?: {
    scale?: number;
    maxZoom?: number;
    minZoom?: number;
    enableZoom?: boolean;
    loadingBarColor?: string;
    backgroundColor?: string;
  };
  allowLinksAndImages?: boolean; // 是否允许 a/img 标签（默认 false）
}

interface ControlObject {
  next: () => void;
  prev: () => void;
  close: () => void;
  getCurrentIndex: () => number;
  getFileList: () => FileObject[];
  isLastFile: () => boolean;
  setButtonTitles: (titles: string[]) => void;
  getVisitedIndices: () => number[];
  goTo: (index: number) => void;
  setCheckboxChecked: (isChecked: boolean) => void;
  isCheckboxChecked: () => boolean;
}

const myPopup = new Popup();

// 文件预览插件
class FilePreview {
  Configns: Required<ConfigOptions> & {
    listObj: Required<ListObject>;
    coerceReadList: Omit<Required<CoerceReadList>, 'delayConfig'> & {
      delayConfig?: NonNullable<CoerceReadList['delayConfig']>;
    };
    fileKeyNameConfign: NonNullable<ConfigOptions['fileKeyNameConfign']>;
    useCanvasRender: boolean | 'auto';
    pdfJsPath: string;
    pdfWorkerPath: string;
    enableMobileDetect: boolean;
    mobileKeywords: string[];
    canvasRenderOptions: Required<NonNullable<ConfigOptions['canvasRenderOptions']>>;
    _isMobileDevice: boolean;
  };
  pdfjsLib: any = null;
  private pdfDocCache: Map<string, any> = new Map();
  private pdfLoadingCache: Map<string, { promise: Promise<any>; task: any }> = new Map();
  private _delayTimer: number | null = null;
  private _beforeUnloadHandler: (() => void) | null = null;
  private _pageHideHandler: (() => void) | null = null;

  constructor(options: ConfigOptions) {
    // 默认配置
    this.Configns = Object.assign(
      {
        basePath: "/assets/pdfs/", // 文件基础路径
        modalId: "filePreviewModal", // 模态框ID
        contentId: "filePreviewContent", // 内容容器ID
        closeBtnId: "filePreviewCloseBtn", // 关闭按钮ID
        fileTypes: {
          // 支持的文件类型
          pdf: "application/pdf",
          txt: "text/plain",
          html: "text/html",
          "1": "richTextFile", // 富文本
          "2": "choosePdfFile", // pdf
          "3": "quotePdfFile", // 引用文本
          // 可以扩展更多类型
        },
        fileKeyNameConfign: {
          fileTitle: "name", //标题
          fileType: "doc_type", // 文件类型 1 富文本 2 pdf 3 引用文本,引用文本通常有多份
          filePdfUrl: "pdf_url", //  pdf地址 绝对路径
          fileRichContent: "content_text", // 富文本内容
          fileArr: "com_terms", // 可以扩展更多类型
        },
        isConfignFileKeyName: false, // 是否需要转换文件key 默认为false
        isDrawFileList: false, // 是否需要绘制阅读文件列表
        listObj: {
          listId: "", // 列表容器ID require
          fileList: [
            // 文件列表 require
            {
              name: "默认标题", //标题
              file_type: 3, // 文件类型 1 富文本 2 pdf 3 引用文本,引用文本通常有多份
              pdf_url: "", // pdf地址 绝对路径
              content_text: "", // 富文本内容
              com_terms: [
                // 多份文件
                {
                  name: "默认标题", //标题
                  pdf_url: "https://showFile.com/address.pdf", // pdf地址
                  content_text: "disclaimer<p><strong>默认文件</strong></p>", // 富文本内容
                },
              ],
              styleStr: {
                color: "red",
                "font-weight": "bold",
              },
            },
          ],
          fileStyle: {
            color: "red",
            "font-weight": "bold",
          }, // 文件样式span
          isCheckButton: false, // 列表是否需要复选框
          isCoerceReadPopup: true, // 是否强制阅读弹窗
          checkCallBack: (isChecked: boolean) => {
            console.log("复选框状态改变：", isChecked);
          }, // 复选框回调函数
          listText: "更多详情请阅读",
          checkButtonID: "ReadFileCheckBox",
        },
        // 强制阅读弹窗参数
        coerceReadList: {
          titleText: "请阅读并同意以下文件",
          tipsText: "请仔细阅读以下文件内容，阅读完毕后点击按钮继续。",
          fileList: [
            // 文件列表 require
            {
              name: "默认标题", //标题
              file_type: 3, // 文件类型 1 富文本 2 pdf 3 引用文本,引用文本通常有多份
              pdf_url: "", // pdf地址 绝对路径
              content_text: "", // 富文本内容
              com_terms: [
                // 多份文件
                {
                  name: "默认标题", //标题
                  pdf_url: "https://showFile.com/address.pdf", // pdf地址
                  content_text: "disclaimer<p><strong>默认文件</strong></p>", // 富文本内容
                },
              ],
              styleStr: {
                color: "red",
                "font-weight": "bold",
              },
            },
          ],
          fileStyle: {
            color: "red",
            "font-weight": "bold",
          },
          btnArr: ["确认已阅读并同意", "拒绝"],
          btnStyle: [{ color: "red" }, { color: "gray" }],
          btnBoxStyle: {},
          showProgressInButton: false,
          coerceCallBack: [
            (control: ControlObject, buttonIndex: number) => {
              console.log("btn[0]强制阅读弹窗结果：", control, buttonIndex);
            },
            (control: ControlObject, buttonIndex: number) => {
              console.log("btn[1]强制阅读弹窗结果：", control, buttonIndex);
            },
          ],
        },
        isBindFileClick: false, // 是否需要绑定文件点击事件
        useCanvasRender: true,
        pdfJsPath: '',
        pdfWorkerPath: '',
        enableMobileDetect: true,
        mobileKeywords: ['MicroMessenger', 'Mobile', 'Android', 'iPhone', 'iPad'],
        canvasRenderOptions: {
          scale: 1.5,
          maxZoom: 3,
          minZoom: 0.5,
          enableZoom: true,
          loadingBarColor: '#29AEEF',
          backgroundColor: '#ffffff'
        },
        allowLinksAndImages: false, // 是否允许 a/img 标签（默认 false，更安全）
        _isMobileDevice: false,
      },
      options
    );

    this.Configns._isMobileDevice = this.Configns.useCanvasRender === 'auto' && this.Configns.enableMobileDetect
      ? this._detectMobileDevice()
      : this.Configns.useCanvasRender === true;

    // 初始化模态框
    this.initModal();

    // 页面销毁时清除缓存
    this._beforeUnloadHandler = () => {
      this.clearPdfCache();
      this.destroy();
    };
    window.addEventListener('beforeunload', this._beforeUnloadHandler);

    // 页面隐藏时清除缓存（移动端更可靠）
    this._pageHideHandler = () => {
      this.clearPdfCache();
      this.destroy();
    };
    window.addEventListener('pagehide', this._pageHideHandler);
  }

  private _detectMobileDevice(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || '';
    return this.Configns.mobileKeywords.some((keyword) =>
      new RegExp(keyword, 'i').test(userAgent)
    );
  }

  private async _loadPdfJs(): Promise<any> {
    if (this.pdfjsLib) return this.pdfjsLib;
    
    let lib: any;
    if (this.Configns.pdfJsPath) {
      try {
        lib = await import(/* @vite-ignore */ this.Configns.pdfJsPath);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`无法加载 PDF.js 从 ${this.Configns.pdfJsPath}: ${message}`);
      }
    } else {
      lib = pdfjsLib;
    }
    
    if (lib.GlobalWorkerOptions) {
      if (this.Configns.pdfWorkerPath) {
        lib.GlobalWorkerOptions.workerSrc = this.Configns.pdfWorkerPath;
      } else {
        const binaryString = atob(pdfWorkerBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/javascript' });
        lib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
      }
    }
    this.pdfjsLib = lib;
    return this.pdfjsLib;
  }

  private async _getPdfDocument(url: string, onProgress?: (progress: { loaded: number; total: number }) => void): Promise<any> {
    // 已完成加载，直接返回
    if (this.pdfDocCache.has(url)) {
      if (onProgress) {
        onProgress({ loaded: 1, total: 1 });
      }
      return this.pdfDocCache.get(url);
    }

    // 正在加载中，更新进度回调并返回同一个 promise
    if (this.pdfLoadingCache.has(url)) {
      const loading = this.pdfLoadingCache.get(url)!;
      if (onProgress && loading.task) {
        loading.task.onProgress = onProgress;
      }
      return loading.promise;
    }

    // 开始新的加载
    await this._loadPdfJs();
    const loadingTask = this.pdfjsLib.getDocument({ url });
    if (onProgress) {
      loadingTask.onProgress = onProgress;
    }

    const promise = loadingTask.promise.then((pdf: any) => {
      this.pdfDocCache.set(url, pdf);
      this.pdfLoadingCache.delete(url);
      return pdf;
    }).catch((error: any) => {
      this.pdfLoadingCache.delete(url);
      throw error;
    });

    this.pdfLoadingCache.set(url, { promise, task: loadingTask });
    return promise;
  }

  clearPdfCache(): void {
    this.pdfDocCache.forEach(pdf => {
      if (pdf && typeof pdf.destroy === 'function') {
        pdf.destroy();
      }
    });
    this.pdfDocCache.clear();
    this.pdfLoadingCache.clear();
  }

  destroy(): void {
    this._clearDelayTimer();
    this.clearPdfCache();
    if (this._beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this._beforeUnloadHandler);
      this._beforeUnloadHandler = null;
    }
    if (this._pageHideHandler) {
      window.removeEventListener('pagehide', this._pageHideHandler);
      this._pageHideHandler = null;
    }
  }

  private async _renderPdfWithCanvas(params: {
    file: FileObject;
    fromChooseList?: boolean;
    isCoerce?: boolean;
  }): Promise<string | void> {
    const { file, fromChooseList = false, isCoerce = false } = params;
    const popupInstance = fromChooseList ? new Popup() : myPopup;
    try {
      if (!file.pdf_url) throw new Error('PDF URL 不能为空');
      await this._loadPdfJs();
      const containerId = `pdf-canvas-${Date.now()}`;
      const loadingBarId = `loading-bar-${Date.now()}`;
      const html = `<div id="${containerId}" class="aggb-pdf-canvas" style="width:100%;height:auto;position:relative;background:${this.Configns.canvasRenderOptions.backgroundColor}">
        <div id="${loadingBarId}" class="aggb-pdf-loading-bar" style="position:absolute;top:0;left:0;width:100%;height:4px;background:#f0f0f0;z-index:999"><div class="progress aggb-pdf-progress" style="height:100%;width:0%;background:${this.Configns.canvasRenderOptions.loadingBarColor};transition:width 0.3s"></div></div>
        <div class="pdf-canvas-container aggb-pdf-canvas-container" style="box-sizing:border-box;width:100%;height:100%;overflow:auto;-webkit-overflow-scrolling:touch;padding:10px"></div></div>`;
      if (isCoerce) {
        const safePdfUrl = SecurityUtils.escapeHtml(file.pdf_url);
        return `<div data-pdf-render-type="canvas" data-pdf-url="${safePdfUrl}" data-pdf-container-id="${containerId}" data-pdf-loading-bar-id="${loadingBarId}">${html}</div>`;
      }
      popupInstance.showBottomPopup({
        title: file.name,
        content: html,
        titleStyle: {
          width: '90%',
          fontSize: '4.266vw',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          fontWeight: 'bold',
          height: '13.33vw',
          minHeight: '13.33vw',
          lineHeight: '13.33vw',
        },
        contentStyle: { overflowY: 'auto', flex: '1', padding: '0' },
        contentBoxStyle: { maxHeight: '100vh', overflow: 'hidden' },
        callbacks: [() => console.log('Canvas PDF 弹窗关闭')],
      });
      setTimeout(() => this._initPdfCanvas(file.pdf_url as string, containerId, loadingBarId), 100);
    } catch (error) {
      console.error('Canvas 渲染失败，回退到 iframe 模式:', error);
      return this._renderPdfWithIframe(params);
    }
  }

  private _renderPdfWithIframe(params: { file: FileObject; fromChooseList?: boolean; isControl?: boolean; isCoerce?: boolean }): string | void {
    const { file, fromChooseList = false, isControl = false, isCoerce = false } = params;
    const popupInstance = fromChooseList ? new Popup() : myPopup;
    const modifiedUrl = isControl ? file.pdf_url : `${file.pdf_url}#toolbar=0&navpanes=0&scrollbar=0`;
    const safeUrl = SecurityUtils.escapeHtml(modifiedUrl);
    const html = `<iframe class="aggb-pdf-iframe" src="${safeUrl}" width="100%" height="800" style="border:none;"></iframe>`;
    if (isCoerce) return html;
    popupInstance.showBottomPopup({ title: file.name, content: html, contentStyle: { padding: '0' }, contentBoxStyle: { maxHeight: '100vh' }, titleStyle: { fontWeight: 'bold' } });
  }

  private async _initPdfCanvas(url: string, containerId: string, loadingBarId: string): Promise<void> {
    try {
      if (!url || typeof url !== 'string') throw new Error('PDF URL 不能为空');

      const pdf = await this._getPdfDocument(url, (progress: { loaded: number; total: number }) => {
        if (!progress.total) return;
        const progressBar = document.querySelector(`#${loadingBarId} .aggb-pdf-progress`);
        if (progressBar instanceof HTMLElement) {
          progressBar.style.width = `${Math.round((progress.loaded / progress.total) * 100)}%`;
        }
      });

      const loadingBar = document.getElementById(loadingBarId);
      if (loadingBar) loadingBar.style.display = 'none';
      const container = document.querySelector(`#${containerId} .pdf-canvas-container`);
      if (!container) throw new Error('Canvas 容器未找到');
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        await this._renderPdfPage(pdf, pageNum, container as HTMLElement);
      }
    } catch (error) {
      console.error('PDF Canvas 渲染错误:', error);
      const container = document.querySelector(`#${containerId} .pdf-canvas-container`);
      if (container) {
        const message = error instanceof Error ? SecurityUtils.getSafeErrorMessage(error.message) : '未知错误';
        const safeMessage = SecurityUtils.escapeHtml(message);
        container.innerHTML = `<div class="aggb-pdf-error" style="text-align:center;padding:50px;color:#999"><p>PDF 加载失败</p><p style="font-size:12px">${safeMessage}</p></div>`;
      }
    }
  }

  private async _renderPdfPage(pdf: any, pageNum: number, container: HTMLElement): Promise<void> {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: this.Configns.canvasRenderOptions.scale });
    const pageDiv = document.createElement('div');
    pageDiv.className = 'pdf-page-container aggb-pdf-page';
    pageDiv.style.cssText = 'margin:0 auto 10px;box-shadow:0 2px 10px rgba(0,0,0,0.1);background:white;max-width:100%;overflow:hidden;';
    const canvas = document.createElement('canvas');
    canvas.className = 'aggb-pdf-page-canvas';
    const context = canvas.getContext('2d');
    if (!context) throw new Error('无法创建 Canvas 上下文');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const maxWidth = container.clientWidth - 20;
    if (maxWidth > 0 && viewport.width > maxWidth) {
      const responsiveScale = maxWidth / viewport.width;
      canvas.style.width = `${maxWidth}px`;
      canvas.style.height = `${viewport.height * responsiveScale}px`;
    }
    pageDiv.appendChild(canvas);
    container.appendChild(pageDiv);
    await page.render({ canvasContext: context, viewport }).promise;
  }

  // 初始化
  initModal(): void {
    const {
      isDrawFileList,
      listObj,
      isBindFileClick,
      isConfignFileKeyName,
      coerceReadList,
    } = this.Configns;

    if (
      isConfignFileKeyName &&
      listObj.fileList &&
      listObj.fileList.length > 0
    ) {
      this.Configns.listObj.fileList = this.dataChange(listObj.fileList);
    }

    if (
      isConfignFileKeyName &&
      coerceReadList.fileList &&
      coerceReadList.fileList.length > 0
    ) {
      this.Configns.coerceReadList.fileList = this.dataChange(
        coerceReadList.fileList
      );
    }

    isDrawFileList && this.drawReadFileList(listObj);
    isBindFileClick && this.bindFileClick(listObj.listId, undefined);
  }

  // 数据转换
  dataChange(data: any[]): FileObject[] {
    if (!this.Configns.fileKeyNameConfign)
      throw new Error("请传入文件keyNameConfign");

    const { fileTitle, filePdfUrl, fileRichContent, fileArr, fileType } =
      this.Configns.fileKeyNameConfign;

    if (!fileTitle || !fileType || !filePdfUrl || !fileRichContent || !fileArr)
      throw new Error("请传入文件keyNameConfign的参数");

    data.forEach((item) => {
      item.name = item[fileTitle];
      item.file_type = item[fileType];
      item.pdf_url = item[filePdfUrl];
      item.content_text = item[fileRichContent];
      item.com_terms = item[fileArr];
    });

    return data as FileObject[];
  }

  //渲染阅读文件列表
  async drawReadFileList(listObj: ListObject): Promise<void> {
    const {
      listId: ID,
      fileList,
      isCheckButton,
      isCoerceReadPopup,
      checkCallBack,
      listText,
      checkButtonID,
      fileStyle,
    } = listObj;

    if (!ID) throw new Error("请传入需要添加的dom ID");
    if (fileList.length < 1) throw new Error("请传入需要渲染的文件数据");

    // 对用户输入进行 HTML 转义
    const safeCheckButtonID = SecurityUtils.escapeHtml(checkButtonID);
    const safeListText = SecurityUtils.escapeHtml(listText);

    let html = `${isCheckButton ? `<input class="aggb-file-list-checkbox" type="checkbox" id="${safeCheckButtonID}" />` : ""
      }${safeListText}`;

    for (let i = 0, len = fileList.length; i < len; i++) {
      const { name, pdf_url, file_type, styleStr } = fileList[i];
      const type =
        file_type ||
        await this.judgeFileType({ type: "", file: fileList[i], index: i });

      // 对用户输入进行 HTML 转义
      const safeName = SecurityUtils.escapeHtml(name);
      const safePdfUrl = SecurityUtils.escapeHtml(pdf_url || '');
      const safeStyle = SecurityUtils.escapeHtml(this.objToStr(styleStr ? styleStr : fileStyle || {}));

      html += `<span class="pdfsee item-contract aggb-file-list-item" data-pdf="${file_type == 2 ? safePdfUrl : ""
        }" data-title="${safeName}" data-index="${i}" data-type="${type}" style="${safeStyle}">${safeName}</span>`;
    }

    const element = document.querySelector(ID);
    if (!element) throw new Error("未找到元素" + ID);
    element.insertAdjacentHTML("beforeend", html);

    if (isCheckButton && checkButtonID) {
      const inputBox = document.getElementById(checkButtonID);

      if (inputBox) {
        inputBox.addEventListener("click", (e) => {
          const target = e.target as HTMLInputElement;
          const isChecked = target.checked;

          checkCallBack && checkCallBack(isChecked);

          isChecked && isCoerceReadPopup && this.openCoerceReadPopup();
        });
      }
    }
  }

  // 对象转换为字符串
  objToStr(obj: Record<string, string>): string {
    return Object.entries(obj).reduce(
      (str, [key, value]) => `${str}${key}:${value};`,
      ""
    );
  }

  // 判断文件格式
  async judgeFileType(
    params: {
      type: string | number;
      file?: FileObject;
      index?: number;
      fromChooseList?: boolean;
      isCoerce?: boolean;
    }
  ): Promise<number | string | void> {
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
        html = await this.quotePdfFile({ file, fromChooseList, isCoerce });
        break;
      case "3":
      case 3:
        html = await this.choosePdfFile({ file, index, fromChooseList, isCoerce });
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
  richTextFile(params: {
    file: FileObject;
    fromChooseList?: boolean;
    isCoerce?: boolean;
  }): string | void {
    const { file: filebox, fromChooseList = false, isCoerce = false } = params;
    const { name: title, content_text: text } = filebox;
    const popupInstance = fromChooseList ? new Popup() : myPopup;

    // 安全处理：净化HTML内容
    const safeText = SecurityUtils.sanitizeHTML(text || '', this.Configns.allowLinksAndImages);

    if (isCoerce) return safeText;

    popupInstance.showBottomPopup({
      title: title,
      content: safeText,
      contentStyle: {},
      titleStyle: {
        fontWeight: "bold",
      },
      // btns: ['确定'],
      callbacks: [function () {
        console.log("richTextFile callbacks");
      }],
    });
  }

  // 多分pdf选择
  async choosePdfFile(params: {
    file: FileObject;
    index?: number;
    fromChooseList?: boolean;
    isCoerce?: boolean;
  }): Promise<string | void> {
    const { file: filebox, index: _index, fromChooseList = false, isCoerce = false } = params;
    console.log("filebox", filebox);

    const { com_terms: fileArr = [], name: title } = filebox;
    const popupInstance = fromChooseList ? new Popup() : myPopup;

    let html = "<dl class='ChoosePdfFileList aggb-pdf-choose-list' style='margin:0;padding:0;'>";

    for (let i = 0; i < fileArr.length; i++) {
      const { pdf_url, name, file_type } = fileArr[i];
      const type =
        file_type ||
        await this.judgeFileType({ type: "", file: fileArr[i], index: i });

      // 对用户输入进行 HTML 转义
      const safeName = SecurityUtils.escapeHtml(name);
      const safePdfUrl = SecurityUtils.escapeHtml(pdf_url || '');

        html += `<dd class="cl aggb-pdf-choose-item" data-pdf="${safePdfUrl}" data-title="${safeName}" data-index="${i}" style="margin:0">
          <span class="pdfsee item-contract aggb-pdf-choose-link" data-pdf="${safePdfUrl}" data-title="${safeName}" data-index="${i}" data-type="${type}">${safeName}</span>
        </dd>`;
    }

    html += "</dl>";

    if (isCoerce) return html;

    popupInstance.showBottomPopup({
      title,
      content: html,
      contentStyle: {},
      titleStyle: {
        fontWeight: "bold",
      },
      // btns: ['确定'],
      callbacks: [function () {
        console.log("choosePDffile callbacks");
      }],
    });

    this.bindFileClick(".ChoosePdfFileList", fileArr);
  }

  // 引用条款 pdf文件
  async quotePdfFile(params: {
    file: FileObject;
    fromChooseList?: boolean;
    isControl?: boolean;
    isCoerce?: boolean;
  }): Promise<string | void> {
    const { file: filebox, fromChooseList = false, isControl = false, isCoerce = false } = params;
    const { pdf_url: url, name: title, divType = "iframe" } = filebox;

    const shouldUseCanvas = this.Configns._isMobileDevice || this.Configns.useCanvasRender === true;
    if (shouldUseCanvas) {
      return this._renderPdfWithCanvas({ file: filebox, fromChooseList, isCoerce });
    }

    // 如果来自选择列表，创建新实例
    const popupInstance = fromChooseList ? new Popup() : myPopup;

    // 添加参数尝试禁用工具栏
    const modifiedUrl = isControl
      ? url
      : `${url}#toolbar=0&navpanes=0&scrollbar=0`;

    const safeUrl = SecurityUtils.escapeHtml(modifiedUrl);
    const iframeHtml = `<iframe class="aggb-pdf-iframe" src="${safeUrl}" width="100%" height="800" style="border:none;"></iframe>`;
    const objectHtml = `<object class="aggb-pdf-object" data="${safeUrl}" type="application/pdf" width="100%" height="800">
    <p>您的浏览器不支持PDF查看。请<a href="${safeUrl}">下载文件</a>。</p></object>`;
    const embedHtml = `<embed class="aggb-pdf-embed" src="${safeUrl}" type="application/pdf" width="100%" height="800" />`;

    const html =
      divType === "iframe"
        ? iframeHtml
        : divType === "object"
          ? objectHtml
          : embedHtml;

    if (isCoerce) return html;

    popupInstance.showBottomPopup({
      title: title,
      content: html,
      contentStyle: {
        // maxHeight: '100vh',
        // overflow: 'hidden auto'
        padding: "0",
      },
      contentBoxStyle: {
        maxHeight: "100vh",
      },
      titleStyle: {
        fontWeight: "bold",
      },
      callbacks: [function () {
        console.log("quotePdfFile callback");
      }],
    });

    return;
  }

  // 绑定文件点击事件
  bindFileClick(containerSelector: string, fileArr?: FileObject[]): void {
    const container = document.querySelector(containerSelector);
    if (!container) throw new Error("容器未找到:" + containerSelector);

    container.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName.toLowerCase() === "span") {
        const dataset = target.dataset;
        const type = dataset.type;
        const index = dataset.index ? parseInt(dataset.index) : undefined;

        if (index !== undefined) {
          const file =
            fileArr?.[index] || this.Configns?.listObj?.fileList?.[index];

          console.log("read", index, type, file);

          if (type !== undefined && file) {
            this.judgeFileType({ type, file, index, fromChooseList: !!fileArr });
          }
        }
      }
    });
  }

  // 渲染强制阅读文件内容
  async openCoerceReadPopup(): Promise<void> {
    const {
      fileList,
      btnArr = ["同意并继续"],
      btnStyle,
      btnBoxStyle,
      coerceCallBack,
      titleText,
      tipsText,
      showProgressInButton,
      delayConfig
    } = this.Configns.coerceReadList;

    if (fileList.length === 0) throw new Error("fileList不能为空");

    let currentIndex = 0;
    let customButtonTitles: string[] | null = null;
    // 记录已访问的文件索引，用于判断是否可以返回
    let visitedIndices = [0];
    const showNextFile = async (_btnTitleArr?: string[]): Promise<void> => {
      if (currentIndex >= fileList.length) return;
      this._clearDelayTimer();

      const file = fileList[currentIndex];
      const isLastFile = currentIndex === fileList.length - 1;

      // 确保文件类型已设置
      if (!file.file_type) {
        file.file_type = await this.judgeFileType({
          type: "",
          file,
          isCoerce: true
        }) as number;
      }

      // 获取文件内容
      const fileContent = await this.judgeFileType({
        type: file.file_type,
        file,
        isCoerce: true,
      }) as string;

      // 创建控制对象供外部回调使用
      const control: ControlObject = {
        next: () => {
          // 下一份文件
          // 重置自定义按钮文字状态
          customButtonTitles = null;
          currentIndex++;
          // 记录访问过的索引
          if (!visitedIndices.includes(currentIndex)) {
            visitedIndices.push(currentIndex);
          }
          showNextFile();
        },
        prev: () => {
          // 上一份文件
          // 重置自定义按钮文字状态
          customButtonTitles = null;
          if (currentIndex > 0) {
            currentIndex--;
            showNextFile();
          }
        },
        close: () => {
          // 关闭弹窗
          myPopup.close();
        },
        getCurrentIndex: () => currentIndex, // 获取当前索引
        getFileList: () => [...fileList], // 返回副本防止外部修改
        isLastFile: () => isLastFile, // 是否为最后一份文件
        setButtonTitles: (titles) => {
          // 允许外部修改按钮文字
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
              (checkbox as HTMLInputElement).checked = isChecked;
              // 触发change事件，确保相关回调被执行
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
            return checkbox ? (checkbox as HTMLInputElement).checked : false;
          }
          return false;
        },
      };

      // 为每个按钮创建回调函数
      const callbacks: (() => void)[] = [];
      const delaySeconds = delayConfig && Number.isFinite(delayConfig.seconds) && delayConfig.seconds > 0
        ? Math.ceil(delayConfig.seconds)
        : 0;
      const configuredButtonIndex = delayConfig?.buttonIndex;
      const targetButtonIndex: number = Number.isInteger(configuredButtonIndex) && configuredButtonIndex !== undefined && configuredButtonIndex >= 0
        ? configuredButtonIndex
        : 0;
      const delayMessage = delayConfig?.text || "请等待 {seconds} 秒";
      let nextButtonReady = delaySeconds === 0;
      if (btnArr && btnArr.length > 0) {
        for (let i = 0; i < btnArr.length; i++) {
          callbacks.push(
            ((buttonIndex) => {
              return () => {
                if (buttonIndex === targetButtonIndex && !nextButtonReady) return false;
                if (typeof coerceCallBack === "function") {
                  return coerceCallBack(control, buttonIndex);
                } else if (
                  Array.isArray(coerceCallBack) &&
                  typeof coerceCallBack[buttonIndex] === "function"
                ) {
                  return coerceCallBack[buttonIndex](control);
                }
              };
            })(i)
          );
        }
      }

      // 确定最终使用的按钮文字
      let finalButtons = customButtonTitles || btnArr;
      // 如果配置了显示进度且没有自定义按钮标题，则添加进度信息
      if (showProgressInButton !== false && !customButtonTitles && btnArr && btnArr.length > 0) {
        const currentDisplayIndex = currentIndex + 1; // 显示索引从1开始
        const totalLength = fileList.length;

        finalButtons = [...btnArr]; // 复制原始按钮数组

        // 根据 showProgressInButton 的值决定在哪个按钮上添加进度信息
        if (typeof showProgressInButton === 'number') {
          // 如果是数字，表示按钮索引
          const buttonIndex = showProgressInButton;
          if (buttonIndex >= 0 && buttonIndex < finalButtons.length) {
            finalButtons[buttonIndex] = `${btnArr[buttonIndex]}(${currentDisplayIndex}/${totalLength})`;
          }
        } else if (showProgressInButton === true) {
          // 如果是 true，表示在第一个按钮上显示
          finalButtons[0] = `${btnArr[0]}(${currentDisplayIndex}/${totalLength})`;
        }
      }

      const delayedButtonTitle = finalButtons[targetButtonIndex];
      const hasDelay = delayConfig !== undefined && delaySeconds > 0 && !customButtonTitles && delayedButtonTitle !== undefined;
      if (hasDelay) {
        finalButtons = [...finalButtons];
        finalButtons[targetButtonIndex] = delayMessage.replace('{seconds}', String(delaySeconds));
      }
      console.log("showNextFile", btnArr, finalButtons);
      const safeTipsText = tipsText ? SecurityUtils.escapeHtml(tipsText) : '';
      const popupConfig = {
        title:
          file.name ||
          `${titleText || "文件"} (${currentIndex + 1}/${fileList.length})`,
        content: safeTipsText ? `<div class="aggb-tips-wrapper" style="display: flex;flex-direction: column;height: 100%;overflow:hidden;">
        <p class="aggb-tips-content" style="width: 100%;padding: 10px;background: #FFE7E5;color: #FF3B30;margin:0;box-sizing: border-box;flex-shrink: 0;">${safeTipsText}</p>
        <div class="aggb-file-content" style="flex: 1;overflow-y: auto;padding: ${file.file_type === 2 ? '0' : '0 20px'};">${fileContent}</div>
        </div>` : fileContent,
        contentStyle: tipsText ? { padding: '0' } : undefined,
        btnBoxStyle: btnBoxStyle || {
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "0 2.4vw",
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
            margin: "5.33vw auto",
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
            margin: "5.33vw auto",
          },
        ],
        callbacks,
      };

      control.setCheckboxChecked(false);

      // 判断弹窗是否已打开，决定使用 showBottomPopup 还是 switchContent
      if (myPopup.isShowing) {
        // 弹窗已打开，直接切换内容（不触发动画）
        myPopup.switchContent({
          title: popupConfig.title,
          content: popupConfig.content,
          btns: popupConfig.btns,
          callbacks: popupConfig.callbacks,
          btnStyle: popupConfig.btnStyle,
        });
      } else {
        // 弹窗未打开，首次显示
        myPopup.showBottomPopup(popupConfig);
      }

      if (hasDelay) {
        const button = document.querySelectorAll('.aggb-popup-button')[targetButtonIndex];
        if (button instanceof HTMLElement) {
          button.style.cursor = 'not-allowed';
          button.style.opacity = '0.6';
        }
      }

      const canvasRoot = document.querySelector('[data-pdf-render-type="canvas"]');
      if (canvasRoot instanceof HTMLElement) {
        const containerId = canvasRoot.dataset.pdfContainerId;
        const loadingBarId = canvasRoot.dataset.pdfLoadingBarId;
        const pdfUrl = canvasRoot.dataset.pdfUrl;
        if (containerId && loadingBarId && pdfUrl) {
          setTimeout(async () => {
            await this._initPdfCanvas(pdfUrl, containerId, loadingBarId);
            if (hasDelay) {
              this._startDelayCountdown(delaySeconds, delayMessage, delayedButtonTitle, targetButtonIndex, () => { nextButtonReady = true; });
            }
          }, 100);
        }
      } else {
        const iframe = document.querySelector('.aggb-pdf-iframe') as HTMLIFrameElement | null;
        if (iframe) {
          iframe.onload = () => {
            if (hasDelay) {
              this._startDelayCountdown(delaySeconds, delayMessage, delayedButtonTitle, targetButtonIndex, () => { nextButtonReady = true; });
            }
          };
        } else {
          if (hasDelay) {
            this._startDelayCountdown(delaySeconds, delayMessage, delayedButtonTitle, targetButtonIndex, () => { nextButtonReady = true; });
          }
        }
      }

      if (file.file_type === 3 && file.com_terms) {
        this.bindFileClick(".ChoosePdfFileList", file.com_terms);
      }
    };

    await showNextFile();
  }

  private _clearDelayTimer(): void {
    if (this._delayTimer !== null) {
      window.clearInterval(this._delayTimer);
      this._delayTimer = null;
    }
  }

  private _startDelayCountdown(
    delaySeconds: number,
    delayMessage: string,
    delayedButtonTitle: string,
    targetButtonIndex: number,
    onComplete: () => void
  ): void {
    this._clearDelayTimer();
    let remainingSeconds = delaySeconds;
    const button = document.querySelectorAll('.aggb-popup-button')[targetButtonIndex];
    if (button instanceof HTMLElement) {
      button.style.cursor = 'not-allowed';
      button.style.opacity = '0.6';
    }
    this._delayTimer = window.setInterval(() => {
      remainingSeconds--;
      if (button instanceof HTMLElement) {
        button.textContent = remainingSeconds > 0
          ? delayMessage.replace('{seconds}', String(remainingSeconds))
          : delayedButtonTitle;
        button.style.cursor = remainingSeconds > 0 ? 'not-allowed' : 'pointer';
        button.style.opacity = remainingSeconds > 0 ? '0.6' : '1';
      }
      if (remainingSeconds <= 0) {
        onComplete();
        this._clearDelayTimer();
      }
    }, 1000);
  }

  // 加载文件内容
  // 支持两种调用方式：
  // 1. loadFile(filePath, title?) - 简单方式，通过 URL 加载 PDF/TXT/HTML
  // 2. loadFile(fileObject) - 完整方式，支持所有文件类型（富文本、PDF、引用文本）
  async loadFile(fileOrPath: string | FileObject, title?: string): Promise<void> {
    // 如果是字符串，走简单方式（向后兼容）
    if (typeof fileOrPath === 'string') {
      const filePath = fileOrPath;
      
      // 判断是否为 HTTP/HTTPS URL
      const isHttpUrl = /^https?:\/\//i.test(filePath);
      
      // 安全验证：只对本地路径进行验证，HTTP URL 跳过
      if (!isHttpUrl) {
        const pathValidation = SecurityUtils.isValidFilePath(filePath);
        if (!pathValidation.isValid) {
          console.error("文件路径验证失败:", pathValidation.errors.join(', '));
          myPopup.msg(`文件路径验证失败: ${pathValidation.errors.join(', ')}`);
          return;
        }
      }

      // CSRF防护：检查请求来源
      if (typeof window !== 'undefined' && window.location) {
        const currentOrigin = window.location.origin;
        try {
          const fileUrl = new URL(filePath, currentOrigin);
          if (fileUrl.origin !== currentOrigin && !filePath.startsWith('http')) {
            console.warn("跨域文件请求:", filePath);
          }
        } catch (e) {
          console.error("URL解析失败:", e);
          myPopup.msg("文件URL格式不正确");
          return;
        }
      }

      const fileExtension = filePath.split(".").pop()?.toLowerCase();
      
      // 安全验证：检查文件扩展名
      if (!fileExtension || !SecurityUtils.isValidFileExtension(fileExtension)) {
        console.error("不支持的文件类型:", fileExtension);
        myPopup.msg(`不支持的文件类型: ${fileExtension || '未知'}`);
        return;
      }

      const fileName = title || filePath.split("/").pop() || "文件";

      // 根据扩展名判断文件类型
      let fileType: number;
      let fileContent = '';
      let fileUrl = '';

      if (fileExtension === 'pdf') {
        fileType = 2;
        fileUrl = filePath;
      } else if (fileExtension === 'txt' || fileExtension === 'html' || fileExtension === 'htm') {
        fileType = 1;
        try {
          const response = await fetch(filePath);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          fileContent = await response.text();
          if (fileExtension === 'html' || fileExtension === 'htm') {
            fileContent = SecurityUtils.sanitizeHTML(fileContent, this.Configns.allowLinksAndImages);
          }
        } catch (error) {
          console.error("文件加载失败:", error);
          const safeErrorMessage = SecurityUtils.getSafeErrorMessage(error instanceof Error ? error.message : String(error));
          myPopup.msg(`无法加载文件: ${safeErrorMessage}`);
          return;
        }
      } else {
        fileType = 2;
        fileUrl = filePath;
      }

      const file: FileObject = {
        name: fileName,
        file_type: fileType,
        pdf_url: fileUrl,
        content_text: fileContent
      };

      await this.judgeFileType({ type: fileType, file });
      return;
    }

    // 如果是对象，走完整方式
    const file = fileOrPath;
    
    // 如果没有 name，自动从 pdf_url 提取
    if (!file.name) {
      if (file.pdf_url) {
        file.name = file.pdf_url.split('/').pop() || '文件';
      } else {
        file.name = '文件';
      }
    }

    // 如果没有指定 file_type，自动判断
    if (!file.file_type) {
      file.file_type = await this.judgeFileType({ type: "", file }) as number;
    }

    await this.judgeFileType({ type: file.file_type, file });
  }
}

export default FilePreview;
export { SecurityUtils, DEFAULT_SECURITY_CONFIG };
