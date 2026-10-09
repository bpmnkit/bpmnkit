# Plugins — Getting started with development — Adding menu entries to the modeler

You can add new menu entries to the modeler's menu.

Describe your menu entries like this:

```javascript
module.exports = function (electronApp, menuState) {
  return [
    {
      label: "Open BPMN Reference",
      accelerator: "CommandOrControl+[",
      enabled: function () {
        // only enabled for BPMN diagrams
        return menuState.bpmn;
      },
      action: function () {
        var shell = require("electron").shell;
        shell.openExternal("https://camunda.org/bpmn/reference/");
      },
    },
  ];
};
```

Plug them into the modeler like this:

```javascript
module.exports = {
  menu: "./menu-entries",
};
```

**Note**
The code within the menu entries executes on [the main process](https://www.electronjs.org/docs/latest/tutorial/process-model) of Electron. This comes with the advantage of allowing you to use [Node.js](https://nodejs.org/en/) modules, but you need to consider that you cannot debug the respective code in Chromium. For more information regarding main process debugging, refer to the [official Electron documentation](https://www.electronjs.org/docs/latest/tutorial/debugging-main-process).

For more information on how the modeler's menu works, take a look at its [implementation](https://github.com/camunda/camunda-modeler/blob/master/app/lib/menu/menu-builder.js).

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/plugins/plugins
