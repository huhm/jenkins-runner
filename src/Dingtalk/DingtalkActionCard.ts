import DingtalkMessage from "./DingtalkMessage";

export enum BtnOrientation {
  Vertical = 0,
  Horizontal = 1
}

/**
 * DingtalkActionCard
 * 需要调用的api:
 * setTitle
 * setContent  （支持markdown语法）
 * [optional] setBtnOrientation
 * addBtn|setSingleBtn
 */
export default class DingtalkActionCard extends DingtalkMessage {
  protected btnOrientation?: BtnOrientation;
  protected singleUrl?: string;
  protected singleTitle?: string;
  protected btns: { title: string, actionURL: string }[] = []
  constructor() {
    super()
    this.msgtype = 'actionCard'
  }

  /**
   * [optional] 设置按钮排列
   * @param btnOrientation 
   * @returns 
   */
  setBtnOrientation(btnOrientation: BtnOrientation) {
    this.btnOrientation = btnOrientation;
    return this;
  }

  /**
   * 点击singleTitle按钮触发的URL。（和singleBtn二选一）
   */
  setSingleBtn(sTitle: string, sUrl: string) {
    this.singleUrl = sUrl;
    this.singleTitle = sTitle;
    return this;
  }

  /**
   * 添加action按钮（和singleBtn二选一）
   */
  addBtn(btnTitle: string, btnUrl: string) {
    this.btns.push({
      title: btnTitle,
      actionURL: btnUrl
    })
    return this;
  }


  get() {
    if (!this.singleUrl && this.btns.length === 0) {
      throw new Error('Dingtalk ActionCard has no singleBtn or btns,use addBtn or setSingleBtn')

    }
    return this.render({
      [this.msgtype]: {
        title: this.title,
        text: this.contentLines.join('\n'),
        btnOrientation: this.btnOrientation + '',

        singleTitle: this.singleTitle,
        singleUrl: this.singleUrl,

        btns: this.btns.length > 0 ? this.btns : undefined
      }
    })
  }
}