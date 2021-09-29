export default abstract class DingtalkMessage {
  isAtAll: boolean
  atMobiles: Set<string>
  atDingtalkIds: Set<string>
  msgtype: 'markdown' | 'text' | 'link' = 'text'

  constructor() {
    this.isAtAll = false
    this.atMobiles = new Set()
    this.atDingtalkIds = new Set()
  }

  protected render(options: unknown) {
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

  abstract prepend(text: string | string[]): void;
  abstract append(text: string | string[]): void;

  get() {
    return this.render({});
  }

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