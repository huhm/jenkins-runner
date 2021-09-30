
/**
 * Dingtalk消息基类
 * 需要调用的api:
 * setTitle
 * setContent  （支持markdown语法）
 * [optional] setBtnOrientation
 * addBtn|setSingleBtn
 */
export default abstract class DingtalkMessage {
  protected isAtAll: boolean
  protected atMobiles: Set<string>
  protected title?: string;
  protected atDingtalkIds: Set<string>
  protected msgtype: 'markdown' | 'text' | 'link' | 'actionCard' | 'feedCard' = 'text';
  protected contentLines: string[] = [];

  constructor() {
    this.isAtAll = false
    this.atMobiles = new Set()
    this.atDingtalkIds = new Set()
  }

  //#region  create message
  protected render(options: Object) {
    return Object.assign({
      msgtype: this.msgtype,
    }, options, this.canAt
      ? {
        at: {
          atMobiles: Array.from(this.atMobiles),
          atDingtalkIds: Array.from(this.atDingtalkIds),
          isAtAll: this.isAtAll,
        },
      }
      : {})
  }

  abstract get(): Object;
  //#endregion

  //#region 标题
  setTitle(title: string) {
    this.title = title
    return this
  }
  //#endregion

  //#region 内容
  /**
   * 设置内容，将会覆盖原内容(prepend|append)
   * text类型：如果太长只会部分展示。
   * actionCard: markdown类型
   * @param content 
   */
  setContent(content: string | string[]) {
    if (Array.isArray(content)) {
      this.contentLines = content
    } else {
      this.contentLines = [content]
    }
    return this
  }
  /**
   * 设置内容，在原内容基础上加
   * @param text 
   */
  prepend(text: string | string[]) {
    if (Array.isArray(text)) {
      this.contentLines.splice(0, 0, ...text)
    } else {
      this.contentLines.splice(0, 0, text)
    }
    return this
  }

  /**
   * 添加到最后一行的文本后面
   * @param text 
   */
  appendInline(text: string, _jointStr: string) {
    if (!text) {
      return;
    }
    let lastLine = '';
    let lastLineIdx = 0;
    if (this.contentLines.length === 0) {
      this.contentLines.push(lastLine)
    } else {
      lastLineIdx = this.contentLines.length - 1
      lastLine = this.contentLines[lastLineIdx] || ''
    }
    let joinChar = lastLine.length > 0 && _jointStr ? _jointStr : ''
    this.contentLines[lastLineIdx] = lastLine + joinChar + text
    return this
  }

  /**
   * 添加到第一行的文本前面
   * @param text 
   */
  prependInline(text: string, _jointStr: string) {
    if (!text) {
      return;
    }
    let firstLine = '';
    if (this.contentLines.length === 0) {
      this.contentLines.push(firstLine)
    }
    let joinChar = firstLine.length > 0 && _jointStr ? _jointStr : ''
    this.contentLines[0] = text + joinChar + firstLine
    return this
  }

  /**
   * 设置内容，在原内容基础上加
   * @param text 
   */
  append(text: string | string[]) {
    if (Array.isArray(text)) {
      this.contentLines = this.contentLines.concat(text)
    } else {
      this.contentLines.push(text)
    }
    return this
  }
  //#endregion

  //#region at信息
  get canAt() {
    return this.isAtAll || this.atDingtalkIds.size > 0 || this.atMobiles.size > 0
  }

  setAtAll() {
    this.isAtAll = true
    return this
  }

  addAtPhone(phones: string | string[]) {
    appendStringSet(this.atMobiles, phones);
    return this
  }

  addAtId(ids: string | string[]) {
    appendStringSet(this.atDingtalkIds, ids);
    return this
  }
  //#endregion
}

function appendStringSet(set: Set<string>, list: string | string[]) {
  if (!list) {
    return false;
  }
  if (Array.isArray(list)) {
    list.forEach((item) => {
      set.add(item);
    });
  } else {
    set.add(list);
  }
}