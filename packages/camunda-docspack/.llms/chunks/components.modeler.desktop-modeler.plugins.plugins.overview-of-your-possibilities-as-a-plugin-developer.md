# Plugins — Overview of your possibilities as a plugin developer

There are many ways for a developer to extend Desktop Modeler and its modeling tools. The following table shows an overview:

| Plugin type            | Functionality                                                                                                              | Example                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Menu Entries           | Add new entries to the menu bar - useful to interact with your plugins, link to external pages, add settings, etc.         | [Menu Example](https://github.com/camunda/camunda-modeler-plugins/tree/master/menu-plugin-example)                                      |
| Custom Styles          | Change the look and feel of Desktop Modeler by adding stylesheets.                                                         | [Styles Example](https://github.com/camunda/camunda-modeler-plugins/tree/master/style-plugin-example)                                   |
| React Components       | Embed custom React.js components into specific anchor points of Desktop Modeler.                                           | [React Plugin Example](https://github.com/pinussilvestrus/camunda-modeler-autosave-plugin)                                              |
| bpmn-js Modules        | Extend our BPMN editor by injecting your own custom [bpmn-js](https://github.com/bpmn-io/bpmn-js) modules.                 | [bpmn-js Module Example](https://github.com/camunda/camunda-modeler-plugins/tree/master/bpmn-js-plugin-example)                         |
| bpmn-moddle Extensions | Extend the BPMN language model by injecting your own custom [bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle) modules. | [bpmn-moddle Extension Example](https://github.com/camunda/camunda-modeler-plugins/tree/master/bpmn-js-plugin-moddle-extension-example) |
| dmn-js Modules         | Extend our DMN editor by injecting your own custom [dmn-js](https://github.com/bpmn-io/dmn-js) modules.                    | [dmn-js Module Example](https://github.com/camunda/camunda-modeler-plugins/tree/master/dmn-js-plugin-example)                           |
| dmn-moddle Extensions  | Extend the DMN language model by injecting your own custom [dmn-moddle](https://github.com/bpmn-io/dmn-moddle) modules     | n/a                                                                                                                                     |
| bpmnlint Plugins       | Add custom lint rules through [bpmnlint](https://github.com/bpmn-io/bpmnlint) plugins                                      | [Custom lint rules](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/plugins/custom-lint-rules)                                                                                               |

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/plugins/plugins
