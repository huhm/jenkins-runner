import DingtalkMessage from "./DingtalkMessage";


type ILinkItem = {
  title: string,
  messageURL: string,
  picUrl?: string
}

/**
 * 类似订阅号消息
 * 需要调用的api:
 * addLink
 */
export default class DingtalkFeedCard extends DingtalkMessage {
  protected links: ILinkItem[] = []
  constructor() {
    super()
    this.msgtype = 'feedCard'
  }

  addLink(item: ILinkItem) {
    this.links.push(item)
  }

  get() {
    if (this.links.length === 0) {
      throw new Error('Dingtalk ActionCard has no link,use addLink')

    }
    return this.render({
      [this.msgtype]: {
        links: this.links
      }
    })
  }
}