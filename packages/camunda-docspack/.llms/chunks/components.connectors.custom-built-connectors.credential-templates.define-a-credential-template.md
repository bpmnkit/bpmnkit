# Create a credential template — Define a credential template

A credential template has the following top-level fields:

| Field         | Required | Description                                                                                                      |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `id`          | Yes      | Uniquely identifies the credential template. Referenced by a `Configuration` property's `configurationTemplate`. |
| `name`        | Yes      | Display name shown in the credential editor, and the default label for the chooser.                              |
| `version`     | Yes      | An integer. Bump it when the credential's shape changes (see [Versioning](#versioning-a-credential-template)).   |
| `kind`        | Yes      | The kind of configuration. Set this to `CREDENTIAL`.                                                             |
| `description` | No       | Short description shown in the credential editor.                                                                |
| `properties`  | Yes      | The fields that make up the credential's stored value (see below).                                               |

Each property uses the standard [element template property](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties) shape, with three restrictions: only the `property` binding is supported, `type: "Configuration"` is not (a credential cannot embed another credential), and `optional` is not. Leave a field blank instead, and blank fields are omitted from the stored value.

A property's `binding.name` is the key it contributes to the credential's stored value. Use a dotted name, such as `authentication.accessKey`, to nest fields into a sub-object matching the shape your connector expects to receive.

Here is a complete example, an AWS credential with two authentication methods and a region:

```json
{
  "id": "io.camunda:aws-credential:1",
  "name": "AWS Credential",
  "version": 1,
  "kind": "CREDENTIAL",
  "description": "AWS access credentials for S3, Bedrock, and other AWS services",
  "properties": [
    {
      "id": "authType",
      "label": "Authentication type",
      "type": "Dropdown",
      "choices": [
        {
          "name": "Default credentials chain",
          "value": "defaultCredentialsChain"
        },
        { "name": "Access key / Secret key", "value": "credentials" }
      ],
      "binding": { "type": "property", "name": "authentication.type" }
    },
    {
      "id": "accessKey",
      "label": "Access key",
      "type": "String",
      "secret": true,
      "condition": { "property": "authType", "equals": "credentials" },
      "binding": { "type": "property", "name": "authentication.accessKey" }
    },
    {
      "id": "secretKey",
      "label": "Secret key",
      "type": "String",
      "secret": true,
      "condition": { "property": "authType", "equals": "credentials" },
      "binding": { "type": "property", "name": "authentication.secretKey" }
    },
    {
      "id": "region",
      "label": "Region",
      "type": "String",
      "constraints": { "notEmpty": true },
      "binding": { "type": "property", "name": "region" }
    }
  ]
}
```

A user who selects **Access key / Secret key**, fills in both keys, and sets a region produces this stored value:

```json
{
  "authentication": {
    "type": "credentials",
    "accessKey": "camunda.secrets.AWS_ACCESS_KEY",
    "secretKey": "camunda.secrets.AWS_SECRET_KEY"
  },
  "region": "eu-west-1"
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/credential-templates
