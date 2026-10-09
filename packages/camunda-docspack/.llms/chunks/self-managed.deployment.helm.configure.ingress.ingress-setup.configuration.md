# Configure the Helm chart with Ingress — Configuration

In this configuration, two Ingress objects are created:

- **Web applications**: One Ingress object for all Camunda 8 web applications using one domain. Each application has a sub-path. For example, `camunda.example.com/operate`, `camunda.example.com/optimize`.
- **Zeebe Gateway**: Another Ingress object using the gRPC protocol for Zeebe Gateway. For example, `zeebe.camunda.example.com`.

By default, all web applications use `/` as a base, so we just need to set the context path, Ingress configuration, and authentication redirect URLs.

**Note**
For Operate, Tasklist, Optimize, Modeler, Connectors, and Console, the Ingress path (`global.identity.auth.<component>.redirectUrl`) must match the `contextPath` for that component.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup
