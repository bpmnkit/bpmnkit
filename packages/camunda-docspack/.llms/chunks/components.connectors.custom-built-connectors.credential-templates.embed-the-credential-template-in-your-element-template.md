# Create a credential template — Embed the credential template in your element template

Add the credential template to your connector's element template under the top-level `configurationTemplates` key:

```json
{
  "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
  "name": "My Connector",
  "id": "io.camunda:my-connector:1",
  ...,
  "configurationTemplates": [
    {
      "id": "io.camunda:aws-credential:1",
      "name": "AWS Credential",
      "version": 1,
      "kind": "CREDENTIAL",
      "properties": [ ... ]
    }
  ],
  "properties": [ ... ]
}
```

If more than one connector uses the same credential type, embed the identical `configurationTemplates` entry (same `id` and `version`) in each. The first copy the modeler loads becomes the canonical definition; later copies are only accepted if they match it exactly. If your connector needs to support in-place upgrades of a bound credential to a newer template version, embed both versions. The modeler needs the source version to read the existing value, and the target version to render the upgraded form.

**Tip**
If you build your connector in Java, you don't have to maintain these embedded schemas by hand. The [element template generator](https://github.com/camunda/connectors/tree/main/element-template-generator) generates them from your Java code and inserts them into every element template that needs them.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/credential-templates
