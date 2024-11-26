import * as path from 'node:path'
import { setTimeout } from 'node:timers/promises'
import { execSync } from 'node:child_process'
import { binding, beforeAll, afterAll } from 'cucumber-tsflow'
import * as dotenv from 'dotenv'
import { glob } from 'fast-glob'
import * as stage from '@toa.io/userland/stage'
import { ROOT } from './parameters'
import { environment } from './environment'

@binding()
export class Application {
  private static async expo (): Promise<void> {
    await fetch('http://localhost:8000/', { method: 'OPTIONS' })
      .catch(async () => await stage.serve('exposition'))
  }

  @beforeAll()
  public static async start (): Promise<void> {
    if (environment.remote) return

    execSync('npx toa env -p application', { cwd: ROOT })
    dotenv.config({ path: path.join(ROOT, '.env') })

    const paths = await glob(path.join(ROOT, 'components/*'), { onlyDirectories: true })

    await this.expo()
    await stage.compose(paths)
    await setTimeout(100) // resource discovery
  }

  @afterAll()
  public static async stop (): Promise<void> {
    if (environment.remote) return

    await setTimeout(300)
    await stage.shutdown()
  }
}
