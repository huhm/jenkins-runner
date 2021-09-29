const jenkinsConfig = require("./template-private.js");
module.exports = {
  jenkinsConfig: jenkinsConfig,
  dingtalkList: [
    {
      accessToken:
        "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      secret:
        "SECxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    },
  ],
  // 默认执行列表中第一个，可指定runnerName
  runnerSchemas: [
    {
      projectName: "<ProjectName>-PN",
      runnerName: "deployPN",
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
