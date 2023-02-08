import chalk from "chalk";
import { DingtalkMarkdown } from ".";
import { IGitLogConfig, IJenkinsJobResult, IJenkinsQueueItemResult, IJenkinsRunnerCheckOption, IJenkinsRunnerResult } from './interface';
import JenkinsClient from "./JenkinsClient";
import { convertCheckOption, formatSimpleDate, humanizeDuration } from "./utils";


const STAGE_LABEL_MAP = {
  triggerBuild: 'StartJob',
  buildQueue: 'WaitBuild',
  build: 'Build'
}
type IStageCtxData = {
  stageTag: string,
  startTime: number,
  lastLogTime: number,
  logBrifInterval: number,
  timeout: number,
  checkInterval: number
}
export default class JenkinsJobClient {
  jobName: string;
  jkClient: JenkinsClient;

  get apiClient() {
    return this.jkClient.apiClient
  }
  constructor(jkClient: JenkinsClient, jobName: string) {
    this.jkClient = jkClient;
    this.jobName = jobName;
  }


  /**
   * 执行Job build
   * @param jobName
   * @param parameters
   * @returns queueNum
   */
  async triggerBuild(parameters: Record<string, string>) {
    const jobName = this.jobName;
    const stageName = STAGE_LABEL_MAP['triggerBuild']
    try {
      const queueNum = await this.apiClient.job.build({
        name: jobName,
        parameters: parameters,
        token: this.jkClient.config.apiToken
      })
      this.log([chalk.green(`${stageName}-ok`), "queueNum=", queueNum], [parameters])
      return queueNum as number
    } catch (err) {
      this.error([chalk.red(`${stageName}-fail`), parameters, (err as Error)?.message], [err])
      throw err;
    }
  }

  async triggerBuildSafe(parameters: Record<string, string>) {
    const stage = 'triggerBuild'
    try {
      const queueNum = await this.triggerBuild(parameters)
      return {
        status: 'ok',
        stage,
        isStageSuccess: true,
        queueNum
      } as IJenkinsRunnerResult
    }
    catch (ex) {
      return {
        status: 'fail',
        stage,
        isStageSuccess: false,
        error: ex
      } as IJenkinsRunnerResult
    }
  }


