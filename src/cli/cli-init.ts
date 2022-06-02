
import chalk from 'chalk';
import commander from 'commander';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import type { IJenkinsConConfig } from '../interface';
import { DEFAULT_JENKINS_CONFIG_FILENAME, getConfirmPromise, getInputPromise } from './cli_utils';
const PRIVATE_CONFIG_FILENAME = '../local.private.config.js'

const EnvironmentParamsList=[{
  key:'user',
  name:'J_RUNNER_USER',
  title:'username',
  required:true
},{
  key:'password',
  name:"J_RUNNER_PWD",
  title:'password',
  required:true
},{
  key:'apiToken',
  name:"J_RUNNER_APITOKEN",
  title:'apiToken'
}]

async function initTheJenkinsParams(){
  const config: Partial<IJenkinsConConfig>={};
  for(let i=0;i<EnvironmentParamsList.length;){
    const item=EnvironmentParamsList[i];
    let text=await getInputPromise(`Input Your jenkins ${item.title}(${item.name})`);
    if(text){
      text=text.trim()
    }
    if(!text){
      continue;
    }
    (config as any)[item.key]=text;
    i++
  }
  return config
}
function isEnvironmentParamsReady(){
  for(let i=0;i<EnvironmentParamsList.length;i++){
    const item=EnvironmentParamsList[i];
    if(item.required &&  !process.env[item.name]){
      return false;
    }
  }
  return true;
}
// init config file
export default function registerInit() {
  commander.program.command('init')
    .usage('[options]')
    .description("init the jenkins runner configs")
    .option('-d --dir <dirName>', 'the config directory path, defalut is ./')
    .action(async (options) => {
      const { dir = './' } = options
      const configsPath = path.join(process.cwd(), dir)
      if (!fs.existsSync(configsPath)) {
        fs.mkdirSync(configsPath, { recursive: true })
      }

      tryAddConfigFile();
      if(isEnvironmentParamsReady()){
        console.log('Jenkins Private config is ready in environment params');
        return;
      }
      const method=await inquirer.prompt([{
        type:'list',
        message:"Choose a method for read privite config(jenkins username and password)",
        name:"method",
        choices:[
          "set environment variable(Prefer)",
          "local private config file",
        ],
        filter(val){
          return (val||'').toLowerCase();
        }
      }])
      if(method.indexOf('environment')>-1){
        console.error(chalk.grey( 'Set Your System Enviromenet variables:'))
        EnvironmentParamsList.forEach((item,idx)=>{
          const isExisted=process.env[item.name]
          console.log(chalk.blue(`${idx+1} ${item.name}={Your jenkins ${item.title}}`,isExisted?chalk.green('(Already Existed)'):chalk.red('(Not Existed)')))
        })
      }else{
        const needCreate=await getConfirmPromise("Create a private config file?");
        if(needCreate){
          
          const config  = await initTheJenkinsParams()
          tryAddPrivateConfigFile(config);
        }
      }
      function tryAddConfigFile() {
        const templateFilePath = path.join(__dirname, `../../template/template-config.js`)
        return tryAddTemplateFile(configsPath, DEFAULT_JENKINS_CONFIG_FILENAME, templateFilePath)
      }
      function tryAddPrivateConfigFile(config:Partial<IJenkinsConConfig>) {
        // const templateFilePath = path.join(__dirname, `../../template/template-private.js`)
        const fileContent=`module.exports = ${JSON.stringify({
          jenkinsConfig:config
        },null,2)};`
        return tryAddTemplateFile(configsPath, PRIVATE_CONFIG_FILENAME, null,fileContent);
      }
      function tryAddTemplateFile(configsPath: string, fileName: string, templateFilePath: string|null,fileContent?:string) {
        const destFilePath = path.join(configsPath, fileName);

        if (fs.existsSync(destFilePath)) {
          console.error(chalk.blue("[init] add file ignore"), `${PRIVATE_CONFIG_FILENAME} has existed: ${destFilePath}`)
          return false;
        }
        let str=fileContent||''
        if(templateFilePath){
          str = fs.readFileSync(templateFilePath, {
            encoding: 'utf-8'
          })
        }
        fs.writeFileSync(destFilePath, str, {
          encoding: 'utf-8'
        })
        console.log(chalk.green('[init] add file ok'), `${PRIVATE_CONFIG_FILENAME} file has been created: ${destFilePath}`)
        return true;
      }
      // function tryAddConfigFilesToIgnorePath(ignoreItem: string) {
      //   const gitIgnorePath = path.join(process.cwd(), '.gitignore');
      //   console.log(chalk.blue('Check gitignore'), `checking gitignore file`)
      //   if (fs.existsSync(gitIgnorePath)) {
      //     const gitIgnoreContent = fs.readFileSync(gitIgnorePath);
      //     let toContent: string;
      //     if (gitIgnoreContent.indexOf(ignoreItem) === -1) {
      //       console.log(chalk.green('Start edit .gitignore'))
      //       // 已经存在
      //       toContent = gitIgnoreContent + '\r\n' + ignoreItem;
      //       fs.writeFileSync(gitIgnorePath, toContent)
      //       console.log(chalk.green('Edited gitignore'), ` add ${ignoreItem}`)
      //     } else {
      //       console.log(`ignore edit gitignore, has add ${ignoreItem}`)
      //     }
      //   } else {
      //     console.log(chalk.yellow('Notice'), `You'd better add the file '${ignoreItem}' to .gitignore file`)
      //   }
      // }

    })

}