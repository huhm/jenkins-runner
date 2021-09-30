import chalk from 'chalk';
import commander from 'commander';
import { DingTalkRobots, DingtalkText } from '..';
import { addConfigOptionToCommand, loadJenkinsJson } from './cli-utils';
export default function registerDing() {
  // run job
  const command = commander.program.command('ding')
    .usage('[options]')
    .description('send dingtalk info')
    .requiredOption('-t, --text <text>', 'the message to send to dingtalk')
  addConfigOptionToCommand(command)
    .action(async (options) => {
      const { config, text } = options;
      const json = loadJenkinsJson(config);
      if (!json) {
        process.exit(1)
      }
      const md = new DingtalkText();
      md.setContent(text);

      const dingtalkList = json.dingtalkList;
      if (dingtalkList.length == 0) {
        console.warn('no dingtalkList finded in configfile');
        process.exit(1)
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