  async getQueueItem(queueNum: number) {
    const item = await this.apiClient.queue.item(queueNum) as IJenkinsQueueItemResult;
    return item;
  }
  /**
   * 等待Job开始执行
   * @param queueNum
   * @param options
   * @returns
   */
  async waitOnQueueSafe(queueNum: number, options?: IJenkinsRunnerCheckOption) {
    let result: IJenkinsRunnerResult = {
      stage: 'buildQueue',
      status: 'unknown',
      queueNum,
      isStageSuccess: false
    }
    const ctxData = this._createCtxData(result.stage, options)
    const stageTag = ctxData.stageTag
    const jkClient = this.jkClient;
    let resultColor: chalk.ChalkFunction | null = null
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        result.queueItem = await this.getQueueItem(queueNum);
      } catch (err) {
        jkClient.error([chalk.red(`${stageTag}-Error`), err])
        result.error = err as Error;
        return result;// log
      }
      let isContinue = true;
      if (result.queueItem.executable) {
        const buildNum = result.queueItem.executable.number
        result = {
          ...result,
          status: "executable",
          buildNum: buildNum,
          isStageSuccess: true
        }
        resultColor = chalk.green
        isContinue = false;
      } else if (result.queueItem.cancelled) {
        result = {
          ...result,
          status: "canceled"
        }
        resultColor = chalk.gray
        isContinue = false;
      } else if (this._checkIsTimeout(result.job?.estimatedDuration, ctxData)) {

        result.status = 'timeout';
        resultColor = chalk.yellow
        isContinue = false;
      }
      if (!isContinue) {
        const briefArgs = [resultColor!(`${stageTag}-${result.status}`), "queueNum=", queueNum];
        if (result.buildNum) {
          briefArgs.push('buildNum=', result.buildNum)
        }
        this.log(briefArgs)
        return result;
      }
      await new Promise(r => setTimeout(r, ctxData.checkInterval));
    }

  }


  async getBuild(buildNum: number) {
    let job: IJenkinsJobResult;
    job = await this.jkClient.apiClient.build.get(this.jobName, buildNum);
    return job;
  }

  private _createCtxData(stage: keyof (typeof STAGE_LABEL_MAP), options?: IJenkinsRunnerCheckOption) {
    const { timeout, checkInterval } = convertCheckOption(options);
    const ctxData: IStageCtxData = {
      stageTag: STAGE_LABEL_MAP[stage],
      startTime: new Date().getTime(),
      lastLogTime: 0,
      logBrifInterval: Math.max(checkInterval, 10 * 1000),
      timeout, checkInterval
    }
    return ctxData
  }
  async waitOnBuildSafe(buildNum: number, options?: IJenkinsRunnerCheckOption) {
    const that = this;
    const stageTag = '[Build]'
    const result: IJenkinsRunnerResult = {
      status: 'unknown',
      stage: 'build',
      buildNum,
      isStageSuccess: false
    }
    const ctxData = this._createCtxData(result.stage, options)
    // let isTimeout = false;
    let getErrCount = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        result.job = await this.getBuild(buildNum);
      } catch (ex) {
        getErrCount++;
        const errMsg = (ex as any)?.message
        this.error([chalk.red(`${stageTag}-GetError`), errMsg], [ex]);
        if (getErrCount > 10) {
          result.status = 'fail';
          result.error = ex as Error;
          return result;
        } else {
          await new Promise(r => setTimeout(r, ctxData.checkInterval));
          continue
        }
      }
      let isContinue = true;
      if (!result.job.building) {
        result.status = result.job.result === 'SUCCESS' ? 'ok' : (result.job.result === 'ABORTED' ? 'canceled' : 'fail');
        result.isStageSuccess = result.status === 'ok';
        isContinue = false;
      }
      if (isContinue && this._checkIsTimeout(result.job.estimatedDuration, ctxData)) {
        // isTimeout = true;
        result.status = 'timeout';
        isContinue = false;
      }
      if (!isContinue) {
        const logList = [result.job.fullDisplayName || '-', 'duration', result.job.duration + 'ms', 'Details:', chalk.underline.blue(result.job.url)]

        const chalkFun = result.isStageSuccess ? chalk.green : chalk.yellow
        this.log([chalkFun(`${stageTag}-${result.status}`), ...logList])
        return result;
      }
      await new Promise(r => setTimeout(r, ctxData.checkInterval));
    }
  }

  private _checkIsTimeout(estimatedDuration: number | undefined, ctxOptions: IStageCtxData) {
    const { stageTag, startTime, lastLogTime, logBrifInterval, timeout } = ctxOptions;
    const dtNow = new Date().getTime()
    const waitLog = [chalk.grey(`${stageTag}-waiting on...`), 'waited:', humanizeDuration(dtNow - startTime), 'estimated:', (estimatedDuration ? humanizeDuration(estimatedDuration) : '--')];
    if (dtNow - lastLogTime > logBrifInterval) {
      this.log(waitLog)
      ctxOptions.lastLogTime = dtNow
    } else {
      this.log(null, waitLog)
    }
    if (timeout && startTime + timeout > dtNow) {
      return true;
    }
    return false;
  }

  async startRunnerJob(parameters: Record<string, string>, options?: IJenkinsRunnerCheckOption) {

    const triggerBuildStatus = await this.triggerBuildSafe(parameters);
    if (!triggerBuildStatus.isStageSuccess) {
      return triggerBuildStatus;
    }
    const queueResult = await this.waitOnQueueSafe(triggerBuildStatus.queueNum!, options);
    if (!queueResult.isStageSuccess) {
      return queueResult;
    }

    const buildResult = await this.waitOnBuildSafe(queueResult.buildNum!);
    buildResult.queueItem = queueResult.queueItem
    buildResult.queueNum = queueResult.queueNum
    return buildResult
  }

  //#region DingTalk Markdown
  async appendJobMarkdownMetas(jobResult: IJenkinsRunnerResult, md: DingtalkMarkdown) {
    const stageName = STAGE_LABEL_MAP[jobResult.stage]
    const job = jobResult.job;
    const jobStatus = job?.result;
    md.append(`> Stage: ${stageName} - ${jobResult.status}${jobStatus ? ` - ${jobStatus}` : ''}`);
    if (job) {
      let jobRunMetas: string[] = [];
      // if (job.timestamp) {
      //   jobRunMetas.push(`StartAt: ${formatSimpleDate(job.timestamp)}`)
      // }
      if (job.duration) {
        jobRunMetas.push(`Elapsed: ${humanizeDuration(job.duration)}`)
      }
      if (job.url) {
        jobRunMetas.push(`[Job-${jobResult.buildNum}](${job.url})`)
        jobRunMetas.push(`[Changes](${job.url + '/changes'})`)
      }
      if (jobRunMetas.length > 0) {
        md.append(``);
        md.append(`> ${jobRunMetas.join('  |  ')}`)
      }
    } else if (jobResult.stage === 'buildQueue') {
      const queueItem = jobResult.queueItem
      if (queueItem) {
        const taskUrl = queueItem.task?.url;
        const jobUrl = queueItem.executable?.url
        if (taskUrl || jobUrl) {
          md.append(``);
          md.append(`> [Jenkins-${jobResult.queueNum}](${taskUrl}) | [Jenkins-Job-${queueItem.executable?.number}](${jobUrl})`);
        }
      }
    }
  }
  async appendJobMarkdownGitChanges(job: IJenkinsJobResult, md: DingtalkMarkdown, options?: {
    title?: string,
    gitLogConfig?: IGitLogConfig
  }) {

    const { title = "Changes", gitLogConfig = {} } = options || {};
    const { ignoreAuthor, ignoreTags = [], includeTags = [] } = gitLogConfig
    const changeSetItems = job.changeSet?.items || [];
    if (changeSetItems.length !== 0) {
      md.append("");
      md.append(`#### ${title}`)
      md.append(``);
      let maxDt = 0;
      let minDt = Number.MAX_VALUE
      changeSetItems.forEach((item) => {
        // console.dir(item); 
        if (item.timestamp > maxDt) {
          maxDt = item.timestamp;
        }
        if (item.timestamp < minDt) {
          minDt = item.timestamp
        }
        if (ignoreTags.length > 0 || includeTags.length > 0) {
          const tag = (item.msg || '').trimStart().split(':')[0].split('(')[0];//feat(xxx): xxx
          if (ignoreTags.length > 0) {
            if (ignoreTags.indexOf(tag) >= 0) {
              return;
            }
          }
          if (includeTags.length > 0) {
            if (includeTags.indexOf(tag) < 0) {
              return;// 忽略
            }
          }
        }
        let authorInfo = ignoreAuthor ? '' : ` by ${item.author.fullName}`
        md.append(
          `- ${item.msg}${authorInfo}`
        );
      });

      md.append(``);
      md.append(`> ChangesAt: ${formatSimpleDate(minDt)}${minDt === maxDt ? '' : ' ~ ' + formatSimpleDate(maxDt)}`);
      md.append(`> Commits: ${changeSetItems.length}`)
    } else {
      md.append("");
      md.append("No Changes");
    }
  }

  async createJobMarkdown(jobResult: IJenkinsRunnerResult, md: DingtalkMarkdown | undefined, config?: {
    title?: string
    gitLogConfig?: IGitLogConfig
  }) {
    if (!md) {
      md = new DingtalkMarkdown();
    }
    const job = jobResult.job;
    const { title = `${job?.fullDisplayName || '任务'} - 发布` } = config || {}

    md.append(`### ${title}`)
    this.appendJobMarkdownMetas(jobResult, md);
    if (job) {
      if (job.changeSet?.kind === 'git') {
        this.appendJobMarkdownGitChanges(job, md, {
          gitLogConfig: config?.gitLogConfig
        })
      }
    }
    md.setTitle(title)
    return md;
  }

  //#endregion

  async getBuildLog(buildNum: number) {
    const res = await this.apiClient.build.log(this.jobName, buildNum, 0, 'text');
    return res;
  }

  //#region log

  private _prependJobInfoForLog(briefArgs: any[] | null, detailArgs?: any[]) {
    [briefArgs, detailArgs].some(args => {
      if (args && args.length > 0) {
        args.splice(0, 0, chalk.blue(`(${this.jobName})`))
        return true;
      }
    })
  }
  warn(briefArgs: any[] | null, detailArgs?: any[]) {
    this._prependJobInfoForLog(briefArgs, detailArgs)
    this.jkClient.warn(briefArgs, detailArgs)
  }

  log(briefArgs: any[] | null, detailArgs?: any[]) {
    this._prependJobInfoForLog(briefArgs, detailArgs)
    this.jkClient.log(briefArgs, detailArgs)
  }
  error(briefArgs: any[] | null, detailArgs?: any[]) {
    this._prependJobInfoForLog(briefArgs, detailArgs)
    this.jkClient.error(briefArgs, detailArgs)
  }

  //#endregion

}