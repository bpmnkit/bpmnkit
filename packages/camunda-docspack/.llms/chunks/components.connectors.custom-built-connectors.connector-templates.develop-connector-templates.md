# Connector templates — Develop connector templates

You can develop connector templates using the [`element template` feature](https://docs.camunda.io/docs/next/components/modeler/element-templates/defining-templates). You can also look at existing [examples](https://github.com/camunda/camunda-modeler/blob/master/resources/element-templates/cloud-samples.json).

If your connector provides several operations, define them with the [`steps` and `presets` keys](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#predefined-configurations-steps-and-presets). Users can then find each operation through search and select it when they apply the template, instead of applying the template first and choosing the operation in a dropdown afterwards.


## Make custom Connector templates available

When using [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index), you can create **Connector templates** [directly within the application](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/element-templates/element-template-generator) and share them with your respective organization. When using [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index), you must place the **Connector templates** [within the file system](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/element-templates/configuring-templates) so Desktop Modeler will pick them up.

Once available, process developers can directly [use the **Connector templates** from within the modeling canvas](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index).

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-templates
