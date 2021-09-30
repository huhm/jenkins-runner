
import commander from 'commander';
import JenkinsClient from '..';
import { addConfigOptionToCommand, loadJenkinsJson } from './cli-utils';

export function runInfo(options: { config: string }) {
  const { config } = options;
  const json = loadJenkinsJson(config);
  if (!json) {
    process.exit(1)
  }
  const client = new JenkinsClient(json.jenkinsConfig);
  const info = client.info()
  if (!info) {
    process.exit(1)
  }
  return;
}
export default function registerRun() {
  const command = commander.program.command('info')
    .usage('[options]')
    .description('get jenkins info');
  addConfigOptionToCommand(command)
    .action(async (options) => {
      runInfo(options)
    })
}