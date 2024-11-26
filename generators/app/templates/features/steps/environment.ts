import { console } from 'openspan'

console.configure({ format: 'terminal' })

const environments: Record<string, Environment> = {
  local: {
    remote: false,
    origin: 'http://127.0.0.1:8000',
    principal: 'cm9vdDpwYXNzd29yZA==',
    editor: 'd1e542cec2a0433b8fc089c7b8ad17d5'
  },
  production: {
    remote: true,
    origin: 'https://the.clearscreen.ai',
    editor: '5e50581831544e70b1646505c13a714a'
  }
}

export const environment = environments[process.env.FEATURES_ENV ?? 'local']

interface Environment {
  remote: boolean
  origin: string
  principal?: string
  editor: string
}
