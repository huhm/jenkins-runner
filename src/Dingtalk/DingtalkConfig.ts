export const DingTalkConfig = {
  maxLength: 20000,//20000bytes

  /**
   * period毫秒内，最多发送max条消息
   */
  frequency: {
    // 每个机器人每分钟最多发送20条消息到群里，如果超过20条，会限流10分钟。
    period: 60 * 1000,

    maxCount: 20,
    errcode: 130101,

    //出现限流的delayTime
    delayTime: 60 * 1000
  }
}