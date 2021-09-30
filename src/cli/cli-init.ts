
import chalk from 'chalk';
import commander from 'commander';
import fs from 'fs';
import path from 'path';
import { DEFAULT_JENKINS_CONFIG_FILENAME } from './cli-utils';
const PRIVATE_CONFIG_FILENAME = 'local.private.config.js'

// init config file
export default function registerInit() {
  commander.program.command('init')
    .usage('[options]')
    .description("init the jenkins runner configs")
    .option('-d --dir <dirName>', 'the config directory path, defalut is ./')
    .action((options) => {
      const { dir = './' } = options
      const configsPath = path.join(process.cwd(), dir)
      if (!fs.existsSync(configsPath)) {
        fs.mkdirSync(configsPath, { recursive: true })
      }

      tryAddConfigFile();
      tryAddPrivateConfigFile();
      tryAddConfigFilesToIgnorePath(PRIVATE_CONFIG_FILENAME)


      function tryAddConfigFile() {
        const templateFilePath = path.join(__dirname, `../template/template-config.js`)
        return tryAddTemplateFile(configsPath, DEFAULT_JENKINS_CONFIG_FILENAME, templateFilePath)
      }
      function tryAddPrivateConfigFile() {
        const templateFilePath = path.join(__dirname, `../template/template-private.js`)
        return tryAddTemplateFile(configsPath, PRIVATE_CONFIG_FILENAME, templateFilePath);
      }
      function tryAddTemplateFile(configsPath: string, fileName: string, templateFilePath: string) {
        const destFilePath = path.join(configsPath, fileName);

        if (fs.existsSync(destFilePath)) {
          console.error(chalk.blue("[init] add file ignore"), `${PRIVATE_CONFIG_FILENAME} has existed: ${destFilePath}`)
          return false;
        }
        const str = fs.readFileSync(templateFilePath, {
          encoding: 'utf-8'
        })
        fs.writeFileSync(destFilePath, str, {
          encoding: 'utf-8'
        })
        console.log(chalk.green('[init] add file ok'), `${PRIVATE_CONFIG_FILENAME} file has been created: ${destFilePath}`)
        return true;
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

}