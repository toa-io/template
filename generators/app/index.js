const Generator = require('yeoman-generator')

module.exports = class extends Generator {
  answers

  async prompting () {
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'project.id',
        message: 'Project ID:',
        validate: (input) =>
          /^[a-z0-9]+$/.test(input) || 'Project ID must be lowercase alphanumeric'
      },
      {
        type: 'input',
        name: 'project.domain',
        message: 'Project Domain:',
      },
      {
        type: 'input',
        name: 'aws.region',
        message: 'AWS Region (e.g., us-east-1):',
        default: 'us-east-1'
      },
      {
        type: 'input',
        name: 'aws.account',
        message: 'AWS Account ID:',
        validate: (input) =>
          /^\d{12}$/.test(input) || 'Please enter a valid 12-digit AWS Account ID'
      },
      {
        type: 'input',
        name: 'aws.role',
        message: 'AWS kubectl Role Name:',
      },
      {
        type: 'input',
        name: 'amqp.endpoint',
        message: 'AMQP Endpoint:',
      },
      {
        type: 'input',
        name: 'mongodb.endpoint',
        message: 'MongoDB Endpoint:',
      }
    ])
  }

  end () {
    this.spawnCommandSync('npm', ['install', '-D', '@toa.io/runtime@alpha', '@toa.io/userland@alpha', '@toa.io/agent@alpha'])
  }

  writing () {
    // noinspection JSCheckFunctionSignatures
    this.fs.copyTpl(
      this.templatePath('**/*'),
      this.destinationPath(),
      this.answers,
      null,
      { globOptions: { dot: true } }
    )
  }
}
