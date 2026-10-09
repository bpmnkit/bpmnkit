# Template metadata — Embedding configurations: `configurationTemplates`

- `configurationTemplates` is an optional key.

An element template embeds the configuration template definitions referenced by its [`Configuration` properties](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties#configuration-input-type) under the top-level `configurationTemplates` key. Each entry defines a configuration template that a `Configuration` property can lock to through its `configurationTemplate` key.

- `configurationTemplates : Array<Object>` lists the embedded configuration templates. Each entry has the following attributes:
  - `id : String` is a required key that uniquely identifies the configuration template. It is referenced by a property's `configurationTemplate`.
  - `name : String` is a required key that defines the configuration template's display name.
  - `version : Integer` is a required key that defines the configuration template's version.
  - `kind : String` is a required key that identifies the kind of configuration, for example `CREDENTIAL`. It determines how the configuration is interpreted and where it can be used. For a worked example of a `CREDENTIAL` template, see [create a credential template](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/credential-templates).
  - `properties : Array<Object>` is a required key that defines the [properties](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties) making up a configuration. Each property defines one field of the configuration's stored value; its `binding` names that field.

```json
{
  ...,
  "configurationTemplates": [
    {
      "id": "io.camunda.examples:connection:1",
      "name": "Connection",
      "version": 1,
      "kind": "CREDENTIAL",
      "properties": [
        {
          "id": "connectionProperty",
          "label": "Connection property",
          "type": "String",
          "binding": { "type": "property", "name": "connectionProperty" }
        }
      ]
    }
  ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata
