import { binding, given } from 'cucumber-tsflow'
import assert from 'node:assert'
import { environment } from './environment'
import { HTTP } from './HTTP'

@binding([HTTP])
export class Identity {
  private readonly http: HTTP
  private principal: Principal | null = null

  public constructor (http: HTTP) {
    this.http = http
  }

  @given('transient identity {word}')
  public async transient (as: string): Promise<Principal> {
    await this.http.request(`
      GET /identity/ HTTP/1.1
      accept: application/yaml
    `)

    this.http.matches(`
      201 Created
      authorization: Token \${{ ${as}.token }}

      id: \${{ ${as}.id }}
    `)

    const id = this.http.variables.get(as + '.id')!
    const token = this.http.variables.get(as + '.token')!

    return { id, token }
  }

  @given('transient identity')
  public async anonymous (): Promise<Principal> {
    return await this.transient('identity')
  }

  @given('an identity {word}')
  public async persistent (as: string): Promise<void> {
    const username = Math.random().toString(36).substring(7)
    const password = 'password'
    const basic = Buffer.from(username + ':' + password).toString('base64')

    await this.http.request(`
      POST /identity/ HTTP/1.1
      authorization: Basic ${basic}
      accept: application/yaml
    `)

    this.http.matches(`
      201 Created
      authorization: Token \${{ ${as}.token }}

      id: \${{ ${as}.id }}
    `)

    this.http.variables.set(as + '.username', username)
    this.http.variables.set(as + '.password', password)
  }

  @given('{word} logged in')
  public async login (name: string): Promise<void> {
    this.http.variables.delete(name + '.token')

    await this.http.request(`
      GET /identity/ HTTP/1.1
      authorization: Basic #{{ basic ${name} }}
    `)

    this.http.matches(`
      200 OK
      authorization: Token \${{ ${name}.token }}
    `)
  }

  @given('an identity {word} with role `{word}`')
  public async withRole (name: string, role: string): Promise<void> {
    await this.ensurePrincipal()
    await this.persistent(name)
    await this.grantRole(name, role)
  }

  @given('the {word} have the `{word}` role')
  public async privileged (name: 'editor', role: string): Promise<void> {
    const identity = environment[name]

    await this.ensurePrincipal()

    await this.http.request(`
      POST /identity/roles/${identity}/ HTTP/1.1
      authorization: Token \${{ principal.token }}
      content-type: application/yaml
      
      role: ${role}
    `)

    try {
      this.http.matches('201 Created')
    } catch {
      this.http.matches('409 Conflict')
    }
  }

  public async ensurePrincipal (): Promise<Principal> {
    if (this.principal !== null)
      return this.principal

    const credentials = this.principalCredentials()

    this.http.variables.delete('principal.id')
    this.http.variables.delete('principal.token')

    await this.http.request(`
      GET /identity/ HTTP/1.1
      authorization: ${credentials}
      accept: application/yaml
    `)

    try {
      this.http.matches(`
        200 OK
        authorization: Token \${{ principal.token }}
        
        id: \${{ principal.id }}
      `)
    } catch {
      await this.createPrincipal(credentials)
    }

    try {
      await this.grantRole('principal', 'app')
      await this.login('principal')
    } catch {
      this.http.matches('409 Conflict')
    }

    const id = this.http.variables.get('principal.id')
    const token = this.http.variables.get('principal.token')

    assert.ok(id !== undefined && token !== undefined, 'No principal found')

    this.principal = { id, token }

    return this.principal
  }

  private async createPrincipal (credentials: string): Promise<void> {
    await this.http.request(`
      POST /identity/ HTTP/1.1
      authorization: ${credentials}
      accept: application/yaml
    `)

    this.http.matches(`
      201 Created
      authorization: Token \${{ principal.token }}
      
      id: \${{ principal.id }}
    `)
  }

  private principalCredentials (): string {
    const credentials = environment.principal ?? process.env.PRINCIPAL

    assert.ok(credentials !== undefined, 'Principal credentials are required')

    const [username, password] = Buffer.from(credentials, 'base64').toString().split(':')

    this.http.variables.set('principal.username', username)
    this.http.variables.set('principal.password', password)

    return `Basic ${credentials}`
  }

  private async grantRole (name: string, role: string): Promise<void> {
    assert.ok(this.http.variables.get('principal.token') !== undefined, 'Ensure principal first')

    await this.http.request(`
      POST /identity/roles/\${{ ${name}.id }}/ HTTP/1.1
      authorization: Token \${{ principal.token }}
      content-type: application/yaml
      
      role: ${role}
    `)

    this.http.matches('201 Created')
  }
}

export interface Principal {
  id: string
  token: string
}
