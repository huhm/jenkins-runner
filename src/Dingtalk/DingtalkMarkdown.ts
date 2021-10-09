import DingtalkMessage from "./DingtalkMessage";

/**
 * DingtalkMarkdown
 * 需要调用的api:
 * setTitle
 * setContent  （支持markdown语法）
 */
export default class DingtalkMarkdown extends DingtalkMessage {
  constructor() {
    super()
    this.msgtype = 'markdown'
  }

  get() {
    return this.render({
      [this.msgtype]: {
        title: this.title,
        text: this.content,
      }
    })
  }
}