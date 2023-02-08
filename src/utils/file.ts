import path from "path";
import fs from "fs";

/**
 * 从startFolder文件加开始，向上查找文件名为fileName的文件
 * @param fileName 文件名
 * @param startFolder 起始folder,可使用绝对位置或相对位置
 * @param __lastAbsolutePath
 * @returns {String} 文件绝对路径
 */
export function searchFilePathDFS(
  fileName: string,
  startFolder: string,
  __lastAbsolutePath?: string
): string | undefined {
  let curAbsolutePath = path.resolve(startFolder);
  if (curAbsolutePath === __lastAbsolutePath) {
    return; // 文件不存在
  }
  const isFolderExist = fs.existsSync(curAbsolutePath);
  if (isFolderExist) {
    const curFilePath = path.join(curAbsolutePath, fileName);
    if (fs.existsSync(curFilePath)) {
      return curFilePath;
    } else {
      path.relative(startFolder, "../");
      return searchFilePathDFS(
        fileName,
        path.join(curAbsolutePath, "../"),
        curAbsolutePath
      );
    }
  } else {
    return;
  }
}

/**
 * 尝试接着配置文件
 * @param fileName 文件名 e.g: local.private.config.js
 * @param startFolder 起始folder,可使用绝对位置或相对位置
 * @returns
 */
export function tryLoadConfigFile<T>(
  fileName: string,
  startFolder: string
): T | undefined {
  const filePath = searchFilePathDFS(fileName, startFolder);
  if (!filePath) {
    console.warn("ConfigFile not exists", fileName);
    return;
  }
  console.log("Use Config:", filePath);
  return require(filePath) as T;
}
