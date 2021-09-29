#!/usr/bin/env node

import chalk from 'chalk';
import commander from 'commander';
import fs from 'fs';
import path from 'path';
import { IJenkinsRunnerConfig } from './interface';
import JenkinsClient from './JenkinsClient';
const pkg = require('../package.json')

commander.program.storeOptionsAsProperties(false);
// (commander.program as any).passCommandToAction(true)
commander.program.version(pkg.version, '-v, --version')

const DEFAULT_JENKINS_CONFIG = `jenkens_runner.config.js`

// run job
commander.program
  .usage('[options]')
  .description('run jenkins job')
  .requiredOption('-c --config <configPath>', 'config js path,you can use init to creat default config', DEFAULT_JENKINS_CONFIG)
  .option('-r --runnerName', 'the runner name if not given will use the first runner in config')
  .action((options) => {
    const { config, runnerName } = options;
    const configPath = path.join(process.cwd(), config)
    console.log(chalk.blue("use config:", configPath))
    let jsonRaw = require(configPath) as (IJenkinsRunnerConfig | { default: IJenkinsRunnerConfig });
    let json = jsonRaw as IJenkinsRunnerConfig;
    if ((jsonRaw as { default: IJenkinsRunnerConfig }).default) {
      json = (jsonRaw as { default: IJenkinsRunnerConfig }).default
    }
    const client = new JenkinsClient(json.jenkinsConfig);
    const runnerSchema = client.getRunnerSchemaItem(json, runnerName);
    if (runnerSchema) {
      console.log(chalk.blue('use runner:'), runnerSchema.runnerName, runnerSchema.projectName);
      client.runSchema(runnerSchema, json.dingtalkList)
    }
  })


// init config file
commander.program.command('init')
  .usage('init [options]')
  .description("init the jenkins_runner.config.js")
  .action(() => {
    const destFilePath = path.join(process.cwd(), DEFAULT_JENKINS_CONFIG);
    if (fs.existsSync(destFilePath)) {
      console.error(chalk.red("[init] fail"), `File has existed: ${destFilePath}`)
    } else {
      const srcFilePath = path.join(__dirname, '../template/jenkins_runner.config.js')
      const str = fs.readFileSync(srcFilePath, {
        encoding: 'utf-8'
      })
      fs.writeFileSync(destFilePath, str, {
        encoding: 'utf-8'
      })
      console.log(chalk.green('[init] ok'), `config file has been created: ${destFilePath}`)
    }
  })

commander.program
  .version(pkg.version)
  .description(chalk.blue('a simple jenkins runner cli'));
console.log();
commander.program.parse(process.argv);