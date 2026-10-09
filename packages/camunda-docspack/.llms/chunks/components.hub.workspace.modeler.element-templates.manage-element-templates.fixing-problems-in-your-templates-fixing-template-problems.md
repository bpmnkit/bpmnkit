# Manage element templates — Fixing problems in your templates {#fixing-template-problems}

While working on a template, the template will be in invalid intermediate states. For instance, when you add a new property, it must contain various mandatory attributes.

Unless all mandatory attributes are defined, the template will not be saved, and the preview is not updated. This ensures that you can never publish an invalid or broken template.

The editor toolbar indicates if the template is currently in a valid state or not. The JSON editor provides you with error highlighting, allowing you to add mandatory values and resolve problems without missing anything.

![Indicating problems in element templates](img/connector-templates/fix-connector-template-problems-1.png)

If there are problems at the root level of the JSON (such as a missing or misspelled mandatory attribute), the error is highlighted in the first line of the editor. Click the error marker at the curly bracket to expand the error message.

![Some element template problems highlighted in the first line](img/connector-templates/fix-connector-template-problems-2.png)

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/manage-element-templates
