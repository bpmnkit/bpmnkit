# Understand Helm and application configuration responsibilities

Helm configures how and where a Camunda component runs and connects. The application configures what it does. extraConfiguration is the hook between them.

Helm configures how and where a Camunda component runs and connects. The application configures what it does. `<component>.extraConfiguration` is the hook between the two.

Neither layer is more authoritative than the other. They answer different questions, and knowing which question you're asking tells you where a setting belongs.

Starting with Camunda 8.10, chart values that existed only to proxy a single application property are deprecated in favor of `extraConfiguration`. The chart keeps the Kubernetes surface it's responsible for and stops mirroring the application's own configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configuration-responsibilities
