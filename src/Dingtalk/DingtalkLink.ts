import DingtalkMessage from "./DingtalkMessage";

/**
 * DingtalkLink
 * 需要调用的api:
 * setTitle
 * setContent  （支持markdown语法）
 * [optional] setPicUrl
 * [optional] setMessageUrl
 */
export default class DingtalkLink extends DingtalkMessage {
  private picUrl?: string;
  private messageUrl?: string;
  constructor() {
    super()
    this.msgtype = 'link'
  }

  /**
   * [optional] 图片URL。
   * @param picUrl 
   */
  setPicUrl(picUrl: string) {
    this.picUrl = picUrl
    return this;
  }

  /**
   * [optional] 点击消息跳转的URL
   * @param messageUrl 
   */
  setMessageUrl(messageUrl: string) {
    this.messageUrl = messageUrl
    return this;
  }


  get() {
    return this.render({
      [this.msgtype]: {
        title: this.title,
        text: this.contentLines.join('\n'),
        picUrl: this.picUrl,
        messageUrl: this.messageUrl
      }
    })
  }
}