import { DingTalkConfig } from './DingtalkConfig';
import DingTalkMessage from './DingtalkMessage';
import DingTalkRobot from './DingtalkRobot';


// 按DingtalkConfig做限制


export default class DingtalkRobotWithRestrict extends DingTalkRobot {
  /**
   * 最近发送消息的时间
   * dt[] 从大到小
   */
  recentOkList: number[] = []

  /**
   * 待发送列表，按时间先后顺序
   */
  msgToSend: { md: DingTalkMessage, insertTime: number }[] = []

  private canSend(dtNow: number) {
    if (this.recentOkList.length >= DingTalkConfig.frequency.maxCount) {
      // 判断频率是否超过了,判断倒数第maxCount条
      if (dtNow - this.recentOkList[DingTalkConfig.frequency.maxCount - 1] < DingTalkConfig.frequency.period) {
        return false;
      }
    }
    // 判断最近一次send是否被限流？
    return true;
  }


  lastRestrictTime: number = 0;

  nextSendTimer?: NodeJS.Timer;
  async startNextSend() {
    if (this.nextSendTimer) {
      clearTimeout(this.nextSendTimer)
    }
    const dtNow = new Date().getTime();

    const recentPeriodDt = this.recentOkList[DingTalkConfig.frequency.maxCount - 1];
    let defaultDelayTime = DingTalkConfig.frequency.period / DingTalkConfig.frequency.maxCount;
    let delayTime = recentPeriodDt ? DingTalkConfig.frequency.period - (dtNow - recentPeriodDt) : defaultDelayTime;

    if (this.lastRestrictTime) {
      delayTime = Math.max(DingTalkConfig.frequency.delayTime - (dtNow - this.lastRestrictTime), delayTime)
    }
    this.nextSendTimer = setTimeout(() => {
      // 按后进先出的顺序
      const lastItem = this.msgToSend.pop();
      if (lastItem) {
        this.send(lastItem.md);// 重新发送
      }
    }, delayTime);
  }

  async send(message: DingTalkMessage) {
    const dtNow = new Date().getTime();
    if (this.canSend(dtNow)) {
      //可以发
      this.recentOkList.splice(0, 0, dtNow);//新增
      if (this.recentOkList.length > DingTalkConfig.frequency.maxCount * 2) {
        this.recentOkList.splice(DingTalkConfig.frequency.maxCount);//删除多余的
      }
      const body = message.get();
      const res = await this.request(body);
      if (res.errcode === DingTalkConfig.frequency.errcode) {
        //130101 send too fast, exceed 20 times per minute
        //被限流了
        this.lastRestrictTime = dtNow;
        this.msgToSend.push({
          md: message,
          insertTime: dtNow
        })
        this.startNextSend();
      } else if (res.errcode === 0) {
        this.lastRestrictTime = 0;
      }
      return res;
    } else {
      //不能发
      this.msgToSend.push({
        md: message,
        insertTime: dtNow
      });
      this.startNextSend();
      // 增加setTimeout
      return {
        errcode: -2,
        errmsg: `To Frequency,will retry at next time`
      }
    }
  }
}