# Configuration — Modes

The Camunda Spring Boot Starter has modes with meaningful defaults aligned with the distribution's default connection details. Each mode is made for a Camunda 8 setup, and only one mode may be used at a time.

**Note**
The defaults applied by the modes are overwritten by _any_ other set property, including legacy/deprecated properties. Check your configuration and logs to avoid unwanted override.

### SaaS

This allows you to connect to a Camunda instance in our SaaS offering as the URLs are templated.

Activate by setting:

```yaml
camunda:
  client:
    mode: saas
```

This applies the following defaults:

```yaml reference referenceLinkText="Source" title="SaaS mode"
https://github.com/camunda/camunda/blob/main/clients/camunda-spring-boot-starter/src/main/resources/modes/saas.yaml
```

The only thing you need to configure then, are the connection details to your Camunda SaaS cluster:

```yaml
camunda:
  client:
    auth:
      client-id: <your client id>
      client-secret: <your client secret>
    cloud:
      cluster-id: <your cluster id>
      region: <your region>
```

Other connectivity configuration does not further apply for the SaaS mode.

### Self-Managed

This allows you to connect to a Self-Managed instance protected with JWT authentication. The default URLs are configured to align with all Camunda distributions using `localhost` addresses.

Activate by setting:

```yaml
camunda:
  client:
    mode: self-managed
```

This applies the following defaults:

```yaml reference referenceLinkText="Source" title="Self-managed mode"
https://github.com/camunda/camunda/blob/main/clients/camunda-spring-boot-starter/src/main/resources/modes/self-managed.yaml
```

For some specific OIDC setups (for example, [Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity)), you might need to define additional properties like `camunda.client.auth.scope` in addition to the defaults provided by the mode, see the [`camunda.client.auth`-Properties reference](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/properties-reference) for a full overview.

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
