# Using Camunda Hub and Desktop Modeler together — Element templates — Handling multiple template versions

| Desktop Modeler                                                                                                                                                                                                                                                                                                                | Camunda Hub                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Detects versions based on separate files. To support multiple versions, maintain different files with distinct names (e.g., `element-template-v1.json`, `element-template-v2.json`). Otherwise, templates may appear as [missing](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/using-templates#missing-templates). | Supports evolving a single template file. Simply update the file and [publish new versions](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/manage-element-templates#publish-an-element-template). |

**Warning**

- Desktop Modeler can have multiple templates defined in a single file, which is good practice when defining multiple versions of the same template.
- Camunda Hub only supports defining one template per file. When you [publish an element template](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/manage-element-templates#publish-an-element-template), you must update the version.

---
Source: https://docs.camunda.io/docs/next/components/modeler/using-hub-and-desktop-modeler-together
