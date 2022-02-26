# Component Showcase

Use Component Showcase to build a standalone page of all of your UI components.

:warning: This is an experiment to see how far I can get without getting too complicated. For now, only Vue components are supported.

## Usage

1. In your repository, add `component-showcase` to your `package.json` file and `yarn add -D component-showcase` or `npm install -D component-showcase`.
1. Next, create `component-showcase.config.js` in the root of your project. See the options [below](#configuration-options).
1. Finally, run `yarn component-showcase` or `yarn run component-showcase` from your project directory. When it's done, you will have a standalone HTML file at your `outputPath`.

## Configuration Options

`component-showcase.config.js` is a configuration file that belongs in the root of your project.

```js
module.exports = {
  componentsPath: ['./app/javascript/components/**/*.vue'], // Where to find your components
  outputPath: './public/components.html', // The final HTML file location
  ignoreFileName: ['src/components', 'component.vue'], // Ignore words in your component paths for prettier names
  title: 'UI Components', // The title of the HTML page
  verbose: true // See the build progress
  stylesheets: ['http://example.com/style.css'], // Stylesheet URLs that will be applied to your components
}
```
