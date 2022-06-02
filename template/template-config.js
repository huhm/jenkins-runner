// const { jenkinsConfig } = require("../local.private.config.js");
let jenkinsConfig={
  user:process.env.J_RUNNER_USER,
  password:process.env.J_RUNNER_PWD,
  apiToken:process.env.J_RUNNER_APITOKEN
}
if(!jenkinsConfig.user){
  jenkinsConfig=require('../local.private.config.js').jenkinsConfig
}

module.exports = {
  jenkinsConfig: {
    ...jenkinsConfig,
    host: "xx.xx.xx.xx:port", // 域名或IP
    schema: "http", // jenkins service schema
  },
  dingtalkList: [
    {
      label: "xx群", //-标记用，可不填
      accessToken:
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      secret:
        "SECxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    },
  ],
  gitLogConfig: {
    // 默认包含作者信息
    ignoreAuthor: false,

    // 需要过滤的tag,默认不过滤
    // tag为commit信息`:`前的部分
    ignoreTags: [],
    // 仅显示（includeTags-ignoreTags）的提交信息，默认全部显示
    // e.g: ['feat','fix','build','revert','perf']
    includeTags: [],
  },
  // 默认执行列表中第一个，可指定runnerName
  runnerSchemas: [
    {
      runnerDisplayName: "<ProjectName>-PN",
      runnerName: "deployPN",
      onlyRemindOk: false, // default value
      jobList: [
        {
          jobName: "<JobName1>",
          jobDisplayName: "部署 XXX 项目",
          parameters: {
            // 该job的参数
            DO_WHAT: "publish",
            GIT_URL: "git@xxx:web/XXX.git",
            GIT_BRANCH: "master",
            DEPLOY_HOST: "xxx",
          },
        },
        {
          jobName: "<JobName1>",
          jobDisplayName: "清除CDN缓存",
          parameters: {
            // 该job的参数
            Domain_name: "XXX",
          },
        },
      ],
      reminderSuffix: [
        "> [线上地址](https://XX.XX.com/) | [GitLab仓库](http://XX.XX.XX.XX/web/XXX)",
      ],
    },
  ],
};
