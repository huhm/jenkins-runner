import chalk from 'chalk';
import createJenkinsApi from "jenkins";
import { JenkinsJobClient } from '.';
import DingtalkMarkdown from './Dingtalk/DingtalkMarkdown';
import DingTalkRobots from './Dingtalk/DingtalkRobots';
import { IDingtalkConfigItem, IGitLogConfig, IJenkinsConConfig, IJenkinsRunnerConfig, IRunnerJobItem, IRunnerSchema } from './interface';
import { formatSimpleDate, humanizeDuration } from './utils';

export enum JenkinsLogLevel {
  None = 0,
  Brief = 1,
  Detail = 2
}
export default class JenkinsClient {

  private _config: IJenkinsConConfig;
  private _client: createJenkinsApi.JenkinsPromisifiedAPI;

  constructor(config: IJenkinsConConfig) {
    this._config = config;
    const url = `${config.schema}://${config.user}:${config.password}@${config.host}`
    this._client = createJenkinsApi({
      baseUrl: url,
      crumbIssuer: config.crumbIssuer ?? true,
      promisify: true
    })
  }
  get apiClient() {
    return this._client;
  }
  get config() {
    return this._config
  }

  /**
   * 判断配置是否正确
   */
  async checkConfig() {
    // eslint-disable-next-line no-console
    // (this._client as any).on('log', console.log);
    const info = await this.apiClient.info();
    // eslint-disable-next-line no-console
    this.log([chalk.green('[Check]-OK'), info.nodeDescription, info.numExecutors, 'jobCount', info.jobs.length], ['info', info])
    return true;
  }

  //#region log
  private logLevel: JenkinsLogLevel = JenkinsLogLevel.Brief;
  setLogLevel(logLevel: JenkinsLogLevel) {
    this.logLevel = logLevel
  }

  private _record(type: 'log' | 'error' | 'warn', briefArgs: any[] | null, detailArgs?: any[]) {
    if (this.logLevel === JenkinsLogLevel.None) {
      return;
    }
    // eslint-disable-next-line no-console
    const consoleFunc = console[type]
    if (this.logLevel === JenkinsLogLevel.Brief) {
      if (!briefArgs || briefArgs.length === 0) {
        return;
      }
      // eslint-disable-next-line no-console
      consoleFunc.apply(console, briefArgs)
    } else {
      const args = (briefArgs || []).concat(detailArgs || [])
      if (args.length === 0) {
        return;
      }
      // eslint-disable-next-line no-console
      consoleFunc.apply(console, args)
    }
  }

  warn(briefArgs: any[] | null, detailArgs?: any[]) {
    this._record('warn', briefArgs, detailArgs)
  }
  log(briefArgs: any[] | null, detailArgs?: any[]) {
    this._record('log', briefArgs, detailArgs)
  }
  error(briefArgs: any[] | null, detailArgs?: any[]) {
    this._record('error', briefArgs, detailArgs)
  }
  //#endregion


  createJobClient(jobName: string) {
    return new JenkinsJobClient(this, jobName)
  }


  async info() {
    try {
      const info = await this.apiClient.info();
      this.log([chalk.blue('info'), info])
      return info;
    } catch (ex) {
      this.error([chalk.red('info -error'), (ex as Error)?.message], [ex])
    }
  }

  getRunnerSchemaItem(jenkinsRunnerConfig: IJenkinsRunnerConfig, runnerName?: string) {
    let runnerSchema = jenkinsRunnerConfig.runnerSchemas[0];
    if (!runnerName) {
      return runnerSchema;
    }
    for (let i = 0; i < jenkinsRunnerConfig.runnerSchemas.length; i++) {
      runnerSchema = jenkinsRunnerConfig.runnerSchemas[i];
      if (runnerSchema.runnerName === runnerName) {
        return runnerSchema;
      }
    }
    console.warn(chalk.yellow(`no runner was find`), runnerName)
    return null;
  }

  async runSchema(runnerSchema: IRunnerSchema | undefined, dingtalkList: IDingtalkConfigItem[], gitLogConfig?: IGitLogConfig) {
    if (!runnerSchema) {
      return;
    }
    let jobItemIdx = 0;
    let jobItem: IRunnerJobItem;
    let isFail = false;
    const md = new DingtalkMarkdown();
    const title = runnerSchema.runnerDisplayName || runnerSchema.runnerName;
    const startDt = new Date().getTime();
    let okCount = 0;
    while (jobItem = runnerSchema.jobList[jobItemIdx]) {
      const jobIdxLabel = `${jobItemIdx + 1}/${runnerSchema.jobList.length}`
      this.log([`----[${jobIdxLabel}]--JobStart:${jobItem.jobName}-----`]);
      const jobClient = this.createJobClient(jobItem.jobName);
      const { timeout = runnerSchema.timeout, checkInterval = runnerSchema.checkInterval } = jobItem;
      const jobResult = await jobClient.startRunnerJob(jobItem.parameters, {
        timeout,
        checkInterval
      });

      jobClient.createJobMarkdown(jobResult, md, {
        title: `(${jobIdxLabel}) ${jobItem.jobDisplayName || jobItem.jobName}`,
        gitLogConfig: jobItem.gitLogConfig || gitLogConfig
      })
      if (jobResult.isStageSuccess) {
        this.log([chalk.green('[JobRunner-OK]'), jobIdxLabel, jobItem.jobName])
        okCount++;
      } else {
        isFail = true;
        // 失败
        this.log([chalk.green(`[JobRunner-Fail]`), jobIdxLabel, jobItem.jobName, chalk.blue(jobResult.stage), chalk.red(jobResult.status), jobResult.error?.name], [jobResult.error]);
        break;
      }
      jobItemIdx++;
    }
    let doSendReminder = true;
    if (isFail) {
      md.prepend(`## [打叉] ${title}`)
      if (runnerSchema.onlyRemindOk) {
        doSendReminder = false
      }
      md.setTitle(`Fail - ${title}`)
    } else {
      this.log([chalk.green('[ALLJobRunner-OK]')])
      md.prepend(`## [对勾] ${title}`)
      md.setTitle(`OK - ${title}`)
    }
    if (runnerSchema.jobList.length > 1) {
      md.append("### Summary");
      md.append("");
      md.append(`> StartAt:${formatSimpleDate(startDt)} Elapsed:${humanizeDuration(new Date().getTime() - startDt)}ms`);
      md.append("");
      md.append(`> Status:${okCount}/${runnerSchema.jobList.length} - ${isFail ? "Fail" : 'OK'}`);
    }
    if (runnerSchema.reminderSuffix) {
      md.append("");
      md.append(runnerSchema.reminderSuffix)
    }
    if (doSendReminder && dingtalkList && dingtalkList.length > 0) {

      const dingtalkRobots = new DingTalkRobots(dingtalkList);
      await dingtalkRobots.send(md);

    }


    return !isFail;
  }
}