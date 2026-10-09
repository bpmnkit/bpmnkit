# Create a credential template — Secret fields

Mark a credential template field as holding a secret reference with `secret: true`:

```json
{
  "id": "accessKey",
  "label": "Access key",
  "type": "String",
  "secret": true,
  "binding": { "type": "property", "name": "authentication.accessKey" }
}
```

This is a rendering hint for the credential editor in Hub and Desktop Modeler. It doesn't restrict what the field can hold, but it tells the editor to treat entered values as secret references rather than literals. A user enters an existing secret's key, and the editor stores it as `camunda.secrets.<KEY>`. The engine resolves this reference when the job worker or connector task activates; your connector never sees the marker itself, only the resolved value. See [Secret resolution](https://docs.camunda.io/docs/next/components/concepts/secret-resolution) for how `camunda.secrets.<name>` references are resolved.

Your connector cannot create the secret itself from a credential field. The secret must already exist on the cluster. Don't design a credential template that requires a secret your users have no way to create ahead of time.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/credential-templates
