import chalk from 'chalk';
import commander, { Option } from 'commander';
import fs from 'fs';
import { DingTalkRobots, DingtalkText } from '..';
import DingtalkLink from '../Dingtalk/DingtalkLink';
import DingtalkMarkdown from '../Dingtalk/DingtalkMarkdown';
import { addConfigOptionToCommand, addYOptionToCommand, getConfirmPromise, loadJenkinsJson } from './cli-utils';

function createMsgByFormat(format: string) {
  switch (format) {
    case 'link':
      return new DingtalkLink()
    // case 'action':
    //   return new DingtalkActionCard()
    // case 'feed':
    //   return new DingtalkFeedCard()
    case 'text':
      return new DingtalkText()
    case 'markdown':
    default:
      return new DingtalkMarkdown()
  }
}

export default function registerDing() {
  // run job
  const command = commander.program.command('ding')
    .usage('[options]')
    .description('send dingtalk info')
  // .requiredOption('-t, --text <text>', 'the message to send to dingtalk（消息发送内容)');
  command.addOption(new Option('-t, --text <text>', 'the message to send to dingtalk（消息发送内容)'));
  command.addOption(new Option('-p, --path <contentPath>', '消息内容文件地址（如果text也存在，则两个合并）'))

  // .option('-f, --textPath', '发送消息地址')

  command.addOption(new Option('-f, --format <format>', '消息格式').default('markdown').choices(['text', 'markdown', 'link',]))//'action', 'feed'
  command.addOption(new Option('--picUrl <picUrl>', 'picUrl for link format'))
  command.addOption(new Option('--messageUrl <messageUrl>', 'messageUrl for link format'))
  command.addOption(new Option('--title <title>', 'title for markdown format (if not setted,will use text)'))
  addConfigOptionToCommand(command);
  addYOptionToCommand(command);
  command.action(async (options) => {
    const { config, text, yes, format, path, messageUrl, picUrl, title } = options;
    const json = loadJenkinsJson(config);
    if (!json) {
      process.exit(1)
    }
    const dingtalkList = json.dingtalkList;
    if (dingtalkList.length == 0) {
      console.warn('no dingtalkList finded in configfile');
      process.exit(1)
    }
    console.log(`即将发送消息给${chalk.grey(dingtalkList.length)}个dingTalk,消息格式: ${chalk.grey(format)},title: ${chalk.grey(title || '')}`);
    const md = createMsgByFormat(format);
    if (text) {
      md.setContent(text);
    }
    if (format === 'link') {
      const linkMd = md as DingtalkLink
      if (picUrl) {
        linkMd.setPicUrl(picUrl)
        console.log('picUrl', chalk.grey(picUrl))
      }
      if (messageUrl) {
        linkMd.setMessageUrl(messageUrl)
        console.log('messageUrl', chalk.grey(messageUrl))
      }
    }

    if (title) {
      md.setTitle(title)
    } else {
      md.setTitle(text)
    }
    if (path) {
      const cPath = path.join(process.cwd(), path);
      if (!fs.existsSync(cPath)) {
        console.warn('the content file is not exists', cPath)
        process.exit(1)
      }
      let extraContent = fs.readFileSync(cPath, { encoding: 'utf-8' })
      md.append(extraContent)
    }
    console.log('content', chalk.grey(md.content));
    if (!yes) {
      const isConfirm = await getConfirmPromise("确认发送吗？");
      if (!isConfirm) {
        process.exit(0)
      }
    }
    const dingtalkRobots = new DingTalkRobots(dingtalkList);
    const result = await dingtalkRobots.send(md);
    if (result.failCount === 0) {
      console.warn(chalk.green('Dingtalk send ok', 'msg:', text))
      process.exit(0)
    } else {
      process.exit(1)
    }
  })
}