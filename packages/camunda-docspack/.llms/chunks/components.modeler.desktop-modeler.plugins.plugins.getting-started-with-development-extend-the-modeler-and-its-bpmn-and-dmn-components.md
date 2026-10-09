# Plugins — Getting started with development — Extend the modeler and its BPMN and DMN components

You can extend the modeling tools for [BPMN](https://github.com/bpmn-io/bpmn-js) and [DMN](https://github.com/bpmn-io/dmn-js) with your own modules, as well as embedding React.js components into certain sections of Desktop Modeler.

Since the client of the modeler uses [Chromium](https://www.chromium.org/Home), you can't use Node.js modules to extend the modeling tools. You need to bundle your plugin first. The easiest way to get started with client-side plugins is through [this example project](https://github.com/camunda/camunda-modeler-plugin-example).

> In this example, we are building a bpmn-js plugin, but this basic structure applies to all extensions besides menu entries and style. The modules themselves will be different however, so refer to our [examples](https://github.com/camunda/camunda-modeler-plugins) for more information on how to build different kinds.

Take the following steps:

1. Clone or fork the repository:

```
git clone https://github.com/camunda/camunda-modeler-plugin-example.git
```

The plugin starter project comes with a menu and style folder which are referenced in the plugin entry point. If you do not need those, you can remove them from the entry point and delete the respective folder.

2. Install the dependencies:

```
npm install
```

3. Create your module:

```javascript
function LoggingPlugin(eventBus) {
  eventBus.on("shape.added", function () {
    console.log("A shape was added to the diagram!");
  });
}

module.exports = {
  __init__: ["loggingPlugin"],
  loggingPlugin: ["type", LoggingPlugin],
};
```

4. Require your file in `client.js` and register it via our [helper functions](https://github.com/camunda/camunda-modeler-plugin-helpers):

```javascript
var registerBpmnJSPlugin =
  require("camunda-modeler-plugin-helpers").registerBpmnJSPlugin;
var plugin = require("./LoggingPlugin");

registerBpmnJSPlugin(plugin);
```

5. You may want to create a plugin which specifically targets Camunda 7 or Camunda 8. To do this, use the appropriate variations of the registration helper function for your plugin type.

```javascript
registerPlatformBpmnJSPlugin(plugin); // Register plugin for Camunda 7 BPMN diagrams only
registerCloudBpmnJSPlugin(plugin); // Register plugin for Camunda 8 BPMN diagrams only
registerBpmnJSPlugin(plugin); // Register plugin for Camunda 7 and 8 BPMN diagrams
```

6. You can use the globally available functions `getModelerDirectory` and `getPluginsDirectory` to load additional resources:

```javascript
function LoggingPlugin(eventBus, canvas) {
  var img = document.createElement(img);
  img.src = getPluginsDirectory + "/logging-plugin/image.png";

  canvas.getContainer().appendChild(img);
}
```

7. Bundle your plugin:

```
npm run build
```

8. Put the folder into the `resources/plugins` directory relative to your Desktop Modeler installation directory. You can now use your plugin!

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/plugins/plugins
