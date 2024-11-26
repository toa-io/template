import path, { join, resolve } from 'node:path'
import { setDefaultTimeout } from '@cucumber/cucumber'

export const ROOT = path.resolve(__dirname, '../../application')

export function asset (path: string): string {
  return resolve(join(__dirname, '..', 'assets', path))
}

setDefaultTimeout(60 * 1000)
