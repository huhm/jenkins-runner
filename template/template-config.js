const { jenkinsConfig } = require("./local.private.config.js");
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
    ignoreAuthor: false, // 默认包含
    ignoreTag: [], // 默认不过滤
    includeTags: [], // 默认不过滤
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
