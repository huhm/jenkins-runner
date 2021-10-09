import DingtalkMessage from "./DingtalkMessage";

/**
 * DingtalkText
 * 需要调用的api:
 * setContent
 */
export default class DingtalkText extends DingtalkMessage {
  title?: string;
  constructor() {
    super()
    this.msgtype = 'text'
  }

  get() {
    return this.render({
      [this.msgtype]: {
        title: this.title,
        content: this.content,
      }
    })
  }
}