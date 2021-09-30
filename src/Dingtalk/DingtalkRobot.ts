import axios, { AxiosError } from 'axios';
import chalk from 'chalk';
import CryptoJs from 'crypto-js';
import { IDingtalkConfigItem, IDingtalkConfigItemAccessToken, IDingtalkConfigItemWebhook } from '../interface';
import DingTalkMessage from './DingtalkMessage';
type IDingtalkRequestResult = {
  /**
   * 为0时，表示成功
   * @example 310000  keywords not in content
   * @example 310000  invalid timestamp
   * @example 310000  sign not match
   * @example 310000  ip X.X.X.X not in whitelist
   * @example -1
   */
  errcode: number,
  errmsg: string
}


export default class DingTalkRobot {
  private option: IDingtalkConfigItemWebhook
  constructor(option: IDingtalkConfigItem) {
    let webhook = (option as IDingtalkConfigItemWebhook).webhook;
    if (!webhook) {
      const accessToken = (option as IDingtalkConfigItemAccessToken).accessToken;
      if (!accessToken) {
        throw new Error('webhook or accessToken is required!')
      }
      webhook = 'https://oapi.dingtalk.com/robot/send?access_token=' + accessToken
    }
    if (!option.secret) {
      console.warn(chalk.yellow('secret is not provided,please gurantee your content containes keywords'))
    }
    this.option = {
      label: option.label,
      secret: option.secret,
      webhook
    }
  }

  private get _coloredLabel() {
    return chalk.grey(this.option.label || 'unknown')
  }

  private getSign(timeStamp: number) {
    const secret = this.option.secret
    if (secret) {
      const strToSign = `${timeStamp}\n${secret}`;
      const sign = CryptoJs.HmacSHA256(strToSign, secret);
      return CryptoJs.enc.Base64.stringify(sign);
    }
    return ''
  }

  /**
   * 发送消息
   * @param 自定义消息，可以由 DingTalkMessage.proptotype.get 生成
   */
  async request(body: Object) {
    try {
      const timestamp = new Date().getTime();
      const sign = this.getSign(timestamp);
      const result = await axios.post<IDingtalkRequestResult>(this.option.webhook, body, {
        params: {
          timestamp,
          sign,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (result.data.errcode) {
        console.error(this._coloredLabel, chalk.red('[Dingtalk] Remind Fail'), result.data.errcode, result.data.errmsg);
      } else {
        console.log(this._coloredLabel, chalk.green('[Dingtalk] Remind ok'),);
      }
      return result.data;
    }
    catch (error) {
      let err = error as AxiosError<IDingtalkRequestResult>
      const response = err.response;
      let result: IDingtalkRequestResult;
      if (response) {
        result = {
          errcode: -1,
          errmsg: `NetworkError:${response.status || ''}${response.statusText || ''}`
        }
      } else {
        result = {
          errcode: -1,
          errmsg: `NetworkError:${err.message}`
        }
      }
      console.error(this._coloredLabel, chalk.red('[Dingtalk] Network Error'), result.errcode, result.errmsg);
      return result
    }
  }
  async send(message: DingTalkMessage) {
    const body = message.get();
    return this.request(body);
  }
}