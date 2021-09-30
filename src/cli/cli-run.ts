

import chalk from 'chalk';
import commander from 'commander';
import JenkinsClient from '../JenkinsClient';
import { addConfigOptionToCommand, addYOptionToCommand, getConfirmPromise, loadJenkinsJson } from './cli-utils';



export async function runJob(options: { config: string, runnerName: string, yes?: boolean }) {
  const { config, runnerName, yes } = options;
  const json = loadJenkinsJson(config);
  if (!json) {
    return false;
  }
  const client = new JenkinsClient(json.jenkinsConfig);
  const runnerSchema = client.getRunnerSchemaItem(json, runnerName);
  if (!runnerSchema) {
    return false;
  }
  console.log(chalk.blue('use runner:'), runnerSchema.runnerName, runnerSchema.runnerDisplayName);
  if (!yes) {
    const isConfirm = await getConfirmPromise(`确认开始执行${runnerSchema.runnerDisplayName || runnerSchema.runnerName}吗？`);
    if (!isConfirm) {
      return true;
    }
  }
  const result = await client.runSchema(runnerSchema, json.dingtalkList)
  return result;
}

export default function registerRun() {

  // run job
  const command = commander.program.command('run')
    .argument('<runnerName>', 'the runner name if not given will use the first runner in config')
    .usage('<runnerName> [options]')
    .description('run jenkins job');
  addConfigOptionToCommand(command);
  addYOptionToCommand(command);
  command.action(async (runnerName, options) => {
    const { config, yes } = options;
    const isOk = await runJob({ config, runnerName, yes })

    if (isOk === true) {
      process.exit(0)
    } else {
      process.exit(1)
    }
  })
}