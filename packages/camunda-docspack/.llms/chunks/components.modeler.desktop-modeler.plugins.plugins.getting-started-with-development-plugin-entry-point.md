# Plugins — Getting started with development — Plugin entry point

Regardless of the type of your plugin, you have to export a [Node.js module](https://nodejs.org/api/modules.html) named `index.js` that acts as a plugin entry point. The following shows an example of such entry point:

```javascript
module.exports = {
  name: "My Awesome Plugin", // the name of your plugin
  style: "./style.css", // changing the appearance of the modeler
  menu: "./menu.js", // adding menu entries to the modeler
  script: "./script.js", // extending the modeler, and its BPMN and DMN components
};
```

The modeler will automatically load your plugins on startup.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/plugins/plugins
