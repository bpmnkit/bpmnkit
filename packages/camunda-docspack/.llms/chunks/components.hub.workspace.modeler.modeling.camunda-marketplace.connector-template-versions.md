# Camunda Marketplace — Connector template versions

The Camunda Marketplace always serves the **latest** version of a connector template. If that version's [`engines.camunda`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#engine-compatibility-engines) range doesn't cover your cluster version, the connector is listed under **Requires newer Camunda version** and can't be applied to your diagram.

To use an older version, obtain the template file from the connector's source and [upload it as an element template](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/manage-element-templates#importing-an-existing-element-template) yourself. Camunda's built-in connectors publish previous versions in the `element-templates/versioned` directory of the [`camunda/connectors`](https://github.com/camunda/connectors) repository. For partner and community connectors, availability of previous versions depends on the connector creator.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/camunda-marketplace
