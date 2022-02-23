#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const glob = require('glob')

class ComponentShowcase {
  constructor (config) {
    this.config = config

    this.log('')
    this.log('----------------------------------------------------------------')
    this.log(`------------------- Component Showcase v${ComponentShowcase.DEFAULTS.version} ------------------`)
    this.log('----------------------------------------------------------------')
    this.log('')
    this.log('Options:')

    for (const key in this.config) {
      this.log('|-', key, '=>', this.config[key])
    }

    this.log('')
  }

  generate () {
    this.log('Components:')

    this.findComponents()
      .then((components) => {
        components.forEach((c) => this.log('|-', this.simpleComponentPath(c)))
        this.log('')
        // yarn vue-cli-service build --target wc --name domain-input app/javascript/components/domain-input --inline-vue
        return components
      })
      .then((components) => this.generateIndex(components))
      .then(() => {
        this.log('🎉 Done! Your component showcase can be found at:')
        this.log(path.resolve(this.config.outputPath))
        this.log('')
      })
  }

  generateIndex (components) {
    const outputPath = path.join(this.config.cwd, this.config.outputPath)
    const output = fs
      .readFileSync(path.join(__dirname, '../templates/index.html')).toString()
      .replace(/\{\{title\}\}/g, this.config.title)
      .replace(/\{\{stylesheet\}\}/g, this.config.defaultStylesheet)
      .replace(/\{\{sidebar\}\}/g, this.buildSidebar(components))
      .replace(/\{\{js-components\}\}/g, this.buildJSComponents(components))

    fs.writeFileSync(outputPath, output)
  }

  findComponents () {
    return new Promise((resolve, reject) => {
      glob(this.config.componentsPath[0], (err, files) => {
        if (err) {
          return reject(err)
        }

        resolve(files)
      })
    })
  }

  buildSidebar (components) {
    const content = components.map((componentPath) => {
      return `<li><a href="javascript:window.componentShowcase.show('${componentPath}')">${this.simpleComponentPath(componentPath)}</a></li>`
    }).join('')

    return `<ul>${content}</ul>`
  }

  buildJSComponents (components) {
    const content = components.map((componentPath) => {
      return `'${componentPath}': {
        simplePath: '${this.simpleComponentPath(componentPath)}',
        src: 'data:text/html,<link rel="stylesheet" type="text/css" href="${this.config.defaultStylesheet}"><p>${this.simpleComponentPath(componentPath)}</p>'
      }`
    }).join(',')

    return `{${content}}`
  }

  simpleComponentPath (componentPath) {
    const base = this.config.componentsPath[0].split('*')[0]
    let simplePath = componentPath.split(base)[1]

    this.config.ignoreFileName.forEach((matcher) => {
      simplePath = simplePath.replace(matcher, '')
    })

    return simplePath
      .replace(/\/+/g, '/')
      .replace(/\/$/, '')
  }

  log () {
    if (this.config.verbose) {
      console.log(...arguments)
    }
  }
}

ComponentShowcase.buildFromConfig = (cwd, configFileName) => {
  const configFilePath = path.join(cwd, configFileName)

  if (!fs.existsSync(configFilePath)) {
    throw new Error(`Expected file at \`${configFilePath}\``)
  }

  const options = require(configFilePath)

  return new ComponentShowcase({
    version: typeof options.version !== 'undefined' ? options.version : ComponentShowcase.DEFAULTS.version,
    cwd,
    configFilePath,
    componentsPath: typeof options.componentsPath !== 'undefined' ? options.componentsPath : ComponentShowcase.DEFAULTS.componentsPath,
    ignoreFileName: typeof options.ignoreFileName !== 'undefined' ? options.ignoreFileName : ComponentShowcase.DEFAULTS.ignoreFileName,
    verbose: typeof options.verbose !== 'undefined' ? options.verbose : ComponentShowcase.DEFAULTS.verbose,
    outputPath: typeof options.outputPath !== 'undefined' ? options.outputPath : ComponentShowcase.DEFAULTS.outputPath,
    title: typeof options.title !== 'undefined' ? options.title : ComponentShowcase.DEFAULTS.title,
    defaultStylesheet: typeof options.defaultStylesheet !== 'undefined' ? options.defaultStylesheet : ComponentShowcase.DEFAULTS.defaultStylesheet
  })
}

ComponentShowcase.DEFAULTS = {
  version: require(path.join(__dirname, '../package.json')).version,
  cwd: process.cwd(),
  configFileName: 'component-showcase.config.js',
  componentsPath: ['./src'],
  ignoreFileName: '',
  verbose: false,
  outputPath: './public/components.html',
  defaultStylesheet: '',
  title: ['Component Showcase']
}

ComponentShowcase
  .buildFromConfig(ComponentShowcase.DEFAULTS.cwd, ComponentShowcase.DEFAULTS.configFileName)
  .generate()
