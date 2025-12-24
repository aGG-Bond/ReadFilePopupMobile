// ReadFilePopupMobile.ts
import Popup from "@aggbond/my-popup";

interface FileObject {
  name: string;
  file_type: number;
  pdf_url: string;
  content_text: string;
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
    fileType: string;
    filePdfUrl: string;
    fileRichContent: string;
    fileArr: string;
  };
  isConfignFileKeyName?: boolean;
  isDrawFileList?: boolean;
  listObj?: ListObject;
  coerceReadList?: CoerceReadList;
  isBindFileClick?: boolean;
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
    coerceReadList: Required<CoerceReadList>;
    fileKeyNameConfign: NonNullable<ConfigOptions['fileKeyNameConfign']>;
  };

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
          // 配置文件键值key 免于不同格式的数据转换 isConfignFileKeyName 为true,则fielKeyNameConfign为required;
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
                  pdf_url: "clause_pdf: https://showFile.com/address.pdf", // pdf地址
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
                  pdf_url: "clause_pdf: https://showFile.com/address.pdf", // pdf地址
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
      },
      options
    );

    // 初始化模态框
    this.initModal();
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

    if (coerceReadList.fileList && coerceReadList.fileList.length > 0) {
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

    if (!fileTitle || !filePdfUrl || !fileRichContent || !fileArr)
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
  drawReadFileList(listObj: ListObject): void {
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

    let html = `${isCheckButton ? `<input type="checkbox" id="${checkButtonID}" />` : ""
      }${listText}`;

    for (let i = 0, len = fileList.length; i < len; i++) {
      const { name, pdf_url, file_type, styleStr } = fileList[i];
      const type =
        file_type ||
        this.judgeFileType({ type: "", file: fileList[i], index: i });

      html += `<span class="pdfsee item-contract" data-pdf="${file_type == 2 ? pdf_url : ""
        }" data-title="${name}" data-index="${i}" data-type="${type}" style="${this.objToStr(
          styleStr ? styleStr : fileStyle || {}
        )}">${name}</span>`;
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
  judgeFileType(
    params: {
      type: string | number;
      file?: FileObject;
      index?: number;
      fromChooseList?: boolean;
      isCoerce?: boolean;
    }
  ): number | string | void {
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
        html = this.quotePdfFile({ file, fromChooseList, isCoerce });
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
  richTextFile(params: {
    file: FileObject;
    fromChooseList?: boolean;
    isCoerce?: boolean;
  }): string | void {
    const { file: filebox, fromChooseList = false, isCoerce = false } = params;
    const { name: title, content_text: text } = filebox;
    const popupInstance = fromChooseList ? new Popup() : myPopup;

    if (isCoerce) return text;

    popupInstance.showBottomPopup({
      title: title,
      content: text,
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
  choosePdfFile(params: {
    file: FileObject;
    index?: number;
    fromChooseList?: boolean;
    isCoerce?: boolean;
  }): string | void {
    const { file: filebox, index: _index, fromChooseList = false, isCoerce = false } = params;
    console.log("filebox", filebox);

    const { com_terms: fileArr = [], name: title } = filebox;
    const popupInstance = fromChooseList ? new Popup() : myPopup;

    let html = "<dl class='ChoosePdfFileList' style='margin:0;padding:0;'>";

    for (let i = 0; i < fileArr.length; i++) {
      const { pdf_url, name, file_type } = fileArr[i];
      const type =
        file_type ||
        this.judgeFileType({ type: "", file: fileArr[i], index: i });

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
  quotePdfFile(params: {
    file: FileObject;
    fromChooseList?: boolean;
    isControl?: boolean;
    isCoerce?: boolean;
  }): string | void {
    const { file: filebox, fromChooseList = false, isControl = false, isCoerce = false } = params;
    const { pdf_url: url, name: title, divType = "iframe" } = filebox;

    // 如果来自选择列表，创建新实例
    const popupInstance = fromChooseList ? new Popup() : myPopup;

    // 添加参数尝试禁用工具栏
    const modifiedUrl = isControl
      ? url
      : `${url}#toolbar=0&navpanes=0&scrollbar=0`;

    const iframeHtml = `<iframe src="${modifiedUrl}" width="100%" height="800" style="border:none;"></iframe>`;
    const objectHtml = `<object data="${modifiedUrl}" type="application/pdf" width="100%" height="800">
    <p>您的浏览器不支持PDF查看。请<a href="${modifiedUrl}">下载文件</a>。</p></object>`;
    const embedHtml = `<embed src="${modifiedUrl}" type="application/pdf" width="100%" height="800" />`;

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
  openCoerceReadPopup(): void {
    const {
      fileList,
      btnArr = ["同意并继续"],
      btnStyle,
      btnBoxStyle,
      coerceCallBack,
      titleText,
      showProgressInButton
    } = this.Configns.coerceReadList;

    if (fileList.length === 0) throw new Error("fileList不能为空");

    let currentIndex = 0;
    let customButtonTitles: string[] | null = null;
    // 记录已访问的文件索引，用于判断是否可以返回
    let visitedIndices = [0];
    const showNextFile = (_btnTitleArr?: string[]) => {
      if (currentIndex >= fileList.length) return;

      const file = fileList[currentIndex];
      const isLastFile = currentIndex === fileList.length - 1;

      // 确保文件类型已设置
      if (!file.file_type) {
        file.file_type = this.judgeFileType({
          type: "",
          file,
          isCoerce: true
        }) as number;
      }

      // 获取文件内容
      const fileContent = this.judgeFileType({
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
      if (btnArr && btnArr.length > 0) {
        for (let i = 0; i < btnArr.length; i++) {
          callbacks.push(
            ((buttonIndex) => {
              return () => {
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
      console.log("showNextFile", btnArr, finalButtons);

      const popupConfig = {
        title:
          file.name ||
          `${titleText || "文件"} (${currentIndex + 1}/${fileList.length})`,
        content: fileContent,
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

      myPopup.showBottomPopup(popupConfig);

      if (file.file_type === 3 && file.com_terms) {
        this.bindFileClick(".ChoosePdfFileList", file.com_terms);
      }
    };

    showNextFile();
  }

  // 加载文件内容
  loadFile(filePath: string): void {
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
      // 对于PDF文件，直接使用iframe，避免CORS问题
      myPopup.showBottomPopup({
        title: fileName,
        content: `<iframe src="${filePath}" width="100%" height="600px" style="border:none;"></iframe>`,
        contentStyle: {},
        titleStyle: {
          fontWeight: "bold",
        },
        // btns: ['确定'],
        callbacks: [function () {
          console.log("loadFile callback");
        }],
      });
    } else {
      // 对于其他文件类型，仍然使用fetch
      fetch(filePath)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then((data) => {
          // 根据文件类型决定展示方式
          let content: string;
          if (fileExtension === 'html' || fileExtension === 'htm') {
            // 对于HTML文件，直接显示（但需要注意安全问题）
            content = `<div style="max-height: 70vh; overflow-y: auto;">${data}</div>`;
          } else {
            // 对于文本文件，使用<pre>标签保持格式
            content = `<pre style="white-space: pre-wrap; word-wrap: break-word; max-height: 70vh; overflow-y: auto;">${data}</pre>`;
          }
          myPopup.showBottomPopup({
            title: fileName,
            content: content,
            contentStyle: {
              maxHeight: "70vh",
              overflow: "auto",
            },
            titleStyle: {
              fontWeight: "bold",
            },
            callbacks: [function () {
              console.log("文件内容弹窗关闭");
            }],
          });
        })
        .catch((error) => {
          console.error("文件加载失败:", error);
          // 显示错误信息在弹窗中
          myPopup.showBottomPopup({
            title: "文件加载失败",
            content: `<p style="color: red;">无法加载文件: ${filePath}</p><p>错误详情: ${error.message}</p>`,
            callbacks: [function () {
              console.log("错误提示弹窗关闭");
            }],
          });
        });
    }
  }
}

export default FilePreview;