const JK_Utils = require("../lib/index");
const JenkinsRunnerConfig = require("../local/jenkins_runner.config");
const JenkinsClient = JK_Utils.default;

const jkClient = new JenkinsClient(JenkinsRunnerConfig.jenkinsConfig);
// //1. run Schema
// jkClient.runSchema(
//   jkClient.getRunnerSchemaItem(JenkinsRunnerConfig),
//   JenkinsRunnerConfig.dingtalkList
// );

// 2. custom run job
const jobClient = jkClient.createJobClient("aws_clean_cdn");
jobClient
  .startRunnerJob({
    Domain_name: "i.freemoneytracker.com",
  })
  .then((jobResult) => {
    // console.log(jobResult.stage, jobResult.status);
    // console.dir(jobResult);
  });
