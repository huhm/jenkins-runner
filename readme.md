# jenkins-runner

[![npm version](https://badge.fury.io/js/jenkins-runner.svg)](https://badge.fury.io/js/jenkins-runner)

jenkins 调用的cli和api, 使用了npm包`jenkins`的api

## cli
+ `jenkins-runner init [-d <configFolderPath>]` 初始化项目配置
+ `jenkins-runner run <runnerName> [-c <configFile>]` 执行jenkins任务
+ `jenkins-runner info [-c <configFile>]` 尝试连接jenkins,并获取信息
+ `jenkins-runner ding -t <text> [-c <configFile>]` 指定发送消息

### 首次使用步骤

1. 安装 `npm install -D jenkins-runner`
2. 配置 `npx jenkins-runner init`
3. 配置生成的文件
   1. config文件： `jenkins_runner.config.js`
   2. 配置生成的私有文件 `local.private.config.js`
4. 检查jenkins账号配置 `npx jenkins-runner info`
5. 配置package.json
   1. scripts配置节 `"deploy:pn":"jenkins-runner run deployPN"`
6. 执行runner `npm run deploy:pn`


### 重新下仓库时的配置

1. 执行`npx jenkins-runner init`

local.private.config.js
``` js
export const jenkinsConfig = {
  user: "<JenkinsUserName>",
  password: "<JenkinsPassword>",
};

```

### Command使用示例


run job
``` bash
# get help
jenkins-runner run -h


# 执行第一个runenrSchema
npx jenkins-runner run

# 执行指定的runenrSchema
npx jenkins-runner run <runnerName>

# 指定配置文件
npx jenkins-runner run  <runnerName> -c ./xxx.config.js

```

send text
``` bash

npx jenkins-runner ding -t "fff"
```

## 钉钉群消息助手

+ 群设置--智能群助手--添加机器人--自定义（通过Webhook接入自定义服务）--添加
+ 添加配置
  + 机器人名字
  + 安全设置
    + 加签(保存签名)
+ 添加成功后，保存webhook 类似：<https://oapi.dingtalk.com/robot/send?access_token=xxx>

## 自定义脚本调用

``` ts

import JenkinsClient from 'jenkins-runner' 
const JenkinsRunnerConfig = require("./jenkins_runner.config.js"); 
const jkClient = new JenkinsClient(JenkinsRunnerConfig.jenkinsConfig);
// 也可自定义markdown数据
jkClient.runSchema(
  jkClient.getRunnerSchemaItem(JenkinsRunnerConfig),
  JenkinsRunnerConfig.dingtalkList
);

```
