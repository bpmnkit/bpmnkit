# Template metadata

Learn about template metadata fields like name, ID, description, keywords, versioning, and JSON schema compatibility.

The metadata of an element template contains important information about the template itself, such as its name, description, version, compatibility with different Camunda versions, and the schema that is used to validate the template.


## Validation: `$schema`

`$schema` is a required key-value pair and must be set.

The application uses the `$schema` property to ensure compatibility for a given element template. You can find [the latest supported versions here](https://www.npmjs.com/package/@camunda/zeebe-element-templates-json-schema).

The JSON schema versioning is backward-compatible, meaning that all versions including or below the current one are supported.

**Info**
Camunda Hub only supports element templates pointing to the latest schema version: `https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json`

The Desktop Modeler ignores element templates defining a higher `$schema` version and logs a warning message.

For example, given the following `$schema` definition, the application takes `0.9.1` as the JSON schema version of the element template:

```json
{
  "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema@0.9.1/resources/schema.json",
  ...
}
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata
