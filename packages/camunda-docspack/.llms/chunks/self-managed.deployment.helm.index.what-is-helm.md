# Camunda Helm chart — What is Helm?

[Helm](https://helm.sh/) is a package manager for Kubernetes resources. It lets you install a set of components by referencing a chart name and overriding configurations to suit various deployment scenarios.

Helm also manages dependencies between charts, so that multiple components can be installed and configured with a single command.

For details, see the full list of [Helm values](https://artifacthub.io/packages/helm/camunda/camunda-platform#parameters).


## Reference architecture

For guidance on sizing and deployment patterns, see the [Kubernetes reference architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes).

When you install the [camunda-platform](https://artifacthub.io/packages/helm/camunda/camunda-platform) Helm chart, the default installation includes the Orchestration Cluster components (Zeebe, Operate, Tasklist, and Admin). Other components from the reference architecture, such as Camunda Hub, require additional configuration and an external Identity Provider (IdP).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/index
