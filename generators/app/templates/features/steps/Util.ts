import { binding, given, when } from 'cucumber-tsflow'
import { randomUUID } from 'node:crypto'
import { HTTP } from './HTTP'
import type { Captures } from '@toa.io/agent'

@binding([HTTP])
export class Util {
  private readonly captures: Captures

  public constructor (http: HTTP) {
    this.captures = http.variables
  }

  @given('new id as `{word}`')
  public id (as: string): void {
    const id = randomUUID().replace(/-/g, '')

    this.captures.set(as, id)
  }

  @given('new id')
  public newid (): void {
    this.id('id')
  }

  @when('{int}ms have passed')
  public async after (seconds: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, seconds))
  }
}
