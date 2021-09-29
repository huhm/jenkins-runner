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

const DEFAULT_JENKINS_CONFIG_FILENAME = `jenkins_runner.config.js`

const PRIVATE_CONFIG_FILENAME = 'local.private.config.js'
// run job
commander.program
  .usage('[options]')
  .description('run jenkins job')
  .requiredOption('-c --config <configPath>', 'config js path,you can use init to creat default config', DEFAULT_JENKINS_CONFIG_FILENAME)
  .option('-r --runnerName <runnerName>', 'the runner name if not given will use the first runner in config')
  .option('-i, --info', 'get the jenkins info')
  .action(async (options) => {
    const { config, runnerName, info } = options;
    const configPath = path.join(process.cwd(), config)
    console.log(chalk.blue("use config:", configPath))
    let jsonRaw = require(configPath) as (IJenkinsRunnerConfig | { default: IJenkinsRunnerConfig });
    let json = jsonRaw as IJenkinsRunnerConfig;

    if (!json) {
      console.warn(chalk.red("no config finded"));
      return;
    }
    if ((jsonRaw as { default: IJenkinsRunnerConfig }).default) {
      json = (jsonRaw as { default: IJenkinsRunnerConfig }).default
    }

    const client = new JenkinsClient(json.jenkinsConfig);

    if (info) {
      client.info()
      return;
    }



    const runnerSchema = client.getRunnerSchemaItem(json, runnerName);
    if (runnerSchema) {
      console.log(chalk.blue('use runner:'), runnerSchema.runnerName, runnerSchema.runnerDisplayName);
      client.runSchema(runnerSchema, json.dingtalkList)
    }
  })

// init config file
commander.program.command('init')
  .usage('init [options]')
  .description("init the jenkins runner configs")
  .option('-d --dir <dirName>', 'the config directory path, defalut is ./')
  .action((options) => {
    const { dir = './' } = options
    const configsPath = path.join(process.cwd(), dir)
    const destFilePath = path.join(configsPath, DEFAULT_JENKINS_CONFIG_FILENAME);
    if (!fs.existsSync(configsPath)) {
      fs.mkdirSync(configsPath, { recursive: true })
    }
    if (tryAddConfigFile(destFilePath)) {
      console.log(chalk.green('[init] ok'), `config file has been created: ${destFilePath}`)
      const privateConfigDestPath = path.join(configsPath, PRIVATE_CONFIG_FILENAME)
      tryAddPrivateConfigFile(privateConfigDestPath);
      tryAddConfigFilesToIgnorePath(PRIVATE_CONFIG_FILENAME)
    } else {
      console.error(chalk.red("[init] fail"), `File has existed: ${destFilePath}`)
    }

    function tryAddConfigFile(destFilePath: string) {
      if (fs.existsSync(destFilePath)) {
        return false;
      }
      const srcFilePath = path.join(__dirname, `../template/template-config.js`)
      const str = fs.readFileSync(srcFilePath, {
        encoding: 'utf-8'
      })
      fs.writeFileSync(destFilePath, str, {
        encoding: 'utf-8'
      })
      return true;
    }

    function tryAddPrivateConfigFile(destFilePath2: string) {
      if (!fs.existsSync(destFilePath2)) {
        const templatePath = path.join(__dirname, `../template/template-private.js`)
        const str2 = fs.readFileSync(templatePath, {
          encoding: 'utf-8'
        })
        fs.writeFileSync(destFilePath2, str2, {
          encoding: 'utf-8'
        })
        console.log(chalk.green('[init] ok'), `${PRIVATE_CONFIG_FILENAME} has been created: ${destFilePath2}`)
      } else {
        console.log(chalk.blue('ignore'), `file has exist: ${destFilePath}`)
      }
    }



    function tryAddConfigFilesToIgnorePath(ignoreItem: string) {
      const gitIgnorePath = path.join(process.cwd(), '.gitignore');
      console.log(chalk.blue('Check gitignore'), `checking gitignore file`)
      if (fs.existsSync(gitIgnorePath)) {
        const gitIgnoreContent = fs.readFileSync(gitIgnorePath);
        let toContent: string;
        if (gitIgnoreContent.indexOf(ignoreItem) === -1) {
          console.log(chalk.green('Start edit .gitignore'))
          // 已经存在
          toContent = gitIgnoreContent + '\r\n' + ignoreItem;
          fs.writeFileSync(gitIgnorePath, toContent)
          console.log(chalk.green('Edited gitignore'), ` add ${ignoreItem}`)
        } else {
          console.log(`ignore edit gitignore, has add ${ignoreItem}`)
        }

      } else {
        console.log(chalk.yellow('Notice'), `You'd better add the file '${ignoreItem}' to .gitignore file`)
      }
    }

  })

commander.program
  .version(pkg.version)
  .description(chalk.blue('a simple jenkins runner cli'));
console.log();
commander.program.parse(process.argv);