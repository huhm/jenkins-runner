
import chalk from 'chalk';
import commander from 'commander';
import path from 'path';
import type { IJenkinsRunnerConfig } from '../interface';
export const DEFAULT_JENKINS_CONFIG_FILENAME = `jenkins_runner.config.js`

function requireJson<T>(path: string) {
  try {

    let jsonRaw = require(path) as (T | { default: T });

    if (!jsonRaw) {
      return jsonRaw;
    }
    if ((jsonRaw as { default: T }).default) {
      return (jsonRaw as { default: T }).default as T
    }
    return jsonRaw as T
  } catch (ex) {
    return false;
  }
}
/**
 * 加载jenkins Json
 * @param config 
 * @returns 
 */
export function loadJenkinsJson(config: string, _showHint = true) {
  const configPath = path.join(process.cwd(), config)
  console.log(chalk.blue("use config:", configPath));

  let json = requireJson<IJenkinsRunnerConfig>(configPath);

  if (!json) {
    console.warn(chalk.red("no config file finded"));
    if (_showHint) {
      console.log(chalk.yellow('you should init you json file'), chalk.blue("jenkins-runner init"))
    }
    return;
  }
  return json
}

export function addConfigOptionToCommand(cmd: commander.Command) {
  cmd.requiredOption('-c, --config <configPath>', 'config js path,you can use init to creat default config', DEFAULT_JENKINS_CONFIG_FILENAME)
  return cmd
}