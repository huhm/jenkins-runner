import chalk from "chalk";
import { IDingtalkConfigItem } from "../interface";
import DingTalkMessage from './DingtalkMessage';
import DingTalkRobot from './DingtalkRobot';

/**
 * 批量发送消息
 */
export default class DingTalkRobots {
  private robots: DingTalkRobot[];
  constructor(options: IDingtalkConfigItem[]) {
    this.robots = options.map((item, idx) => {
      return new DingTalkRobot({
        label: `Robot-${idx + 1}`,
        ...item
      })
    })
  }
  async request(body: Object) {
    const promiseList = this.robots.map(async (robot) => {
      return await robot.request(body);
    });
    const resultList = await Promise.all(promiseList);
    const result = {
      okCount: 0,
      failCount: 0,
      resultList,
      okList: [] as typeof resultList,
      failList: [] as typeof resultList
    }

    resultList.map(item => {
      if (item.errcode === 0) {
        result.okCount++;
        result.okList.push(item)
      } else {
        result.failCount++;
        result.failList.push(item)
      }
    })
    console.log(`[Dingtalk] Reminds finished, compelete`,
      'ok',
      chalk.green(`${result.okCount}/${result.okCount + result.failCount}`),
      'fail',
      chalk.red(`${result.failCount}/${result.okCount + result.failCount}`)
    )
    return result;
  }
  async send(message: DingTalkMessage) {
    const body = message.get();
    return this.request(body);
  }
}