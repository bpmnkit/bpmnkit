# Create a credential template — Add a credential field to your element template

Declare a `Configuration` property that locks to your credential template, and bind it to your connector's dedicated configuration input:

```json
{
  "id": "awsCredential",
  "label": "AWS Credential",
  "type": "Configuration",
  "group": "authentication",
  "description": "Choose a reusable AWS credential. When set, it is bound as a whole to the connector's 'authentication' input.",
  "configurationTemplate": "io.camunda:aws-credential:1",
  "configurationTemplateVersion": 1,
  "binding": { "type": "zeebe:input", "name": "authentication" }
}
```

- `configurationTemplate` is the credential template's `id`. The modeler only offers credentials created from that template.
- `configurationTemplateVersion` is optional, and is a **floor**, not a fixed version: the minimum credential template version a selected credential must satisfy. A credential at or above this version is always compatible. Omit it if any version of the template is acceptable.
- `binding` uses `zeebe:input` for an outbound connector, or `zeebe:property` for an inbound connector. Point `name` at a dedicated configuration input on your connector, for example `authentication` or `configuration`.

Your connector implementation reads this input as one object, and takes whatever fields it needs from it, the same fields your credential template defines.

For a complete element template that puts both parts together, see the [example template](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-example).

### Supporting inline fields as a fallback

For a new connector, use credentials only: declare the `Configuration` property, mark it `constraints: { "notEmpty": true }`, and don't offer inline authentication fields at all. This keeps one way to authenticate the task, and keeps authentication data out of the diagram.

Inline fallback fields are a backward-compatibility pattern for a connector that already shipped with inline authentication, where existing diagrams must keep working. It isn't automatic: your connector runtime has to resolve which of the two sources to use. If you need it, hide the inline fields once a credential is selected, using an `isEmpty` condition on the chooser property:

```json
{
  "id": "accessKey",
  "type": "String",
  "condition": { "property": "awsCredential", "isEmpty": true }
}
```

Your connector then reads one effective value, preferring the bound credential and falling back to the inline field when no credential is selected. When you are ready to drop the inline fields, remove them in a new element template version and mark the `Configuration` property required. Existing diagrams stay on their earlier version and are unaffected.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/credential-templates
