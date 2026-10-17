# Example template — How the example works

The example defines six custom fields, each mapped to different technical properties:

- **Task type**: The value `http` is mapped to the `type` property of a `zeebe:taskDefinition` element in BPMN 2.0 XML. This field is hidden from users since it's a technical requirement.
- **REST Credential**: A [`Configuration`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties#configuration-input-type) property that lets users select or create a connection, locked to the embedded `io.camunda.examples:connection:1` configuration template. The chosen configuration is injected as the `connection` job variable. The referenced configuration template is embedded under the top-level [`configurationTemplates`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#embedding-configurations-configurationtemplates) key.
- **REST Endpoint URL**: Mapped to a `task header` with the key `url`. This field includes validation to ensure it's a valid HTTP(S) URL.
- **REST Method**: Mapped to a `task header` with the key `method`. Uses a dropdown to provide predefined HTTP method options.
- **Request Body**: Mapped to a local variable via an `input parameter` named `body`. This field shown conditionally only.
- **Result Variable**: Mapped into a process variable via an `output parameter`. The response data will be stored in the specified variable name.

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-example
