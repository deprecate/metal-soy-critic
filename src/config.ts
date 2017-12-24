import * as chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

const CONFIG_FILE_NAMES = [
  '.soycriticrc',
  '.soycriticrc.json',
];

export interface CallToImportConfig {
  regex: string
  replace: string
}

export interface ImplicitParamsMap {
  [nameOrRegex: string]: string | Array<string>
}

export interface Config {
  callToImport: Array<CallToImportConfig>
  implicitParams: ImplicitParamsMap
}

export const DEFAULT_CONFIG: Config = {
  callToImport: [{regex: '(.*)',replace: '{$1}'}],
  implicitParams: {}
};

export function validateConfig(config: Config): Config {
  if (!Array.isArray(config.callToImport)) {
    throw new Error('callToImport is not a valid config array.');
  }

  for (let i=0; i < config.callToImport.length; i++) {
    let callToImportItem = config.callToImport[i];

    if (!isRegex(callToImportItem.regex)) {
      throw new Error(`callToImport.regex "${callToImportItem.regex}" is not a valid RegExp.`);
    }

    if (!isRegex(callToImportItem.replace)) {
      throw new Error(`callToImport.replace "${callToImportItem.replace}" is not a valid replace string.`);
    }
  }

  for (const key in config.implicitParams) {
    if (!isRegex(key)) {
      throw new Error(`"${key}" is not a valid RegExp.`);
    }
  }

  return config;
}

export function convertConfig(config: any): Config {
  if (config.callToImportRegex && config.callToImportReplace) {
    config.callToImport = [
      {
        regex: config.callToImportRegex,
        replace: config.callToImportReplace
      }
    ];

    console.log(chalk.yellow('CONFIG API HAS CHANGED, PLEASE UPDATE\n'));
    console.log('\tYour callToImport configuration is outdated, update it to new API.\n');
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
  
  config = convertConfig(config);
  
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