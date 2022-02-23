# Component Showcase

Use Component Showcase to build a standalone page of all of your UI components.

:warning: This is an experiment to see how far I can get without getting too complicated. For now, only Vue components are supported.

## Usage

1. In your repository, add `component-showcase` to your `package.json` file and `yarn add -D component-showcase` or `npm install -D component-showcase`.
1. Next, create `component-showcase.config.js` in the root of your project:
1. Finally, run `yarn component-showcase` or `yarn run component-showcase` from your project directory.

The `component-showcase.config.js` looks something like this:

```js
module.exports = {
  componentsPath: ['./app/javascript/components/**/*.vue'],
  outputPath: './public/components.html',
  ignoreFileName: ['src/components', 'component.vue'],
  title: 'UI Components',
  verbose: true
  // defaultStylesheet: 'asdf',
  // ignoreComponents: ['ignored']
}
```
