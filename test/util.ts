import * as fs from 'fs';
import * as path from 'path';

export function getFixturePath(name: string): string {
  return path.join(__dirname, '..', 'test', 'fixtures', name);
}

export function getFixture(file: string): string {
  return fs.readFileSync(getFixturePath(file), 'utf8');
}
