# Configuration — Authentication — Basic authentication

You can authenticate with the cluster using Basic authentication, if the cluster is setup to use Basic authentication.

To explicitly activate this method, you can set:

```yaml
camunda:
  client:
    auth:
      method: basic
```

This authentication method will be implied if you set either `camunda.client.auth.username` or `camunda.client.auth.password`.

This will load this preset:

```yaml reference referenceLinkText="Source" title="Basic authentication"
https://github.com/camunda/camunda/blob/main/clients/camunda-spring-boot-starter/src/main/resources/auth-methods/basic.yaml
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
