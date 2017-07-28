import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

const CONFIG_FILE_NAME = '.soycriticrc';

export interface Config {
  callToImportRegex: string
  callToImportReplace: string
}

export const DEFAULT_CONFIG: Config = {
  callToImportRegex: '(.*)',
  callToImportReplace: '{$1}'
};

export function readConfig(): Config {
  const filePath = getConfigFilePath();
  let config = {};

  if (filePath) {
    try {
      const buffer = fs.readFileSync(filePath);

      config = JSON.parse(buffer.toString('utf8'));
    } catch(e) {}
  }

  return {...DEFAULT_CONFIG, ...config};
}

export function getConfigFilePath(): string | null {
  let currentPath = process.cwd();

  while (currentPath !== '/') {
    const nextPath = path.join(currentPath, '/', CONFIG_FILE_NAME);

    if (fs.existsSync(nextPath)) {
      return nextPath;
    }
    currentPath = path.dirname(currentPath);
  }

  return null;
}
