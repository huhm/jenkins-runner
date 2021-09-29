# jenkins-api-client

jenkins 调用的帮助类, 使用了npm包`jenkins`的api

## cli

使用步骤：

1. 安装和配置

``` bash
npm install jenkins-runner -D

# 生成config文件
npm init
```

2. 配置生成的config文件`jenkins_runner.config.js`
3. 配置package.json中的scripts配置节 `deployPN:"jenkins-runner -r deployPN"`
4. 执行runner `npm run deployPN`

``` bash

# 执行第一个runenrSchema
npx jenkins-runner

# 执行指定的runenrSchema
npx jenkins-runner -r runnerName

# 指定配置文件
npx jenkins-runner -r runnerName -c ./xxx.config.js

# 在package.json 文件的scripts中增加 deploy:""
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
