

export type IJenkinsConConfig = {
  user: string,
  password: string,
  /**
   * 目前apiToken可以不需要
   */
  apiToken?: string,
  /**
   * ip:port,
   * domainName:port
   */
  host: string,
  schema: string,

  /**
   * @default true
   */
  crumbIssuer?: boolean;

}
export interface IJenkinsRunnerConfig {
  /**
   * jenkins配置
   */
  jenkinsConfig: IJenkinsConConfig,

  /**
   * 消息通知对象列表
   */
  dingtalkList: IDingtalkConfigItem[],

  /**
   * 拼装消息的时候对git更新记录的筛选规则
   */
  gitLogConfig?: IGitLogConfig;

  runnerSchemas: IRunnerSchema[]

}
export interface IRunnerSchema extends IJenkinsRunnerCheckOption {
  /**
   * runner唯一标识
   */
  runnerName: string,

  /**
   * 显示名称-若未设置，使用runnerName
   */
  runnerDisplayName?: string,

  /**
   * 待执行job列表(串行熔断)
   */
  jobList: IRunnerJobItem[],

  /**
   * 只在成功的时候,Remid
   */
  onlyRemindOk: boolean;


  /**
   * reminder 结尾部分
   */
  reminderSuffix?: string[]
}

export interface IDingtalkConfigItemBase {
  /**
   * 用来标记消息通知对象
   */
  label?: string;

  /**
   * 使用关键词时，不需要，自行保证内容中有关键词
   */
  secret?: string
}

export interface IDingtalkConfigItemAccessToken extends IDingtalkConfigItemBase {
  accessToken: string
}

export interface IDingtalkConfigItemWebhook extends IDingtalkConfigItemBase {
  webhook: string;
}
export type IDingtalkConfigItem = IDingtalkConfigItemAccessToken | IDingtalkConfigItemWebhook

export interface IJenkinsRunnerCheckOption {

  //#region 等待，超时时间
  /**
   * 默认0，不超时
   */
  timeout?: number,

  /**
   * 默认500ms
   */
  checkInterval?: number
  //#endregion
}

export interface IGitLogConfig {
  /**
     * 是否忽略gitlog的author
     */
  ignoreAuthor?: boolean;

  /**
   * 需要忽略的gitTag
   * e.g: ['chore','doc']
   */
  ignoreTag?: string[];

  /**
   * 包含的tags,如果没有，则全部包含
   */
  includeTags?: string[];
}
export interface IRunnerJobItem extends IJenkinsRunnerCheckOption {
  jobName: string,
  jobDisplayName?: string,
  parameters: Record<string, string>;

  gitLogConfig?: IGitLogConfig;
}

export interface IJenkinsJobResult {
  /**
   * 可能还有其他值，未完成时为null
   */
  result: 'SUCCESS' | 'FAILURE' | 'ABORTED' | null;

  _class?: string,
  actions?: [],
  artifacts?: [],
  building?: boolean,
  description?: string | null,
  /**
   * #jobNumber
   */
  displayName?: string;
  /**
   * 耗时
   */
  duration?: number;

  /**
   * 预估时间
   */
  estimatedDuration?: number;
  executor?: null;
  /**
   * jobName #jobNumber
   */
  fullDisplayName?: string;
  /**
   * jobNumber
   */
  id?: string;
  keepLog?: boolean
  queueId?: number;
  timestamp?: number;
  url?: string;
  buildOn?: string;
  changeSet?: {
    _class: string,
    items?: IJenkinsGitChangeSetItem[],
    kind: 'git'
  } | {

    _class: string,
    items?: [],
    kind: null
  }
}


export interface IJenkinsRunnerResult {
  status: 'ok' | 'executable' | 'canceled' | 'timeout' | 'fail' | 'unknown',
  stage: 'triggerBuild' | 'buildQueue' | 'build',
  isStageSuccess: boolean,
  error?: Error,

  queueNum?: number,
  queueItem?: IJenkinsQueueItemResult,

  buildNum?: number,
  job?: IJenkinsJobResult
}

interface IJenkinsGitChangeSetItem {
  _class: string,
  affectedPaths: [],
  commitId: string,
  timestamp: number;
  author: { fullName: string },
  authorEmail: string,
  comment: string,
  date: string,
  id: string,
  msg: string,
  paths: []
}

export interface IJenkinsQueueItemResult {
  "actions": {
    "causes": [
      {
        "shortDescription": string,
        "userId": string,
        "userName": string
      }
    ]
  }[],
  "blocked": boolean,
  "buildable": boolean,
  "id": number,
  "inQueueSince": string,
  "params": string,
  "stuck": boolean,
  task?: {
    "name": string,
    "url": string,
    "color": "blue"
  },
  "url": string,
  "why": null,
  executable?: {
    "number": number,
    "url": string
  }
  cancelled?: boolean
}