import { createReadStream } from 'node:fs'
import { binding, when } from 'cucumber-tsflow'
import { Agent, Captures } from '@toa.io/agent'
import { asset } from './parameters'
import { environment } from './environment'

@binding()
export class HTTP {
  public variables = new Captures()
  public readonly agent: Agent

  public constructor () {
    this.agent = new Agent(environment.origin, this.variables)
  }

  @when('the request is sent:')
  public async request (text: string): Promise<Response> {
    return await this.agent.request(text)
  }

  @when('the response is received:')
  public matches (text: string): void {
    this.agent.responseIncludes(text)
  }

  @when('the file `{word}` is sent with the following request:')
  public async upload (file: string, text: string): Promise<void> {
    const stream = createReadStream(asset(file))

    await this.agent.stream(text, stream)
  }
}
