import DingtalkMessage from "./DingtalkMessage";

export default class DingtalkMarkdown extends DingtalkMessage {
  title?: string;
  items: string[]
  constructor() {
    super()
    this.msgtype = 'markdown'
    this.items = []
  }

  setTitle(title: string) {
    this.title = title
    return this
  }


  prepend(text: string | string[]) {
    if (Array.isArray(text)) {
      this.items.splice(0, 0, ...text)
    } else {
      this.items.splice(0, 0, text)
    }
    return this
  }
  append(text: string | string[]) {
    if (Array.isArray(text)) {
      this.items = this.items.concat(text)
    } else {
      this.items.push(text)
    }
    return this
  }

  get(_extraOption?: any) {
    return this.render({
      markdown: {
        title: this.title,
        text: this.items.join('\n'),
      },
      ...((_extraOption || {}))
    })
  }
}