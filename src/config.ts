import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

const CONFIG_FILE_NAMES = [
  '.soycriticrc',
  '.soycriticrc.json',
];

export interface ImplicitParamsMap {
  [nameOrRegex: string]: string | Array<string>
}

export interface Config {
  callToImportRegex: string
  callToImportReplace: string
  implicitParams: ImplicitParamsMap
}

export const DEFAULT_CONFIG: Config = {
  callToImportRegex: '(.*)',
  callToImportReplace: '{$1}',
  implicitParams: {}
};

export function validateConfig(config: Config): Config {
  if (!isRegex(config.callToImportRegex)) {
    throw new Error('callToImportRegex is not a valid RegExp.');
  }

  if (!isRegex(config.callToImportReplace)) {
    throw new Error('callToImportReplace is not a valid replace string.');
  }

  for (const key in config.implicitParams) {
    if (!isRegex(key)) {
      throw new Error(`"${key}" is not a valid RegExp.`);
    }
  }

  return config;
}

export function readConfig(): Config {
  const filePath = getConfigFilePath();
  let config = {};

  if (filePath) {
    const buffer = fs.readFileSync(filePath);

    config = JSON.parse(buffer.toString('utf8'));
  }

  return validateConfig({...DEFAULT_CONFIG, ...config});
}

export function getConfigFilePath(): string | null {
  let currentPath = process.cwd();

  while (currentPath !== '/') {
    for (const fileName of CONFIG_FILE_NAMES) {
      const nextPath = path.join(currentPath, '/', fileName);

      if (fs.existsSync(nextPath)) {
        return nextPath;
      }
    }
    currentPath = path.dirname(currentPath);
  }

  return null;
}

export function isRegex(regex: string): boolean {
  try {
    new RegExp(regex);
  } catch(e) {
    return false;
  }
  return true;
}
