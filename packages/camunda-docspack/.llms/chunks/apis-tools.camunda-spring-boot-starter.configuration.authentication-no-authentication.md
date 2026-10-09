# Configuration — Authentication — No authentication

By default, no authentication will be used.

To explicitly activate this method, you can set:

```yaml
camunda:
  client:
    auth:
      method: none
```

As alternative, do not provide any other property indicating an implicit authentication method.

This will load this preset:

```yaml reference referenceLinkText="Source" title="No authentication"
https://github.com/camunda/camunda/blob/main/clients/camunda-spring-boot-starter/src/main/resources/auth-methods/none.yaml
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
