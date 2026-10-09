# Import resources into Camunda Hub — How to add files

These are the supported methods you can use to add files to Camunda Hub:

| Method                                                                          | Opens from                          | Import source              | Supported resources                                                       |
| ------------------------------------------------------------------------------- | ----------------------------------- | -------------------------- | ------------------------------------------------------------------------- |
| [**Import**](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/preparing-resources-for-import)                               | Camunda Hub `/import/resources` URL | Any publicly available URL | Any type of resource                                                      |
| [**Browse blueprints**](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/camunda-marketplace#browse-marketplace-blueprints) | Camunda Hub project or folder page  | Camunda Marketplace only   | [Blueprints](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/camunda-marketplace#browse-marketplace-blueprints) only |
| [**Upload files**](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/import-diagram)                                         | Camunda Hub project or folder page  | Any downloaded file        | Any type of resource                                                      |

**Note**

- **Import** and **Browse blueprints**: If the imported resources include at least one BPMN file, Camunda Hub treats them as a project and groups them accordingly.
- **Upload files**: Adds uploaded resources as independent files, regardless of whether BPMN files are present.
- **Browse all**: Use [Browse all](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/browse-all-resources) while modeling to find available resources. Adding a Marketplace connector adds its element templates to the current project.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/importing-resources
