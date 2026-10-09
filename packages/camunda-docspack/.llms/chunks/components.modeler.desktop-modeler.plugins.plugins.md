# Plugins

Plugins allow you to change the appearance and behavior of Desktop Modeler and add new features.

**Note**
The Desktop Modeler plugins API is not stable and might change in the future.

Plugins allow you to change the appearance and behavior of Desktop Modeler and add new features.


## Plugging into Desktop Modeler

You can plug into the modeler to change its appearance, add new menu entries, extend the modeling tools for [BPMN](https://github.com/bpmn-io/bpmn-js) and [DMN](https://github.com/bpmn-io/dmn-js), or even slot React.js components into the Desktop Modeler UI.

To add a plugin, put it into the `resources/plugins` directory relative to your [`{APP_DATA_DIRECTORY}`](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/plugins/search-paths#app-data-directory) or [`{USER_DATA_DIRECTORY}`](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/plugins/search-paths#user-data-directory) directory.

Desktop Modeler searches for available plugin entry points via the `resources/plugins/*/index.js` pattern. This means that each plugin must reside in its own folder, which is a direct child of the `plugins` directory.

**Note**
If you download and extract plugins from GitHub, the extracted directory contains the actual plugin, so make sure to copy the plugin, not its parent directory.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/plugins/plugins
