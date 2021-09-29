const JK_Utils = require("../lib/index");
const JenkinsRunnerConfig = require("../local/jenkins_runner.config");
const JenkinsClient = JK_Utils.default;

const jkClient = new JenkinsClient(JenkinsRunnerConfig.jenkinsConfig);

jkClient.runSchema(
  jkClient.getRunnerSchemaItem(JenkinsRunnerConfig),
  JenkinsRunnerConfig.dingtalkList
);
