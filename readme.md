# jenkins-runner

[![npm version](https://badge.fury.io/js/jenkins-runner.svg)](https://badge.fury.io/js/jenkins-runner)

jenkins 调用的 cli 和 api, 使用了 npm 包`jenkins`的 api
也可作为快速接入钉钉机器人的 cli

## cli

- `jenkins-runner init [-d <configFolderPath>]` 初始化项目配置
- `jenkins-runner run <runnerName> [-c <configFile> --yes]` 执行 jenkins 任务
- `jenkins-runner info [-c <configFile>]` 尝试连接 jenkins,并获取信息

jenkins 发送钉钉消息

- `jenkins-runner ding -t <text> [-c <configFile> --yes]` 指定发送消息(默认 markdown 格式，可指定格式，可指定消息内容的文件地址)

### 首次使用步骤

1. 安装 `npm install -D jenkins-runner`
2. 配置 `npx jenkins-runner init`
3. 配置生成的文件
   1. config 文件： `jenkins_runner.config.js`
   2. 配置环境变量/生成的私有文件 `local.private.config.js`
4. 检查 jenkins 账号配置 `npx jenkins-runner info`
5. 配置 package.json
   1. scripts 配置节 `"deploy:pn":"jenkins-runner run deployPN"`
6. 执行 runner `npm run deploy:pn`

### 重新下仓库时的配置

1. 执行`npx jenkins-runner init`

local.private.config.js

```js
export const jenkinsConfig = {
  user: "<JenkinsUserName>",
  password: "<JenkinsPassword>",
};
```

### Command 使用示例

run job

```bash
# get help
jenkins-runner run -h


# 执行第一个runenrSchema
npx jenkins-runner run

# 执行指定的runenrSchema
npx jenkins-runner run <runnerName>

# 指定配置文件
npx jenkins-runner run  <runnerName> -c ./xxx.config.js

# 忽略确认消息
npx jenkins-runner run  <runnerName>  -y

```

send text

```bash
# 查看用法
npx jenkins-runner ding -h

# 简单的消息发送，默认markdown格式
npx jenkins-runner ding -t "Something happens [change](http://xxx.zzz)"

# 发送文件消息
npx jenkins-runner ding -t "将在文件消息前面" -p "./xxx.md"

# 指定格式
npx jenkins-runner ding -f link  -t "将在文件消息前面" --title "Link 标题" --picUrl "https://gw.alicdn.com/tfs/TB1ut3xxbsrBKNjSZFpXXcXhFXa-846-786.png" --messageUrl "https://developers.dingtalk.com/document/robots/custom-robot-access?spm=ding_open_doc.document.0.0.62846573S3KCDL#topic-2026027"
```

## 钉钉群消息助手

- 群设置--智能群助手--添加机器人--自定义（通过 Webhook 接入自定义服务）--添加
- 添加配置
  - 机器人名字
  - 安全设置
    - 加签(保存签名)
- 添加成功后，保存 webhook 类似：<https://oapi.dingtalk.com/robot/send?access_token=xxx>

## 自定义脚本调用

```ts
import JenkinsClient, { tryLoadConfigFile } from "jenkins-runner";
const JenkinsRunnerConfig = tryLoadConfigFile("./jenkins_runner.config.js");
const jkClient = new JenkinsClient(JenkinsRunnerConfig.jenkinsConfig);
// 也可自定义markdown数据
jkClient.runSchema(
  jkClient.getRunnerSchemaItem(JenkinsRunnerConfig),
  JenkinsRunnerConfig.dingtalkList
);
```
