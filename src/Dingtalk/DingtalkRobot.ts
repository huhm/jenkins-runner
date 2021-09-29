import axios from 'axios';
import chalk from 'chalk';
import CryptoJs from 'crypto-js';
import { IDingtalkConfigItem, IDingtalkConfigItemAccessToken, IDingtalkConfigItemWebhook } from '../interface';
import DingTalkMessage from './DingtalkMessage';

export default class DingTalkRobot {
  private option: IDingtalkConfigItemWebhook
  constructor(option: IDingtalkConfigItem) {
    let webhook = 'https://oapi.dingtalk.com/robot/send';
    if ((option as IDingtalkConfigItemWebhook).webhook) {
      webhook = (option as IDingtalkConfigItemWebhook).webhook;
    } else {
      const accessToken = (option as IDingtalkConfigItemAccessToken).accessToken;
      if (!accessToken) {
        throw new Error('webhook or accessToken is required!')
      }
      webhook += '?access_token=' + accessToken
    }
    if (!option.secret) {
      console.warn(chalk.yellow('secret is required'))
    }
    this.option = {
      secret: option.secret,
      webhook
    }
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
  async request(body: unknown) {
    try {
      const timestamp = new Date().getTime();
      const sign = this.getSign(timestamp);
      const result = await axios.post(this.option.webhook, body, {
        params: {
          timestamp,
          sign,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (result.data.errcode === 310000) {
        console.error('Send Failed:', result.data);
      }
      return result;
    }
    catch (error) {
      if ((error as any).toJSON) {
        console.error((error as any).toJSON());
      }
      else {
        console.error(error);
      }
    }
  }
  async send(message: DingTalkMessage) {
    const body = message.get();
    return this.request(body);
  }
}