#!/usr/bin/env node

import commander from 'commander';
import registerDing from './cli-ding';
import registerInfo from './cli-info';
import registerInit from './cli-init';
import registerRun from './cli-run';
const pkg = require('../../package.json')

commander.program.storeOptionsAsProperties(false);
// (commander.program as any).passCommandToAction(true)
commander.program.version(pkg.version, '-v, --version')


registerInit();
registerRun();
registerInfo();
registerDing()
commander.program.parse(process.argv);

export { DEFAULT_JENKINS_CONFIG_FILENAME } from './cli-utils';

