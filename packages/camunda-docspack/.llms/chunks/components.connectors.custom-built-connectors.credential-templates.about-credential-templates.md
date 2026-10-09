# Create a credential template — About credential templates

A **credential template** is a [configuration template](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#embedding-configurations-configurationtemplates) whose `kind` is `CREDENTIAL`. It defines the fields a credential of that type has, and how they render in the credential editor in Camunda Hub and Desktop Modeler.

A credential template is not an element template property. It's a separate, self-contained schema, embedded in your connector's element template under the top-level `configurationTemplates` key. Your connector's element template then declares a `Configuration`-type property that locks to it, which renders as the credential chooser in the properties panel.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/credential-templates
