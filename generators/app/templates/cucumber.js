module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['./features/**/*.ts'],
    failFast: true,
    format: ['@cucumber/pretty-formatter']
  }
}
