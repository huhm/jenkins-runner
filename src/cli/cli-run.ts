

import chalk from 'chalk';
import commander from 'commander';
import JenkinsClient from '../JenkinsClient';
import { addConfigOptionToCommand, loadJenkinsJson } from './cli-utils';



export async function runJob(options: { config: string, runnerName: string }) {
  const { config, runnerName } = options;
  const json = loadJenkinsJson(config);
  if (!json) {
    process.exit(1)
  }
  const client = new JenkinsClient(json.jenkinsConfig);
  const runnerSchema = client.getRunnerSchemaItem(json, runnerName);
  if (runnerSchema) {
    console.log(chalk.blue('use runner:'), runnerSchema.runnerName, runnerSchema.runnerDisplayName);
    const result = await client.runSchema(runnerSchema, json.dingtalkList)
    return result;
  }
}

export default function registerRun() {

  // run job
  const runJobCommand = commander.program.command('run')
    .argument('<runnerName>', 'the runner name if not given will use the first runner in config')
    .usage('<runnerName> [options]')
    .description('run jenkins job');
  addConfigOptionToCommand(runJobCommand)
    .action(async (runnerName, options) => {
      const { config } = options;
      const isOk = await runJob({ config, runnerName })

      if (isOk === true) {
        process.exit(0)
      } else {
        process.exit(1)
      }
    })
}