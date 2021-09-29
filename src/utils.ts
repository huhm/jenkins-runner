import { IJenkinsRunnerCheckOption } from "./interface";

export function formatSimpleDate(timestamp: number) {
  const dt = new Date(timestamp);

  function convertNum(num: number) {
    return num.toString().padStart(2, '0')
  }
  return `${convertNum(dt.getMonth() + 1)}-${convertNum(dt.getDate())} ${convertNum(dt.getHours())}:${convertNum(dt.getMinutes())}`;
}
export const DEFAULT_RUNNER_CHECK_OPTION = {
  timeout: 0, checkInterval: 500
}

export function convertCheckOption(options?: IJenkinsRunnerCheckOption) {

  const { timeout = DEFAULT_RUNNER_CHECK_OPTION.timeout, checkInterval = DEFAULT_RUNNER_CHECK_OPTION.checkInterval } = options || {};
  return {
    timeout, checkInterval
  }
}

export function padStartNum(num: number, length: number = 2) {
  return num.toString().padStart(length)
}