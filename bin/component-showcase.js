#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const spawnSync = require('child_process').spawnSync
const glob = require('glob')

class ComponentShowcase {
  constructor (config) {
    this.config = config
  }

  generate () {
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

    this.findComponents()
      .then((components) => this.generateIndex(components))
      .then(() => {
        this.log('🎉 Done! Your component showcase can be found at:')
        this.log(path.resolve(this.config.outputPath))
        this.log('')
      })
  }

  generateIndex (components) {
    // components = [components[9]]

    const outputPath = path.join(this.config.cwd, this.config.outputPath)
    const output = fs
      .readFileSync(path.join(__dirname, '../templates/index.html')).toString()
      .replace(/\{\{title\}\}/g, this.config.title)
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

  buildJSComponent (componentPath) {
    const simplePath = this.simpleComponentPath(componentPath)
    const tmpName = 'component-showcase'
    const tmpDir = `tmp/${tmpName}`
    const options = [
      'vue-cli-service', 'build',
      '--inline-vue',
      // --report-json
      // --watch
      '--target', 'wc',
      '--name', tmpName,
      // '--formats', 'commonjs',
      '--dest', tmpDir,
      componentPath
    ]

    this.log('|-', simplePath)

    // this.log('  |-', options.join(' '))
    // this.log('  ✓', 'building assets')
    spawnSync('yarn', options)

    // this.log('  ✓', 'assembling assets')
    const js = fs.readFileSync(`${tmpDir}/${tmpName}.min.js`).toString()
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${simplePath}</title>
      </head>
      <body>
        <link rel="stylesheet" type="text/css" href="${this.config.defaultStylesheet}">
        <h1>${simplePath}</h1>
        <component-showcase></component-showcase>
        <script type="text/javascript">${js}</script>
      </body>
      </html>
    `

    return {
      simplePath: simplePath,
      html: btoa(unescape(encodeURIComponent(html)))
    }
  }

  buildJSComponents (componentPaths) {
    this.log('Components:')

    const components = {}

    const content = componentPaths.forEach((componentPath) => {
      components[componentPath] = this.buildJSComponent(componentPath)
    })

    this.log('')

    return JSON.stringify(components)
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
