# Webserver & security

Configuration settings for the webserver and security across Camunda 8 Self-Managed Orchestration Cluster components.


## Setting a custom context path

All components support customizing the **context-path** using the default Spring configuration.

Example for `application.yml`:

```yaml
server.servlet.context-path: /<component>
```

Example for environment variable:

```
SERVER_SERVLET_CONTEXT_PATH=/<component>
```

The default context-path is `/`.

Replace `<component>` with the identifier for the service (for example, `operate`, `tasklist`, or another component).

**Note**

- The same context-path and security configuration patterns apply across most Camunda 8 Self-Managed components.
- Component-specific property names and defaults may vary. Check each service’s reference documentation for details.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/webserver
